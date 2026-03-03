import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });

const client = new PrismaClient({ adapter });

export type { User, ExistingTrade } from "./generated/prisma/client";
export default client;