import { del, list } from "@vercel/blob";
import { handleUpload } from "@vercel/blob/client";
import { getRedis } from "@/app/lib/redis";

export const runtime = "nodejs";

const ROUTE_TOKEN = "afa03c1d-ff92-4aae-b25d-ebbc53475fbb";
const MAX_VIDEO_SIZE_MB = Number(process.env.MAX_VIDEO_SIZE_MB ?? "1024");
const MAX_ARCHIVE_SIZE_MB = Number(process.env.MAX_ARCHIVE_SIZE_MB ?? "1024");
const BLOB_CACHE_MAX_AGE_SECONDS = Number(
  process.env.BLOB_CACHE_MAX_AGE_SECONDS ?? `${60 * 60 * 24 * 7}`
);

const VIDEO_PATH = /^videos\/.+\.(mp4|mov|webm|mkv|avi)$/i;
const ARCHIVE_PATH = /^archives\/.+\.(zip|rar)$/i;

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
      onBeforeGenerateToken: async (pathname) => {
        if (VIDEO_PATH.test(pathname)) {
          return {
            allowedContentTypes: ["video/*"],
            maximumSizeInBytes: MAX_VIDEO_SIZE_MB * 1024 * 1024,
            addRandomSuffix: true,
            cacheControlMaxAge: BLOB_CACHE_MAX_AGE_SECONDS,
          };
        }

        if (ARCHIVE_PATH.test(pathname)) {
          return {
            maximumSizeInBytes: MAX_ARCHIVE_SIZE_MB * 1024 * 1024,
            addRandomSuffix: true,
            cacheControlMaxAge: BLOB_CACHE_MAX_AGE_SECONDS,
          };
        }

        throw new Error("Unsupported upload path");
      },
      onUploadCompleted: async ({ blob }) => {
        const { blobs } = await list();
        if (VIDEO_PATH.test(blob.pathname)) {
          const videos = blobs
            .filter((b) => VIDEO_PATH.test(b.pathname))
            .sort(
              (a, b) =>
                new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
            );

          const kept = videos.slice(0, 3).map((b) => ({
            url: b.url,
            createdAt: new Date(b.uploadedAt).getTime(),
            size: b.size,
            pathname: b.pathname,
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
          return;
        }

        if (ARCHIVE_PATH.test(blob.pathname)) {
          const archives = blobs
            .filter((b) => ARCHIVE_PATH.test(b.pathname))
            .sort(
              (a, b) =>
                new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
            );

          const kept = archives.slice(0, 3).map((b) => ({
            url: b.url,
            createdAt: new Date(b.uploadedAt).getTime(),
            size: b.size,
            pathname: b.pathname,
          }));

          for (const old of archives.slice(3)) {
            await del(old.url);
          }

          try {
            const redis = await getRedis();
            await redis.set("archives", JSON.stringify(kept));
          } catch (e) {
            console.error("Redis sync error:", e);
          }
        }
      },
    });

    return Response.json(jsonResponse);
  } catch (error) {
    console.error("handleUpload error:", error);
    return Response.json({ error: "Upload handler failed" }, { status: 400 });
  }
}