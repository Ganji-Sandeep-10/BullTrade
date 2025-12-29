import express, { Router } from 'express';
import {
  closeOrder,
  createOrder,
  fetchCloseOrders,
  fetchOpenOrders,
  fetchCandlesticks,
} from '../controller/trade.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const tradeRouter: Router = express.Router();

tradeRouter.post('/create-order', authMiddleware, createOrder);
tradeRouter.post('/close-order', authMiddleware, closeOrder);
tradeRouter.get('/get-open-orders', authMiddleware, fetchOpenOrders);
tradeRouter.get('/get-close-orders', authMiddleware, fetchCloseOrders);
tradeRouter.get('/candlesticks', authMiddleware, fetchCandlesticks);

export default tradeRouter;
