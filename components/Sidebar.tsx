'use client';

import Link from 'next/link';
import { Job } from '@/lib/types';

interface SidebarProps {
  jobs: Job[];
  currentJobId: string | null;
  onSelectJob: (jobId: string) => void;
}

export default function Sidebar({ jobs, currentJobId, onSelectJob }: SidebarProps) {
  return (
    <div className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-6 overflow-y-auto border-r border-slate-700/50 shadow-2xl">
      <div className="mb-10 space-y-2">
        <Link
          href="/"
          className="block px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
        >
          🎧 Transcription
        </Link>

        <Link
          href="/vimeo"
          className="block px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
        >
          🎬 Upload vidéo
        </Link>

        <Link
          href="/traduction"
          className="block px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
        >
          🌍 Traduction SRT
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Projets
        </h2>
        <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      </div>
      
      <div className="space-y-3">
        {jobs.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-gray-400 text-sm">Aucun projet</p>
            <p className="text-gray-500 text-xs mt-2">Commencez par uploader un fichier</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onSelectJob(job.id)}
              className={`
                group relative p-4 rounded-xl cursor-pointer transition-all duration-200
                ${currentJobId === job.id 
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25 scale-[1.02]' 
                  : 'bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-slate-600/50 hover:shadow-lg'
                }
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate text-sm mb-1">{job.filename}</div>
                  <div className={`text-xs mt-1.5 flex items-center gap-1.5 ${
                    currentJobId === job.id ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      job.status === 'completed' ? 'bg-green-400' : 
                      job.status === 'processing' ? 'bg-yellow-400' : 
                      'bg-blue-400'
                    }`}></span>
                    {job.status}
                  </div>
                </div>
                {currentJobId === job.id && (
                  <div className="flex-shrink-0 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}