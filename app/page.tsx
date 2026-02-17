import { kv } from "@vercel/kv";

export default async function Home() {

  const videos:any[] = (await kv.get("videos")) || [];

  return (
    <main className="p-10">
      <h1 className="text-3xl mb-6">Vidéos disponibles</h1>

      <div className="grid grid-cols-2 gap-6">
        {videos.map((v, i) => (
          <video key={i} controls className="w-full rounded">
            <source src={v.url} />
          </video>
        ))}
      </div>
    </main>
  );
}