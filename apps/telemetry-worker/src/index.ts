import "dotenv/config";
import { Redis } from "ioredis";
import { Kafka, logLevel } from "kafkajs";
import postgres from "postgres";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const brokers = (process.env.KAFKA_BROKERS ?? "localhost:9092").split(",");
const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://sfms:sfms@localhost:5432/sfms";

const redis = new Redis(redisUrl, { lazyConnect: true });
const sql = postgres(databaseUrl, { max: 5 });

const kafka = new Kafka({
  clientId: "sfms-telemetry-worker",
  brokers,
  logLevel: logLevel.ERROR,
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "sfms-telemetry-group" });

async function drainRedisBuffers() {
  for (const key of [
    "kafka:buffer:vehicle-telemetry",
    "kafka:buffer:obd-data",
  ]) {
    const batch = await redis.lrange(key, 0, 99);
    if (!batch.length) continue;
    const messages = batch.map((value) => ({ value }));
    const topic =
      key.includes("obd") ? "obd-data" : "vehicle-telemetry";
    try {
      await producer.send({ topic, messages });
      await redis.ltrim(key, batch.length, -1);
    } catch (err) {
      console.warn("kafka publish failed", (err as Error).message);
    }
  }
}

async function main() {
  await redis.connect().catch(() => console.warn("redis missing"));
  try {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({
      topics: ["vehicle-telemetry", "obd-data", "alerts"],
      fromBeginning: false,
    });
    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) return;
        const event = JSON.parse(message.value.toString()) as Record<
          string,
          unknown
        >;
        if (topic === "vehicle-telemetry" && event.vehicleId) {
          // already written by gateway batch; worker can enrich
          await redis.set(
            `vehicle:${event.vehicleId}:streamed`,
            "1",
            "EX",
            60,
          );
        }
      },
    });
    console.log("telemetry-worker kafka consumer up");
  } catch (err) {
    console.warn("kafka unavailable — redis drain only", (err as Error).message);
  }

  setInterval(() => {
    void drainRedisBuffers();
  }, 2000);

  // Timescale retention helper ping
  setInterval(async () => {
    try {
      await sql`SELECT 1`;
    } catch {
      // ignore
    }
  }, 30000);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
