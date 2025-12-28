import type { Request, Response } from 'express';
import { cancelEngineResponseWait, waitForEngineResponse } from '../services/redis_service.js';
import { addToStreamWithTrim } from '@exness-v3/redis/stream-utils';
import { closeOrderSchema, openOrderSchema } from '../validations/orderSchema.js';
import { randomUUID } from 'crypto';
import dbClient from '@exness-v3/db';
import { createUserInEngine } from '../services/engine_service.js';

export const CREATE_ORDER_QUEUE = 'stream:engine';

const ENGINE_STREAM_MAXLEN = Number(process.env.ENGINE_STREAM_MAXLEN ?? 50000);

async function syncUserToEngine(email: string | undefined) {
  if (!email) return;
  const user = await dbClient.user.findFirst({
    where: { email },
    select: { id: true, email: true, password: true, balance: true },
  });
  if (!user) return;
  await createUserInEngine(user as any);
}

export async function createOrder(req: Request, res: Response) {
  const { success, data, error } = openOrderSchema.safeParse(req.body);

  if (!success) {
    res.status(400).json({ error: error.flatten().fieldErrors });
    return;
  }

  const {
    asset,
    leverage,
    quantity,
    slippage,
    side,
    stopLoss,
    takeProfit,
    tradeOpeningPrice,
  } = data;
  try {
    const sendToEngine = async () => {
      const requestId = randomUUID();
      const replyTo = `stream:engine:response:${requestId}`;

      const payload = {
        type: 'CREATE_ORDER',
        requestId: requestId,
        replyTo,
        data: JSON.stringify({
          email: req.user,
          trade: {
            id: randomUUID(),
            asset,
            quantity,
            side,
            leverage,
            slippage,
            stopLoss,
            takeProfit,
            tradeOpeningPrice,
          },
        }),
      };

      const responsePromise = waitForEngineResponse(requestId, replyTo);
      try {
        await addToStreamWithTrim(CREATE_ORDER_QUEUE, '*', payload, ENGINE_STREAM_MAXLEN);
      } catch (err) {
        cancelEngineResponseWait(requestId);
        throw err;
      }
      const { tradeDetails } = await responsePromise;
      return tradeDetails;
    };

    try {
      const tradeDetails = await sendToEngine();
      res.status(201).json({
        message: 'Order placed',
        trade: tradeDetails,
      });
      return;
    } catch (err: any) {
      const engineMessage = err?.reason || err?.message;
      if (engineMessage === 'User not found') {
        await syncUserToEngine(req.user);
        const tradeDetails = await sendToEngine();
        res.status(201).json({
          message: 'Order placed',
          trade: tradeDetails,
        });
        return;
      }
      throw err;
    }
  } catch (err: any) {
    if (err?.reason === 'ENGINE_TIMEOUT') {
      res.status(504).json({ message: 'Engine timeout. Please try again.' });
      return;
    }

    const engineMessage = err?.reason || err?.message;
    if (engineMessage) {
      const status =
        engineMessage === 'User not found'
          ? 404
          : typeof engineMessage === 'string' && engineMessage.includes('Price for asset')
            ? 503
            : 400;
      res.status(status).json({ message: engineMessage, details: err });
      return;
    }

    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function closeOrder(req: Request, res: Response) {
  const { success, data } = closeOrderSchema.safeParse(req.body);

  if (!success) {
    res.status(400).json({ message: 'Orderid id missing ' });
    return;
  }

  const { orderId } = data;

  const requestId = randomUUID();
  const replyTo = `stream:engine:response:${requestId}`;

  const payload = {
    type: 'CLOSE_ORDER',
    requestId: requestId,
    replyTo,
    data: JSON.stringify({
      email: req.user,
      orderId: orderId,
    }),
  };

  const responsePromise = waitForEngineResponse(requestId, replyTo);
  try {
    await addToStreamWithTrim(CREATE_ORDER_QUEUE, '*', payload, ENGINE_STREAM_MAXLEN);
  } catch (err) {
    cancelEngineResponseWait(requestId);
    throw err;
  }

  try {
    await responsePromise;

    res.status(201).json({
      message: 'Order closed',
    });
  } catch (err: any) {
    if (err?.reason === 'ENGINE_TIMEOUT') {
      res.status(504).json({ message: 'Engine timeout. Please try again.' });
      return;
    }

    const engineMessage = err?.reason || err?.message;
    if (engineMessage) {
      res.status(400).json({ message: engineMessage, details: err });
      return;
    }

    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function fetchOpenOrders(req: Request, res: Response) {
  const email = req.user;

  try {
    const sendToEngine = async () => {
      const requestId = randomUUID();
      const replyTo = `stream:engine:response:${requestId}`;
      const payload = {
        type: 'FETCH_OPEN_ORDERS',
        requestId: requestId,
        replyTo,
        data: JSON.stringify({
          email: email,
        }),
      };
      const responsePromise = waitForEngineResponse(requestId, replyTo);
      try {
        await addToStreamWithTrim(CREATE_ORDER_QUEUE, '*', payload, ENGINE_STREAM_MAXLEN);
      } catch (err) {
        cancelEngineResponseWait(requestId);
        throw err;
      }
      const { orders } = await responsePromise;
      return orders;
    };

    try {
      const orders = await sendToEngine();
      res.status(200).json({ orders });
      return;
    } catch (err: any) {
      const engineMessage = err?.reason || err?.message;
      if (engineMessage === 'User not found') {
        await syncUserToEngine(email);
        const orders = await sendToEngine();
        res.status(200).json({ orders });
        return;
      }
      throw err;
    }
  } catch (err) {
    const anyErr = err as any;
    if (anyErr?.reason === 'ENGINE_TIMEOUT') {
      res.status(504).json({ message: 'Engine timeout. Please try again.' });
      return;
    }

    const engineMessage = anyErr?.reason || anyErr?.message;
    if (engineMessage) {
      res.status(400).json({ message: engineMessage, details: anyErr });
      return;
    }

    console.error('Error fetching open orders:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function fetchCloseOrders(req: Request, res: Response) {
  const email = req.user;

  try {
    const user = await dbClient.user.findFirst({
      where: { email: email as string },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const orders = await dbClient.existingTrade.findMany({
      where: {
        userId: user.id,
      },
    });

    res.status(200).json({ orders });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function fetchCandlesticks(req: Request, res: Response) {
  try {
    const { symbol, timeframe } = req.query;

    if (!symbol || !timeframe) {
      res.status(400).json({ error: 'Symbol and timeframe are required' });
      return;
    }

    const requestId = randomUUID();
    const replyTo = `stream:engine:response:${requestId}`;
    const payload = {
      type: 'FETCH_CANDLESTICKS',
      requestId: requestId,
      replyTo,
      data: JSON.stringify({
        symbol: symbol as string,
        timeframe: timeframe as string,
      }),
    };

    const responsePromise = waitForEngineResponse(requestId, replyTo);
    try {
      await addToStreamWithTrim(CREATE_ORDER_QUEUE, '*', payload, ENGINE_STREAM_MAXLEN);
    } catch (err) {
      cancelEngineResponseWait(requestId);
      throw err;
    }
    const { candlesticks } = await responsePromise;

    res.status(200).json({ candlesticks });
  } catch (err) {
    const anyErr = err as any;
    if (anyErr?.reason === 'ENGINE_TIMEOUT') {
      res.status(504).json({ message: 'Engine timeout. Please try again.' });
      return;
    }

    const engineMessage = anyErr?.reason || anyErr?.message;
    if (engineMessage) {
      res.status(400).json({ message: engineMessage, details: anyErr });
      return;
    }

    console.error('Error fetching candlesticks:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}