import { publisher } from '@exness-v3/redis/pubsub';

(async () => {
  if (!publisher.isOpen) {
    await publisher.connect();
  }
})();

export async function sendResponse(
  replyTo: string,
  requestId: string,
  type: string,
  payload: Record<string, any> = {}
) {
  try {
    void replyTo;

    const status =
      typeof type === 'string' && (type.endsWith('_ACKNOWLEDGEMENT') || type.endsWith('_SUCCESS'))
        ? 'SUCCESS'
        : 'FAILURE';

    const message = {
      requestId,
      status,
      type,
      data: {
        ...payload,
      },
    };

    await publisher.publish('engine:response', JSON.stringify(message));
  } catch (err) {
    console.error(
      `[Engine Response Error] Failed to send response for request ID ${requestId}:`,
      err
    );
  }
}