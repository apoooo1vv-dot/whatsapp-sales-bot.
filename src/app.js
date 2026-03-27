import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

import { prisma, seedPackages } from './config/database.js';
import { redis } from './config/redis.js';
import webhookRoutes from './routes/webhook.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  message: { error: 'Too many requests, please try again later' }
});
app.use('/webhook', limiter);

// Routes
app.use('/webhook', webhookRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'WhatsApp Sales Bot',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      webhook: '/webhook/wasender',
      health: '/webhook/health'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

// Start server
async function startServer() {
  try {
    // Test database
    await prisma.$connect();
    console.log('✅ Database connected (PostgreSQL)');
    
    // Seed packages
    await seedPackages();
    
    // Test Redis
    await redis.ping();
    console.log('✅ Redis connected (Session store)');
    
    // Log configuration status
    console.log(`🔑 OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '⚠️ Fallback mode (add OPENAI_API_KEY for AI)'}`);
    console.log(`📱 Wasender: ${process.env.WASENDER_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    
    // Start listening
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📡 Webhook URL: https://your-domain.railway.app/webhook/wasender`);
      console.log(`🏥 Health Check: https://your-domain.railway.app/webhook/health\n`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\nSIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});
