import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mainRouter from './routes/index.js';
import cookieParser from 'cookie-parser';
import { httpPusher } from '@exness-v3/redis/streams';
import { initEngineResponseSubscriber } from './services/redis_service.js';

const PORT = process.env.PORT || 3000;

const app = express();

const ALLOWED_ORIGINS = [
  'https://app.sandeep.live',
  'https://www.sandeep.live',
  'http://localhost:5173',
]
// Connect Redis once at starting up
await httpPusher.connect();

// Subscribe once to engine responses (Pub/Sub)
await initEngineResponseSubscriber();

app.use(express.json());
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);

app.use(cookieParser());

app.use('/api/v1', mainRouter);

app.listen(PORT, () => {
  console.log('Server started');
});