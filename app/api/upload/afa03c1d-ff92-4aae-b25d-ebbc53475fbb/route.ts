import { del, list } from "@vercel/blob";
import { handleUpload } from "@vercel/blob/client";
import { getRedis } from "@/app/lib/redis";

export const runtime = "nodejs";

const ROUTE_TOKEN = "afa03c1d-ff92-4aae-b25d-ebbc53475fbb";
const MAX_VIDEO_SIZE_MB = Number(process.env.MAX_VIDEO_SIZE_MB ?? "1024");

export async function POST(req: Request) {

  if (ROUTE_TOKEN !== process.env.UPLOAD_TOKEN) {
    return new Response("Forbidden", { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      request: req,
      body: body as Parameters<typeof handleUpload>[0]["body"],
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["video/*"],
        maximumSizeInBytes: MAX_VIDEO_SIZE_MB * 1024 * 1024,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {
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

        for (const old of videos.slice(3)) {
          await del(old.url);
        }

        try {
          const redis = await getRedis();
          await redis.set("videos", JSON.stringify(kept));
        } catch (e) {
          console.error("Redis sync error:", e);
        }
      },
    });

    return Response.json(jsonResponse);
  } catch (error) {
    console.error("handleUpload error:", error);
    return Response.json({ error: "Upload handler failed" }, { status: 400 });
  }
}