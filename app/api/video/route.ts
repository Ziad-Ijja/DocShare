import { getRedis } from "@/app/lib/redis";
import { list } from "@vercel/blob";

export async function GET() {
  try {
    const redis = await getRedis();
    const raw = await redis.get("videos");
    const videos: Array<{ url: string; createdAt: number; size: number }> = raw ? JSON.parse(raw) : [];
    return Response.json(videos);
  } catch (e) {
    console.error("Redis error:", e);

    try {
      const { blobs } = await list();

      const videos = blobs
        .filter((b) => /\.(mp4|mov|webm|mkv|avi)$/i.test(b.pathname))
        .sort(
          (a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        )
        .slice(0, 3)
        .map((b) => ({
          url: b.url,
          createdAt: new Date(b.uploadedAt).getTime(),
          size: b.size,
        }));

      return Response.json(videos);
    } catch {
      return Response.json([]);
    }
  }
}