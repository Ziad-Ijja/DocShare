"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type VideoItem = {
  url: string;
  createdAt: number;
  size: number;
  pathname?: string;
};

type ArchiveItem = {
  url: string;
  createdAt: number;
  size: number;
  pathname?: string;
};

export default function Home() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingVideoUrl, setDeletingVideoUrl] = useState<string | null>(null);
  const [deletingArchiveUrl, setDeletingArchiveUrl] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const formatAddedDate = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getFileType = useCallback((pathname?: string, url?: string) => {
    const source = pathname ?? url ?? "";
    const match = source.match(/\.([a-z0-9]+)(?:$|\?)/i);
    return match ? match[1].toUpperCase() : "Fichier";
  }, []);

  const loadData = useCallback(async () => {
    const [videosRes, archivesRes] = await Promise.all([
      fetch("/api/video"),
      fetch("/api/archive"),
    ]);

    const [videosData, archivesData] = await Promise.all([
      videosRes.json(),
      archivesRes.json(),
    ]);

    setVideos(videosData);
    setArchives(archivesData);
  }, []);

  useEffect(() => {
    loadData()
      .then(() => {
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [loadData]);

  const deleteVideo = useCallback(async (url: string) => {
    const confirmed = window.confirm("Supprimer cette vidéo ?");
    if (!confirmed) return;

    setActionError("");
    setDeletingVideoUrl(url);

    try {
      let res = await fetch("/api/video", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (res.status === 401) {
        const password = window.prompt("Mot de passe requis pour supprimer cette vidéo :");
        if (!password) {
          setDeletingVideoUrl(null);
          return;
        }

        res = await fetch("/api/video", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, password }),
        });
      }

      if (!res.ok) {
        throw new Error("Delete video failed");
      }

      const updatedVideos = (await res.json()) as VideoItem[];
      setVideos(updatedVideos);
    } catch {
      setActionError("Impossible de supprimer la vidéo.");
    } finally {
      setDeletingVideoUrl(null);
    }
  }, []);

  const deleteArchive = useCallback(async (url: string) => {
    const confirmed = window.confirm("Supprimer cette archive ?");
    if (!confirmed) return;

    setActionError("");
    setDeletingArchiveUrl(url);

    try {
      let res = await fetch("/api/archive", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (res.status === 401) {
        const password = window.prompt("Mot de passe requis pour supprimer cette archive :");
        if (!password) {
          setDeletingArchiveUrl(null);
          return;
        }

        res = await fetch("/api/archive", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, password }),
        });
      }

      if (!res.ok) {
        throw new Error("Delete archive failed");
      }

      const updatedArchives = (await res.json()) as ArchiveItem[];
      setArchives(updatedArchives);
    } catch {
      setActionError("Impossible de supprimer l'archive.");
    } finally {
      setDeletingArchiveUrl(null);
    }
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">DocShare</h1>
          <Link
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
          </Link>
        </div>
      </header>

      {/* content */}
      <div className="mx-auto max-w-5xl px-6 py-10">
        {actionError && (
          <p className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {actionError}
          </p>
        )}

        <section>
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
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((v, i) => (
                <div
                  key={v.url}
                  className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-700"
                >
                  <video
                    controls
                    preload="metadata"
                    className="aspect-video w-full bg-black object-contain"
                  >
                    <source src={v.url} />
                  </video>
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300">Vidéo {i + 1}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500">
                          {(v.size / (1024 * 1024)).toFixed(1)} Mo
                        </span>
                        <button
                          onClick={() => deleteVideo(v.url)}
                          disabled={deletingVideoUrl === v.url}
                          className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingVideoUrl === v.url ? "Suppression..." : "Supprimer"}
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">
                      Ajouté le {formatAddedDate(v.createdAt)} &bull; Type: {getFileType(v.pathname, v.url)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold">Archives partagées</h2>
          <p className="mt-1 text-sm text-zinc-400">
            {archives.length} archive{archives.length !== 1 ? "s" : ""} &bull; max 3 en ligne
          </p>

          {loading ? null : archives.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-zinc-700 p-8 text-center">
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
                className="mx-auto mb-3 text-zinc-600"
              >
                <path d="M21 8v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8" />
                <path d="M23 3H1v5h22V3z" />
                <path d="M10 12h4" />
              </svg>
              <p className="text-sm text-zinc-400">Aucune archive pour le moment.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {archives.map((archive, i) => (
                <div
                  key={archive.url}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
                >
                  <p className="truncate text-sm font-medium text-zinc-200">
                    {archive.pathname?.split("/").pop() ?? `Archive ${i + 1}`}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {(archive.size / (1024 * 1024)).toFixed(1)} Mo
                  </p>
                  <div className="mt-4 flex gap-2">
                    <a
                      href={archive.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-500"
                    >
                      Télécharger
                    </a>
                    <button
                      onClick={() => deleteArchive(archive.url)}
                      disabled={deletingArchiveUrl === archive.url}
                      className="inline-flex rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingArchiveUrl === archive.url ? "Suppression..." : "Supprimer"}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Ajouté le {formatAddedDate(archive.createdAt)} &bull; Type: {getFileType(archive.pathname, archive.url)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
