'use client';

interface NotionExportPanelProps {
  segments: Array<{ index: string; time: string; text: string }>;
  jobId: string;
  filename?: string;
}

export default function NotionExportPanel({ segments, jobId, filename }: NotionExportPanelProps) {
  const handleExportToNotion = async () => {
    // TODO: Implémenter l'export vers Notion
    alert('🚧 Fonctionnalité en cours de développement\n\nPour connecter Notion, il faudra :\n1. Créer une intégration sur notion.so/my-integrations\n2. Partager votre base Notion avec l\'intégration\n3. Configurer le token d\'API dans le backend');
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 mt-6 border border-gray-200">
      <h4 className="text-lg font-semibold mb-4 text-gray-900">📝 Exporter vers Notion</h4>
      
      <p className="text-gray-700 mb-4 text-sm">
        Exportez vos sous-titres vers une page Notion pour un partage et une édition facilités.
      </p>
      
      <button
        onClick={handleExportToNotion}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        📤 Exporter vers Notion
      </button>
    </div>
  );
}
