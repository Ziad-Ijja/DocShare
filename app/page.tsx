"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/video")
      .then((r) => r.json())
      .then((data) => {
        setVideos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">DocShare</h1>
          <a
            href="/upload/afa03c1d-ff92-4aae-b25d-ebbc53475fbb"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload
          </a>
        </div>
      </header>

      {/* content */}
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="text-xl font-semibold">Vidéos partagées</h2>
        <p className="mt-1 text-sm text-zinc-400">
          {videos.length} vidéo{videos.length !== 1 ? "s" : ""} &bull; max 3 en ligne
        </p>

        {loading ? (
          <div className="mt-16 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500" />
          </div>
        ) : videos.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-700 py-20 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-zinc-600"
            >
              <rect x="2" y="2" width="20" height="20" rx="2" />
              <path d="m10 8 6 4-6 4Z" />
            </svg>
            <p className="text-sm text-zinc-400">
              Aucune vidéo pour le moment.
            </p>
            <a
              href="/upload/afa03c1d-ff92-4aae-b25d-ebbc53475fbb"
              className="mt-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              Uploader une vidéo
            </a>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v, i) => (
              <div
                key={i}
                className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-700"
              >
                <video
                  controls
                  className="aspect-video w-full bg-black object-contain"
                >
                  <source src={v.url} />
                </video>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-zinc-300">Vidéo {i + 1}</span>
                  <span className="text-xs text-zinc-500">
                    {(v.size / (1024 * 1024)).toFixed(1)} Mo
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
