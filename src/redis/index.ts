import { createClient } from 'redis';

const redis = await createClient({ url: process.env.REDIS_URL }).connect();

export async function GET(key: string) {
  const value = await redis.get(key)

  return value
}