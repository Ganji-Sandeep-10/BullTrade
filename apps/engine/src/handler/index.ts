import {
    handleOpenTrade,
    handleCloseTrade,
    handlePriceUpdateEntry,
    handleFetchOpenOrders,
    handleFetchCandlesticks,
  } from './order.handler';
  import { handleGetUserBalance, handleUserCreation } from './user.handler';
  
  export async function processMessage(message: any) {
    const requestId = message.message.requestId;
    const replyTo = message.message.replyTo;
    const requestType = message.message.type;
    const payload = JSON.parse(message.message.data);
    try {
      switch (requestType) {
        case 'USER_CREATED':
          await handleUserCreation(payload, requestId, replyTo);
          break;
        case 'CREATE_ORDER':
          await handleOpenTrade(payload, requestId, replyTo);
          break;
        case 'CLOSE_ORDER':
          await handleCloseTrade(payload, requestId, replyTo);
          break;
        case 'PRICE_UPDATE':
          if (payload && typeof payload === 'object' && typeof payload.data === 'string') {
            if (payload.data === 'undefined') {
              break;
            }

            try {
              const priceData = JSON.parse(payload.data);
              await handlePriceUpdateEntry(priceData);
            } catch (error) {
              // Silently ignore parsing errors - some messages may be malformed
            }
            break;
          }

          if (payload && typeof payload === 'object') {
            await handlePriceUpdateEntry(payload);
          }
          break;
        case 'GET_USER_BALANCE':
          await handleGetUserBalance(payload, requestId, replyTo);
          break;
        case 'FETCH_OPEN_ORDERS':
          await handleFetchOpenOrders(payload, requestId, replyTo);
          break;
        case 'FETCH_CANDLESTICKS':
          await handleFetchCandlesticks(payload, requestId, replyTo);
          break;
        default:
          console.log(`[HANDLER] Unknown event type: ${requestType}`);
      }
    } catch (error) {
      console.error(`[HANDLER] Error processing ${requestType}:`, error);
      throw error;
    }
  }