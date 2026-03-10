'use client';

interface NotionExportPanelProps {
  segments: Array<{ index: string; time: string; text: string }>;
  jobId: string;
  filename?: string;
}

export default function NotionExportPanel({ segments, jobId, filename }: NotionExportPanelProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 mt-6 border border-gray-200 grayscale opacity-70">
      <h4 className="text-lg font-semibold mb-4 text-gray-600">📝 Exporter vers Notion</h4>
      
      <p className="text-gray-500 mb-4 text-sm">
        Exportez vos sous-titres vers une page Notion pour un partage et une édition facilités.
      </p>
      
      <button
        disabled
        className="px-4 py-2 bg-gray-400 text-gray-600 rounded-lg cursor-not-allowed"
      >
        📤 Exporter vers Notion
      </button>
      <p className="text-xs text-gray-400 mt-2">Fonctionnalité à venir</p>
    </div>
  );
}
