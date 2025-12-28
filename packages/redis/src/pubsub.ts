import redisClient from "./client.js";
import type { RedisClient } from "./client.js";

export const publisher: RedisClient = redisClient.duplicate();
export const subscriber: RedisClient = redisClient.duplicate();
