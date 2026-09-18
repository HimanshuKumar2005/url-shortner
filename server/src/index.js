import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import { Url } from './models/Url.js';
import { User } from './models/User.js';
import { RangeAllocator } from './services/rangeAllocator.js';
import { createCache } from './services/cache.js';
import { createUrlController } from './controllers/urlController.js';
import { createApiRouter } from './routes/apiRoutes.js';
import { createRedirectRouter } from './routes/redirectRoutes.js';
import { createAuthController } from './controllers/authController.js';
import { optionalAuth, requireAuth } from './middleware/auth.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redis.on('error', (error) => console.error('Redis error:', error.message));

app.use(cors());
app.use(express.json({ limit: '10kb' }));

const allocator = new RangeAllocator(redis, Number(process.env.ID_RANGE_SIZE || 1_000_000));
const cache = createCache(redis, Number(process.env.CACHE_TTL_SECONDS || 86400));
const urlController = createUrlController({ Url, allocator, cache, baseUrl });
const authController = createAuthController({ User });

app.use('/api', createApiRouter({ urlController, authController, optionalAuth, requireAuth }));
app.use('/', createRedirectRouter({ urlController }));

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: 'Something went wrong' });
});

async function start() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/url_shortner');
  await redis.connect();
  app.listen(port, () => console.log(`URL Shortner API listening on ${baseUrl}`));
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
