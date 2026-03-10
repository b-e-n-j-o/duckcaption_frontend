'use client';

import { SRTSegment } from '@/lib/types';

interface SRTEditorProps {
  segments: SRTSegment[];
  onSegmentChange: (index: number, field: 'text' | 'time', value: string) => void;
  onDownload: () => void;
}

export default function SRTEditor({ segments, onSegmentChange, onDownload }: SRTEditorProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-lg shadow-gray-200/50 p-8 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900">Sous-titres</h3>
        <button
          onClick={onDownload}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Télécharger SRT
          </span>
        </button>
      </div>
      
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-blue-500 [&::-webkit-scrollbar-thumb]:to-purple-500 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:from-blue-600 [&::-webkit-scrollbar-thumb]:hover:to-purple-600">
        {segments.map((seg, idx) => (
          <div 
            key={idx} 
            className="group relative bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200/60 p-5 hover:border-blue-300/60 hover:shadow-md transition-all duration-200"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                #{idx + 1}
              </span>
              <input
                type="text"
                value={seg.time}
                onChange={(e) => onSegmentChange(idx, 'time', e.target.value)}
                className="flex-1 text-sm text-gray-700 font-mono bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"
                placeholder="00:00:00,000 --> 00:00:02,500"
              />
            </div>
            <textarea
              value={seg.text}
              onChange={(e) => onSegmentChange(idx, 'text', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all min-h-[70px] text-gray-900 resize-y font-medium leading-relaxed"
              placeholder="Texte du sous-titre..."
            />
          </div>
        ))}
      </div>
    </div>
  );
}