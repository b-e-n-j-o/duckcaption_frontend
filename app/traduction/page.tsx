'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import DropZone from '@/components/DropZone';
import SRTEditor from '@/components/SRTEditor';
import { api } from '@/lib/api/transcription';
import { SRTSegment } from '@/lib/types';

const LANGUAGES = [
  { code: 'en', label: 'Anglais' },
  { code: 'nl', label: 'Néerlandais' },
  { code: 'es', label: 'Espagnol' },
  { code: 'de', label: 'Allemand' },
  { code: 'fr', label: 'Français' },
];

export default function TraductionPage() {
  const [status, setStatus] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [originalSRT, setOriginalSRT] = useState<string>('');
  const [originalSegments, setOriginalSegments] = useState<SRTSegment[]>([]);
  const [translatedSegments, setTranslatedSegments] = useState<Record<string, SRTSegment[]>>({});
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [maxWords, setMaxWords] = useState<number>(10);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  const parseSRT = (text: string): SRTSegment[] => {
    const blocks = text.trim().split('\n\n');
    return blocks
      .filter(block => block.trim().length > 0)
      .map(block => {
        const lines = block.split('\n');
        return {
          index: lines[0] || '',
          time: lines[1] || '',
          text: lines.slice(2).join('\n'),
        };
      });
  };

  const handleFileUpload = async (file: File) => {
    setStatus('📥 Chargement du fichier SRT...');
    try {
      const text = await file.text();
      setFileName(file.name);
      setOriginalSRT(text);
      const parsed = parseSRT(text);
      setOriginalSegments(parsed);
      setTranslatedSegments({});
      setStatus(`✅ Fichier chargé: ${file.name}`);
    } catch (error) {
      setStatus(`❌ Erreur lors du chargement du fichier: ${error}`);
    }
  };

  const toggleLanguage = (code: string) => {
    setSelectedLangs(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleTranslate = async () => {
    if (!originalSRT) {
      setStatus('❌ Veuillez d’abord charger un fichier SRT.');
      return;
    }
    if (selectedLangs.length === 0) {
      setStatus('❌ Sélectionnez au moins une langue.');
      return;
    }

    setStatus('🌍 Traduction en cours...');
    setIsTranslating(true);

    try {
      const data = await api.translateSRTContent(
        originalSRT,
        selectedLangs,
        'strict',
        maxWords
      );

      if (data.error) {
        setStatus(`❌ Erreur: ${data.error}`);
        return;
      }

      const translations = data.translations || {};
      const newTranslated: Record<string, SRTSegment[]> = {};

      for (const [lang, srtText] of Object.entries<string>(translations)) {
        newTranslated[lang] = parseSRT(srtText);
      }

      setTranslatedSegments(newTranslated);
      setStatus('✅ Traduction terminée');
    } catch (error) {
      setStatus(`❌ Erreur: ${error}`);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar jobs={[]} currentJobId={null} onSelectJob={() => {}} />
      <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Traduction SRT
          </h1>
          <p className="text-gray-600 text-sm">
            Chargez un fichier SRT existant et traduisez-le dans plusieurs langues.
          </p>
        </div>

        <DropZone
          onFileSelected={handleFileUpload}
          accept=".srt,text/plain"
          title="Déposez un fichier SRT"
          subtitle="ou cliquez pour sélectionner un fichier .srt"
        />

        {fileName && (
          <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm text-sm text-gray-700">
            Fichier sélectionné : <span className="font-semibold">{fileName}</span>
          </div>
        )}

        {status && (
          <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm text-gray-900">
            {status}
          </div>
        )}

        <div className="mt-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-md space-y-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-[220px]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-900">
                  Nombre maximum de mots par segment (post-traduction)
                </label>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  {maxWords} {maxWords === 1 ? 'mot' : 'mots'}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                value={maxWords}
                onChange={e => setMaxWords(parseInt(e.target.value))}
                className="w-full h-2.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Contrôle la longueur maximale des segments traduits.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Langues de traduction
            </h2>
            <div className="flex flex-wrap gap-3">
              {LANGUAGES.map(lang => {
                const isSelected = selectedLangs.includes(lang.code);
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => toggleLanguage(lang.code)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleTranslate}
            disabled={!originalSRT || selectedLangs.length === 0 || isTranslating}
            className="w-full mt-2 px-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-bold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02] active:scale-98 disabled:hover:scale-100"
          >
            {isTranslating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Traduction en cours...
              </span>
            ) : (
              'Lancer la traduction'
            )}
          </button>
        </div>

        {originalSegments.length > 0 && (
          <div className="mt-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                SRT original
              </h2>
              <SRTEditor
                segments={originalSegments}
                onSegmentChange={(index, field, value) => {
                  setOriginalSegments(prev => {
                    const updated = [...prev];
                    updated[index] = { ...updated[index], [field]: value };
                    return updated;
                  });
                }}
                onDownload={() => {
                  const srtContent = originalSegments
                    .map((seg, idx) => `${idx + 1}\n${seg.time}\n${seg.text}\n`)
                    .join('\n');
                  const blob = new Blob([srtContent], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = fileName || 'original.srt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              />
            </div>

            {Object.keys(translatedSegments).length > 0 && (
              <div className="space-y-8">
                {Object.entries(translatedSegments).map(([lang, segs]) => (
                  <div key={lang}>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      SRT traduit ({lang.toUpperCase()})
                    </h2>
                    <SRTEditor
                      segments={segs}
                      onSegmentChange={(index, field, value) => {
                        setTranslatedSegments(prev => {
                          const updated = { ...prev };
                          const arr = [...(updated[lang] || [])];
                          arr[index] = { ...arr[index], [field]: value };
                          updated[lang] = arr;
                          return updated;
                        });
                      }}
                      onDownload={() => {
                        const srtContent = segs
                          .map((seg, idx) => `${idx + 1}\n${seg.time}\n${seg.text}\n`)
                          .join('\n');
                        const blob = new Blob([srtContent], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${fileName || 'subtitles'}_${lang}.srt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

