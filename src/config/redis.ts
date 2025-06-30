import { createClient, type RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient: RedisClientType | null = null;
let isRedisConnected = false;

async function initializeRedisClient(): Promise<RedisClientType | null> {
  if (!redisClient) {
    console.log('Attempting to connect to Redis...');
    redisClient = createClient({
      username: 'default',
      password: '0kFUwq9yOMEuyuBzxwCihPecSrJSZPAC',
      socket: {
        host: 'redis-16367.c334.asia-southeast2-1.gce.redns.redis-cloud.com',
        port: 16367,
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error', err);
      isRedisConnected = false;
      // Potentially try to reconnect or handle error appropriately
      // For now, we'll just log and disable caching if connection fails
      redisClient = null; // Reset client on error to allow re-initialization attempt if desired
    });

    redisClient.on('connect', () => {
      console.log('Redis client connected');
      isRedisConnected = true;
    });

    redisClient.on('end', () => {
      console.log('Redis client connection ended');
      isRedisConnected = false;
    });

    try {
      await redisClient.connect();
    } catch (err) {
      console.error('Failed to connect to Redis during initialization:', err);
      redisClient = null; // Ensure client is null if connect fails
      isRedisConnected = false;
    }
  }
  return redisClient && isRedisConnected ? redisClient : null;
}

export async function getRedisClient(): Promise<RedisClientType | null> {
  if (!redisClient || !isRedisConnected) {
    return await initializeRedisClient();
  }
  return redisClient;
}

// Optional: Graceful shutdown for Redis
export async function closeRedisConnection(): Promise<void> {
  if (redisClient && isRedisConnected) {
    try {
      await redisClient.quit();
      console.log('Redis connection closed gracefully.');
    } catch (err) {
      console.error('Error closing Redis connection:', err);
    } finally {
      redisClient = null;
      isRedisConnected = false;
    }
  }
}
