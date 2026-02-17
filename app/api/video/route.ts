import { kv } from "@vercel/kv";

export async function GET() {
  const videos:any[] = (await kv.get("videos")) || [];
  return new Response(JSON.stringify(videos), { status: 200 });
}