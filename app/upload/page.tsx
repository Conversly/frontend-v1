'use client';

import { useState, useRef } from 'react';
import type { PutBlobResult } from '@vercel/blob';

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inputRef.current?.files?.length) return alert('Select a file first');

    const file = inputRef.current.files[0];
    setLoading(true);

    const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
      method: 'POST',
      body: file,
    });
    const data = await res.json();
    console.log('📦 Blob response:', data); // <-- log the full response


    if (!res.ok) {
      setLoading(false);
      return alert('Upload failed');
    }

    const blob = (await res.json()) as PutBlobResult;
    setBlob(blob);
    setLoading(false);
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Vercel Blob Upload Test</h1>

      <form onSubmit={handleSubmit}>
        <input ref={inputRef} type="file" required />
        <button type="submit" disabled={loading} style={{ marginLeft: '1rem' }}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {blob && (
        <p style={{ marginTop: '1rem' }}>
          ✅ Uploaded to: <a href={blob.url} target="_blank">{blob.url}</a>
        </p>
      )}
    </main>
  );
}