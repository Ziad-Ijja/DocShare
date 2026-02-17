import { getRedis } from "@/app/lib/redis";
import { del, list } from "@vercel/blob";

const VIDEO_PATH = /^videos\/.+\.(mp4|mov|webm|mkv|avi)$/i;
const AUTH_COOKIE_NAME = "docshare_upload_auth";

function hasUploadAuthCookie(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .some((part) => part === `${AUTH_COOKIE_NAME}=1`);
}

export async function GET() {
  try {
    const redis = await getRedis();
    const raw = await redis.get("videos");
    const videos: Array<{ url: string; createdAt: number; size: number; pathname: string }> = raw ? JSON.parse(raw) : [];
    return Response.json(videos);
  } catch (e) {
    console.error("Redis error:", e);

    try {
      const { blobs } = await list();

      const videos = blobs
        .filter((b) => VIDEO_PATH.test(b.pathname))
        .sort(
          (a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        )
        .slice(0, 3)
        .map((b) => ({
          url: b.url,
          createdAt: new Date(b.uploadedAt).getTime(),
          size: b.size,
          pathname: b.pathname,
        }));

      return Response.json(videos);
    } catch {
      return Response.json([]);
    }
  }
}

export async function DELETE(req: Request) {
  try {
    const body = (await req.json()) as { url?: string; password?: string };
    const { url, password } = body;

    if (!url) {
      return Response.json({ error: "Missing url" }, { status: 400 });
    }

    const authenticatedByCookie = hasUploadAuthCookie(req);
    if (!authenticatedByCookie) {
      const expectedPassword = process.env.UPLOAD_PAGE_PASSWORD;
      if (!expectedPassword || password !== expectedPassword) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    await del(url);

    const { blobs } = await list();
    const videos = blobs
      .filter((b) => VIDEO_PATH.test(b.pathname))
      .sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )
      .slice(0, 3)
      .map((b) => ({
        url: b.url,
        createdAt: new Date(b.uploadedAt).getTime(),
        size: b.size,
        pathname: b.pathname,
      }));

    try {
      const redis = await getRedis();
      await redis.set("videos", JSON.stringify(videos));
    } catch (e) {
      console.error("Redis sync error:", e);
    }

    return Response.json(videos);
  } catch (error) {
    console.error("Video delete error:", error);
    return Response.json({ error: "Delete failed" }, { status: 400 });
  }
}