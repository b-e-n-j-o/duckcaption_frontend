'use client';

import { useState } from 'react';

interface TranslationPanelProps {
  jobId: string;
  onTranslate: (languages: string[], method: 'classic' | 'strict') => Promise<void>;
  translations: Record<string, string>;
  isTranslating: boolean;
}

const LANGUAGES = [
  { code: 'en', label: 'Anglais', flag: '🇬🇧', color: 'from-blue-500 to-blue-600' },
  { code: 'nl', label: 'Néerlandais', flag: '🇳🇱', color: 'from-orange-500 to-red-600' },
  { code: 'es', label: 'Espagnol', flag: '🇪🇸', color: 'from-yellow-500 to-red-600' },
  { code: 'de', label: 'Allemand', flag: '🇩🇪', color: 'from-yellow-500 to-red-600' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', color: 'from-blue-500 to-red-600' },
];

export default function TranslationPanel({ 
  jobId, 
  onTranslate, 
  translations,
  isTranslating 
}: TranslationPanelProps) {
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [translationMethod, setTranslationMethod] = useState<'classic' | 'strict'>('strict');

  const toggleLanguage = (code: string) => {
    setSelectedLangs(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const handleTranslate = async () => {
    if (selectedLangs.length > 0) {
      await onTranslate(selectedLangs, translationMethod);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl p-8 mt-6 border border-gray-200/80 shadow-lg shadow-gray-200/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
          <span className="text-xl">🌍</span>
        </div>
        <h4 className="text-2xl font-bold text-gray-900">Traduire en</h4>
      </div>
      
      {/* Toggle méthode de traduction */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Méthode de traduction
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setTranslationMethod('strict')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              translationMethod === 'strict'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>🎯 Littérale</span>
              <span className="text-xs opacity-75">(recommandé)</span>
            </div>
          </button>
          <button
            onClick={() => setTranslationMethod('classic')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              translationMethod === 'classic'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Classique
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {translationMethod === 'strict' 
            ? "Garde la structure exacte des segments (chiffres, noms au même endroit)"
            : "Traduction plus libre, peut réorganiser le contenu"}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {LANGUAGES.map(lang => {
          const isSelected = selectedLangs.includes(lang.code);
          return (
            <button
              key={lang.code}
              onClick={() => toggleLanguage(lang.code)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 font-semibold
                ${isSelected 
                  ? `bg-gradient-to-br ${lang.color} text-white border-transparent shadow-lg scale-105` 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:shadow-md'
                }
              `}
            >
              <div className="text-2xl mb-1">{lang.flag}</div>
              <div className="text-sm">{lang.label}</div>
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleTranslate}
        disabled={selectedLangs.length === 0 || isTranslating}
        className="w-full px-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-bold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02] active:scale-98 disabled:hover:scale-100"
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
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            Traduire
          </span>
        )}
      </button>

      {Object.keys(translations).length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h5 className="font-bold text-gray-900 text-lg">Traductions disponibles</h5>
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(translations).map(([lang, url]) => {
              const langInfo = LANGUAGES.find(l => l.code === lang);
              return (
                <a
                  key={lang}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span>{langInfo?.flag || '🌐'}</span>
                  <span>{langInfo?.label || lang.toUpperCase()}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}