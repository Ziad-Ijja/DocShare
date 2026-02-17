"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { upload as uploadToBlob } from "@vercel/blob/client";

const MAX_SIZE_BYTES =
  Number(process.env.NEXT_PUBLIC_MAX_VIDEO_SIZE_MB ?? "1024") * 1024 * 1024;

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setError("");
    if (f.size > MAX_SIZE_BYTES) {
      setError(
        `Le fichier dépasse la limite de ${Math.round(MAX_SIZE_BYTES / (1024 * 1024))} Mo.`
      );
      return;
    }
    setFile(f);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const upload = useCallback(async () => {
    if (!file) return;
    setError("");
    setProgress(0);

    try {
      await uploadToBlob(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload/afa03c1d-ff92-4aae-b25d-ebbc53475fbb",
        multipart: true,
        onUploadProgress: ({ percentage }) => {
          setProgress(Math.round(percentage));
        },
      });

      setDone(true);
      setProgress(100);
    } catch {
      setError("Échec de l'upload. Réessayez.");
      setProgress(null);
    }
  }, [file]);

  const reset = () => {
    setFile(null);
    setProgress(null);
    setError("");
    setDone(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link
            href="/"
            className="text-zinc-400 transition hover:text-zinc-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">
            Upload vidéo
          </h1>
        </div>
      </header>

      {/* upload area */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-12">
        {done ? (
          /* success state */
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-400"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-white">
              Upload terminé !
            </p>
            <p className="text-sm text-zinc-300">
              Votre vidéo est maintenant disponible.
            </p>
            <div className="mt-2 flex gap-3">
              <button
                onClick={reset}
                className="rounded-lg border border-zinc-700 px-5 py-2 text-sm font-medium transition hover:border-zinc-500"
              >
                Uploader une autre
              </button>
              <Link
                href="/"
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                Voir les vidéos
              </Link>
            </div>
          </div>
        ) : (
          /* upload form */
          <div className="flex flex-col gap-6">
            {/* drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-14 text-center transition ${
                dragging
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/50"
              }`}
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full transition ${
                  dragging ? "bg-indigo-500/20" : "bg-zinc-800"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={dragging ? "text-indigo-400" : "text-zinc-400"}
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  Glissez votre vidéo ici ou <span className="text-indigo-400">parcourir</span>
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Formats vidéo &bull; Max {Math.round(MAX_SIZE_BYTES / (1024 * 1024))} Mo
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={onFileChange}
              />
            </div>

            {/* selected file info */}
            {file && (
              <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-indigo-400"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="2" />
                      <path d="m10 8 6 4-6 4Z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-200">
                      {file.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {(file.size / (1024 * 1024)).toFixed(1)} Mo
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                  className="ml-3 shrink-0 text-zinc-500 transition hover:text-zinc-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}

            {/* progress bar */}
            {progress !== null && !done && (
              <div className="space-y-2">
                <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-right text-xs text-zinc-400">
                  {progress}%
                </p>
              </div>
            )}

            {/* error */}
            {error && (
              <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}

            {/* upload button */}
            <button
              onClick={upload}
              disabled={!file || progress !== null}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {progress !== null ? "Upload en cours…" : "Envoyer la vidéo"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
