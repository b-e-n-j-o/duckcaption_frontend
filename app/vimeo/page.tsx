'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import DropZone from '@/components/DropZone';
import { uploadVideoTus } from '@/lib/vimeoTusUpload';

export default function VimeoPage() {
  const [status, setStatus] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleVideoUpload = async (file: File) => {
    setStatus('📤 Préparation upload Vimeo…');
    setProgress(0);
    setVideoUrl(null);

    try {
      // 1) Demander au backend un upload_link
      const res = await fetch('/api/vimeo/create-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          size: file.size,
        }),
      });

      if (!res.ok) {
        setStatus('❌ Erreur création upload Vimeo');
        return;
      }

      const { upload_link, video_id } = await res.json();

      // 2) Upload TUS direct vers Vimeo
      setStatus('📤 Upload vidéo en cours…');

      await uploadVideoTus(file, upload_link, (pct) => {
        setProgress(pct);
      });

      // 3) Construire l'URL de la vidéo
      const url = `https://vimeo.com/${video_id}`;
      setVideoUrl(url);
      setStatus('✅ Upload terminé sur Vimeo');

      // 4) Synchroniser avec Notion
      await fetch('/api/notion/sync-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_name: 'Marc',        // temporaire
          video_url: url,
        }),
      });
    } catch (err: any) {
      setStatus(`❌ Erreur : ${err.message ?? err}`);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar jobs={[]} currentJobId={null} onSelectJob={() => {}} />

      <div className="flex-1 p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <h1 className="text-4xl font-bold mb-2">
          Upload vidéo Vimeo
        </h1>
        <p className="text-gray-600 mb-8">
          Publiez une vidéo et synchronisez automatiquement le lien dans Notion
        </p>

        <DropZone
          onFileSelected={handleVideoUpload}
        />

        {status && (
          <div className="mt-6 p-4 bg-white rounded-xl border shadow">
            <p className="mb-2">{status}</p>
            {progress > 0 && progress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            {progress > 0 && (
              <p className="text-sm text-gray-600 mt-2">{progress}%</p>
            )}
          </div>
        )}

        {videoUrl && (
          <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border">
            <p className="font-semibold mb-2">Lien Vimeo</p>
            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              {videoUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
