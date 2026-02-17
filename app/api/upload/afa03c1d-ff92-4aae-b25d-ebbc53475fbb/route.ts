import { put, del } from "@vercel/blob";
import { kv } from "@vercel/kv";

export async function POST(req: Request, { params }: any) {

  if (params.token !== process.env.UPLOAD_TOKEN) {
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

  let videos:any[] = (await kv.get("videos")) || [];

  videos.push({
    url: blob.url,
    createdAt: Date.now(),
    size: file.size
  });

  // quota = 3 vidéos max
  while (videos.length > 3) {
    const old = videos.shift();
    await del(old.url);
  }

  await kv.set("videos", videos);

  return Response.json({ url: blob.url });
}