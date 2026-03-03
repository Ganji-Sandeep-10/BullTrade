import express, { Router } from 'express';
import { signInVerify, signupHandler } from '../controller/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const authRouter: Router = express.Router();

authRouter.post('/signup', signupHandler);
authRouter.post('/signin', signInVerify)


authRouter.get('/health', (req, res) => {
    console.log("server is running fine")
    res.json({})
})

export default authRouter;