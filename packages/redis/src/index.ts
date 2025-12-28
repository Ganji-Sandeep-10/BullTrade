import redisClient, { client as namedClient } from "./client.js";
export type { RedisClient } from "./client.js";

export const client = namedClient;
export default redisClient;

export * from "./streams";
export * from "./stream-utils";
