import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;
let connectPromise: Promise<RedisClientType> | null = null;

export async function getRedis(): Promise<RedisClientType> {
  if (client?.isReady || client?.isOpen) return client;

  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error("REDIS_URL is not set");

    const c =
      client ??
      createClient({
        // Keep the URL protocol as provided (redis:// or rediss://)
        url,
        socket: {
          connectTimeout: 10_000,
          reconnectStrategy: () => false,
        },
      });

    if (!client) {
      c.on("error", (err) => console.error("Redis error:", err));
    }

    client = c;

    if (c.isReady || c.isOpen) {
      return c;
    }

    try {
      await c.connect();
      return c;
    } catch (error) {
      try {
        if (c.isOpen) {
          await c.quit();
        }
      } catch {
        // ignore cleanup errors
      }

      client = null;
      throw error;
    } finally {
      connectPromise = null;
    }
  })();

  return connectPromise;
}
