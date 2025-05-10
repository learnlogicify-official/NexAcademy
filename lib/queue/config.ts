import Queue from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';

// Configure Upstash Redis connection for Bull
const redisConfig = {
  // Option 1: Using TCP connection
  redis: {
    port: parseInt(process.env.UPSTASH_REDIS_PORT || '6379'),
    host: process.env.UPSTASH_REDIS_HOST,
    password: process.env.UPSTASH_REDIS_PASSWORD,
    tls: { rejectUnauthorized: false }, // Required for Upstash Redis
    maxRetriesPerRequest: 3,
    enableReadyCheck: false, // Recommended for serverless environments
  },
  // Option 2: Using connection string (alternative)
  // url: process.env.UPSTASH_REDIS_URL,
  
  // Bull-specific settings optimized for Upstash
  settings: {
    lockDuration: 30000, // 30 seconds
    stalledInterval: 30000, // How often check for stalled jobs
    maxStalledCount: 2, // Max number of times a job can be marked as stalled
    guardInterval: 5000, // How often check for completed jobs
  }
};

// Create queues
export const statsQueue = new Queue('statistics-processing', redisConfig);
export const dataExportQueue = new Queue('data-export', redisConfig);

// Configure Bull Board (admin UI)
export const setupBullBoard = (app: any) => {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  
  createBullBoard({
    queues: [
      new BullAdapter(statsQueue),
      new BullAdapter(dataExportQueue)
    ],
    serverAdapter,
  });
  
  // Add authentication middleware for the Bull Board
  app.use('/admin/queues', (req: any, res: any, next: any) => {
    // Check if user is authenticated and is an admin
    const session = req.session;
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return res.status(403).send('Unauthorized');
    }
    next();
  }, serverAdapter.getRouter());
};

// Process cleanup on application shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down queues...');
  await statsQueue.close();
  await dataExportQueue.close();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);