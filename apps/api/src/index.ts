import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mainRouter from './routes/index.js';
import { httpPusher } from '@exness-v3/redis/streams';
import { initEngineResponseSubscriber } from './services/redis_service.js';

const PORT = process.env.PORT || 3000;

// Startup env sanity check
console.log('🔐 JWT_SECRET loaded:', !!process.env.JWT_SECRET);
console.log('🗄️ DATABASE_URL loaded:', !!process.env.DATABASE_URL);
console.log('🔴 REDIS_URL loaded:', !!process.env.REDIS_URL);

const app = express();

// Connect Redis once at startup
// If Redis is down/misconfigured, don't block the HTTP server from starting.
try {
  await httpPusher.connect();
  await initEngineResponseSubscriber();
} catch (err) {
  console.error('Redis init failed (API will still start, but engine features may be unavailable):', err);
}

app.use(express.json());

app.use(cors());

app.use('/api/v1', mainRouter);

app.listen(PORT, () => {
  console.log('Server started on port', PORT);
});
