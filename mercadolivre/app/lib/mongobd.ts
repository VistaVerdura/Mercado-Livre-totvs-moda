import { MongoClient } from "mongodb";

function getMongoURI(): string {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI não configurada no .env.local");
  }

  return uri;
}

const globalMongo = globalThis as typeof globalThis & {
  mongoClient?: Promise<MongoClient>;
};

export async function connectDB() {
  if (!globalMongo.mongoClient) {
    const client = new MongoClient(getMongoURI());
    globalMongo.mongoClient = client.connect();
  }

  const client = await globalMongo.mongoClient;

  return client.db(process.env.MONGODB_DB || "integrador_totvs");
}