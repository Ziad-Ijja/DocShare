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

  // Source of truth: Blob storage
  // Keep only the 3 most recent videos and delete older ones from Blob.
  const { blobs } = await list();
  const videos = blobs
    .filter((b) => /\.(mp4|mov|webm|mkv|avi)$/i.test(b.pathname))
    .sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

  const kept = videos.slice(0, 3).map((b) => ({
    url: b.url,
    createdAt: new Date(b.uploadedAt).getTime(),
    size: b.size,
  }));

  const toDelete = videos.slice(3);
  for (const old of toDelete) {
    await del(old.url);
  }

  // Best effort: sync cache in Redis if available
  try {
    const redis = await getRedis();
    await redis.set("videos", JSON.stringify(kept));
  } catch (e) {
    console.error("Redis sync error:", e);
  }

  return Response.json({ url: blob.url });
}