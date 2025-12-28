import { MongoClient } from 'mongodb';

const DB_NAME = 'exness';

const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) {
  throw new Error('MONGODB_URL environment variable is not set');
}

// Only use SSL for non-localhost connections
const isLocalhost = MONGODB_URL.includes('localhost') || MONGODB_URL.includes('127.0.0.1');

export const mongodbClient = new MongoClient(MONGODB_URL, {
  ...(isLocalhost ? {} : {
    ssl: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  }),
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority'
});

await mongodbClient.connect();
export const mongodb = mongodbClient.db(DB_NAME);
export type TypeOfMongoClient = MongoClient;