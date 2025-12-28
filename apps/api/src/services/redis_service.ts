import { subscriber } from '@exness-v3/redis/pubsub';

type PendingRequest<T> = {
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
  timeout: NodeJS.Timeout;
};

const inflightRequests = new Map<string, PendingRequest<any>>();

let subscribePromise: Promise<void> | null = null;

export async function initEngineResponseSubscriber() {
  if (subscribePromise) return subscribePromise;

  subscribePromise = (async () => {
    if (!subscriber.isOpen) {
      await subscriber.connect();
    }

    await subscriber.subscribe('engine:response', (rawMessage: string) => {
      let msg: any;
      try {
        msg = JSON.parse(rawMessage);
      } catch {
        return;
      }

      const requestId: string | undefined = msg?.requestId;
      if (!requestId) return;

      const pending = inflightRequests.get(requestId);
      if (!pending) return;

      clearTimeout(pending.timeout);
      inflightRequests.delete(requestId);

      const reqType = msg?.type;
      const payload = msg?.data ?? {};

      switch (reqType) {
        case 'USER_CREATED_SUCCESS':
        case 'TRADE_OPEN_ACKNOWLEDGEMENT':
        case 'TRADE_CLOSE_ACKNOWLEDGEMENT':
        case 'GET_BALANCE_ACKNOWLEDGEMENT':
        case 'TRADE_FETCH_ACKNOWLEDGEMENT':
        case 'CANDLESTICK_FETCH_ACKNOWLEDGEMENT':
        case 'USER_ALREADY_EXISTS':
          pending.resolve(payload);
          break;

        case 'USER_CREATION_FAILED':
        case 'USER_CREATION_ERROR':
        case 'TRADE_OPEN_FAILED':
        case 'TRADE_OPEN_ERROR':
        case 'GET_BALANCE_FAILED':
        case 'GET_BALANCE_ERROR':
        case 'TRADE_CLOSE_FAILED':
        case 'TRADE_SLIPPAGE_MAX_EXCEEDED':
        case 'TRADE_FETCH_FAILED':
        case 'CANDLESTICK_FETCH_ERROR':
        case 'SOMETHING_WENT_WRONG':
          pending.reject(payload);
          break;

        default:
          pending.reject({ reason: 'UNKNOWN_ENGINE_RESPONSE', type: reqType });
          break;
      }
    });
  })().catch((err) => {
    subscribePromise = null;
    throw err;
  });

  return subscribePromise;
}

export async function waitForEngineResponse(
  requestId: string,
  replyTo: string,
  timeoutMs: number = 3500
) {
  void replyTo;
  await initEngineResponseSubscriber();

  return await new Promise<any>((resolve, reject) => {
    const timeout = setTimeout(() => {
      inflightRequests.delete(requestId);
      reject({ reason: 'ENGINE_TIMEOUT' });
    }, timeoutMs);

    inflightRequests.set(requestId, {
      timeout,
      resolve: (value) => {
        clearTimeout(timeout);
        inflightRequests.delete(requestId);
        resolve(value);
      },
      reject: (reason) => {
        clearTimeout(timeout);
        inflightRequests.delete(requestId);
        reject(reason);
      },
    });
  });
}

export function cancelEngineResponseWait(requestId: string) {
  const pending = inflightRequests.get(requestId);
  if (!pending) return;

  clearTimeout(pending.timeout);
  inflightRequests.delete(requestId);
}