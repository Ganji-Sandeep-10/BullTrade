import { httpPusher } from './streams.js';

const MAX_STREAM_LENGTH = 1000; // Maximum number of messages to keep in the stream

async function ensureConnected() {
  if (!httpPusher.isOpen) {
    await httpPusher.connect();
  }
}

export async function addToStreamWithTrim(
  streamKey: string,
  id: string,
  message: Record<string, any>,
  maxLength: number = MAX_STREAM_LENGTH
): Promise<string> {
  await ensureConnected();
  // First add the message with MAXLEN ~ to trim the stream
  // The ~ means it's an approximate trim, which is more efficient
  const result = await httpPusher.xAdd(
    streamKey,
    id,
    message,
    {
      TRIM: {
        strategy: 'MAXLEN',
        strategyModifier: '~',
        threshold: maxLength,
        limit: 100 // Process up to 100 entries at a time for trimming
      }
    }
  );
  
  return result;
}
