import { Redis } from "ioredis";
import { env } from "../env.js";

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 2,
  lazyConnect: true,
});

redis.on("error", (err: Error) => {
  console.warn("[redis]", err.message);
});
