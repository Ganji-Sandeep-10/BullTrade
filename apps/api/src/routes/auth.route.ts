import express, { Router } from 'express';
import { signInVerify, signupHandler } from '../controller/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import dbClient from '@exness-v3/db';

const authRouter: Router = express.Router();

authRouter.post('/signup', signupHandler);
authRouter.post('/signin', signInVerify)


authRouter.get('/health', (req, res) => {
    console.log("server is running fine")
    res.json({})
})

// Temporary debug endpoint to inspect env and DB connectivity
authRouter.post('/debug-signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🔐 JWT_SECRET at runtime:', !!process.env.JWT_SECRET);
        console.log('🔍 Received signin request for:', email);
        const user = await dbClient.user.findFirst({ where: { email } });
        console.log('🔍 DB user lookup result:', !!user);
        res.json({ jwtLoaded: !!process.env.JWT_SECRET, userFound: !!user });
    } catch (err: any) {
        console.error('🚨 Debug signin error:', err);
        res.status(500).json({ error: err?.message || String(err) });
    }
});

export default authRouter;