"use client";

import { useState } from "react";

export default function Upload({ params }: any) {

  const [status, setStatus] = useState("");

  async function upload(e:any) {

    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("Max 50MB");
      return;
    }

    setStatus("Upload...");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/upload/${params.token}`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    setStatus("Upload terminé !");
    window.location.href = "/";
  }

  return (
    <main className="p-10">
      <h1 className="text-2xl mb-4">Upload vidéo</h1>

      <input type="file" accept="video/*" onChange={upload} />

      <p>{status}</p>
    </main>
  );
}