'use client';

import { useState } from 'react';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  title?: string;
  subtitle?: string;
}

export default function DropZone({ 
  onFileSelected,
  accept = 'audio/*,video/*',
  title = 'Déposez un fichier audio/vidéo',
  subtitle = 'ou cliquez pour sélectionner',
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) onFileSelected(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-xl p-16 text-center cursor-pointer
        transition-all duration-300
        ${isDragging 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }
      `}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
        id="fileInput"
      />
      
      <label htmlFor="fileInput" className="cursor-pointer">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-700">{subtitle}</p>
      </label>
    </div>
  );
}