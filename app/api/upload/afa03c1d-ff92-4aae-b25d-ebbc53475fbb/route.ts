import { put, del, list } from "@vercel/blob";
import { getRedis } from "@/app/lib/redis";

export async function POST(req: Request) {

  if ("afa03c1d-ff92-4aae-b25d-ebbc53475fbb" !== process.env.UPLOAD_TOKEN) {
    return new Response("Forbidden", { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file") as File;

  if (!file) {
    return Response.json({ error: "no file" }, { status: 400 });
  }

  // upload blob
  const blob = await put(crypto.randomUUID()+".mp4", file, {
    access: "public"
  });

  try {
    const redis = await getRedis();
    const raw = await redis.get("videos");
    const videos: Array<{ url: string; createdAt: number; size: number }> = raw ? JSON.parse(raw) : [];

    videos.push({
      url: blob.url,
      createdAt: Date.now(),
      size: file.size
    });

    // quota = 3 vidéos max
    while (videos.length > 3) {
      const old = videos.shift();
      if (old) {
        await del(old.url);
      }
    }

    await redis.set("videos", JSON.stringify(videos));
  } catch (e) {
    console.error("Redis error:", e);

    // Fallback: enforce quota directly from Blob storage
    try {
      const { blobs } = await list();
      const videos = blobs
        .filter((b) => /\.(mp4|mov|webm|mkv|avi)$/i.test(b.pathname))
        .sort(
          (a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );

      const toDelete = videos.slice(3);
      for (const old of toDelete) {
        await del(old.url);
      }
    } catch (cleanupError) {
      console.error("Blob cleanup fallback error:", cleanupError);
    }
  }

  return Response.json({ url: blob.url });
}