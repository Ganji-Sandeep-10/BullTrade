import express, { Router } from 'express';
import authRouter from './auth.route.js';
import tradeRouter from './trade.route.js';
import balanceRouter from './balance.route.js';
// import assetsRouter from './assets.route';

const mainRouter: Router = express.Router();

mainRouter.use('/auth', authRouter);
mainRouter.use('/trade', tradeRouter);
mainRouter.use('/balance', balanceRouter);
// mainRouter.use('/assets', assetsRouter);

export default mainRouter;