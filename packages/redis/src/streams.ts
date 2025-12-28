import client from "./client.js";
import type { RedisClient } from "./client.js";

export const PriceUpdatePusher: RedisClient = client.duplicate();
export const enginePuller: RedisClient = client.duplicate();
export const enginePusher: RedisClient = client.duplicate();
export const engineResponsePuller: RedisClient = client.duplicate();
export const httpPusher: RedisClient = client.duplicate();
