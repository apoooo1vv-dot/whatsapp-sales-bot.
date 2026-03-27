import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error('❌ REDIS_URL environment variable is required');
  process.exit(1);
}

export const redis = new Redis(redisUrl, {
  retryStrategy: (times) => Math.min(times * 100, 3000),
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true
});

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => console.error('❌ Redis error:', err));
redis.on('reconnecting', () => console.log('🔄 Redis reconnecting...'));

export const sessionKey = (phone) => `session:${phone}`;

export async function getSession(phone) {
  try {
    const data = await redis.get(sessionKey(phone));
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Redis get error:', err);
    return null;
  }
}

export async function setSession(phone, session, ttl = 86400) {
  try {
    await redis.setex(sessionKey(phone), ttl, JSON.stringify(session));
    return true;
  } catch (err) {
    console.error('Redis set error:', err);
    return false;
  }
}

export async function clearSession(phone) {
  try {
    await redis.del(sessionKey(phone));
    return true;
  } catch (err) {
    console.error('Redis clear error:', err);
    return false;
  }
}
