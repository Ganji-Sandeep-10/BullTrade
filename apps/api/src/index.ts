import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mainRouter from './routes/index.js';
import { httpPusher } from '@exness-v3/redis/streams';
import { initEngineResponseSubscriber } from './services/redis_service.js';

const PORT = process.env.PORT || 3000;

const app = express();

// Connect Redis once at startup
await httpPusher.connect();
await initEngineResponseSubscriber();

app.use(express.json());

// ✅ Open CORS (safe since you are NOT using cookies)
const corsOptions: cors.CorsOptions = {
  origin: true,
  credentials: true,
};

app.use(cors(corsOptions));

// ✅ Handle preflight requests
app.options('*', cors(corsOptions));

app.use('/api/v1', mainRouter);

app.listen(PORT, () => {
  console.log('Server started on port', PORT);
});
