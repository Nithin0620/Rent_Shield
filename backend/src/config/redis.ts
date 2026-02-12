import IORedis from "ioredis";

const getEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not defined`);
  }
  return value;
};

export const redisConnection = new IORedis(getEnv("REDIS_URL"));
