import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.DB_NAME || "hris";

function getClientPromise() {
  if (!mongoUri) {
    throw new Error("MONGODB_URI belum diset di environment variables.");
  }
  if (!globalThis._hrisMongoClientPromise) {
    globalThis._hrisMongoClientPromise = new MongoClient(mongoUri).connect();
  }
  return globalThis._hrisMongoClientPromise;
}

export async function getStateCollection() {
  const client = await getClientPromise();
  return client.db(databaseName).collection("appstate");
}
