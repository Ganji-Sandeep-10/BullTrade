import express, { Router } from 'express';
import { getUserBalance } from '../controller/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const balanceRouter: Router = express.Router();

balanceRouter.get('/me', authMiddleware, getUserBalance);

export default balanceRouter;