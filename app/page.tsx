'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import DropZone from '@/components/DropZone';
import AudioPlayer from '@/components/AudioPlayer';
import SRTEditor from '@/components/SRTEditor';
import TranslationPanel from '@/components/TranslationPanel';
import NotionExportPanel from '@/components/NotionExportPanel';
import { api } from '@/lib/api/transcription';
import { Job, AudioInfo, SRTSegment } from '@/lib/types';

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [audioInfo, setAudioInfo] = useState<AudioInfo | null>(null);
  const [segments, setSegments] = useState<SRTSegment[]>([]);
  const [translatedSegments, setTranslatedSegments] = useState<Record<string, SRTSegment[]>>({});
  const [status, setStatus] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [initialStartTime, setInitialStartTime] = useState<number>(0);
  const [initialEndTime, setInitialEndTime] = useState<number>(0);
  const [maxWords, setMaxWords] = useState<number>(5);
  const [maxChars, setMaxChars] = useState<number>(24);
  const [maxCharsPerLine, setMaxCharsPerLine] = useState<number>(42);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [keyterms, setKeyterms] = useState<string>('');
  const [isGeneratingSRT, setIsGeneratingSRT] = useState<boolean>(false);
  const [currentFilename, setCurrentFilename] = useState<string>('subtitles.srt');

  const currentJobData = jobs.find(j => j.id === currentJobId) || currentJob;

  const subtitlesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (segments.length > 0 && subtitlesRef.current) {
      subtitlesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [segments.length, currentJobId]);

  // Fonction helper pour formater les secondes en MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = async (file: File) => {
    setStatus('📤 Upload en cours...');
    
    try {
      const data = await api.uploadFile(file);
      const newJob = { 
        id: data.job_id, 
        filename: file.name, 
        status: 'uploaded' 
      };
      
      setJobs(prev => [...prev, newJob]);
      setCurrentJobId(data.job_id);
      
      // Récupérer info audio
      const info = await api.getAudioInfo(data.job_id);
      setAudioInfo(info);
      // Initialiser les sliders avec la durée complète
      const duration = info.duration_sec;
      setStartTime(0);
      setEndTime(duration);
      setInitialStartTime(0);
      setInitialEndTime(duration);
      setStatus(`⏱️ Durée: ${formatTime(info.duration_sec)}`);
    } catch (error) {
      setStatus(`❌ Erreur: ${error}`);
    }
  };

  const handleGenerateSRT = async () => {
    if (!currentJobId) return;
    
    setStatus('🪄 Transcription Scribe v2...');
    setIsGeneratingSRT(true);
    
    // Vérifier si l'intervalle a été modifié
    const rangeModified = startTime !== initialStartTime || endTime !== initialEndTime;
    
    try {
      const result = await api.generateSRT(
        currentJobId,
        rangeModified ? startTime : undefined,
        rangeModified ? endTime : undefined,
        maxWords,
        maxChars,
        maxCharsPerLine,
        false,
        'scribe_v2',
        keyterms || undefined
      );

      if (result?.filename) {
        setCurrentFilename(result.filename);
      }

      await loadJob(currentJobId);
    } catch (error) {
      setStatus(`❌ Erreur: ${error}`);
    } finally {
      setIsGeneratingSRT(false);
    }
  };

  const loadJob = async (jobId: string) => {
    try {
      const job = await api.getJob(jobId);
      
      if (job.error) {
        setStatus(`❌ Erreur: ${job.error}`);
        return;
      }
      
      setCurrentJob(job);
      
      // Réinitialiser les segments traduits
      setTranslatedSegments({});
      setTranslations({});
      
      if (job.srt_url) {
        setStatus('✅ Prêt !');
        await loadSRT(api.getSRTUrl(job.srt_url));
      }
      
      // Charger les traductions existantes si disponibles
      if (job.translations) {
        try {
          const translationsObj = JSON.parse(job.translations) as Record<string, string>;
          setTranslations(translationsObj);
          
          // Charger les segments traduits
          const newTranslatedSegments: Record<string, SRTSegment[]> = {};
          for (const [lang, url] of Object.entries(translationsObj)) {
            try {
              const srtText = await loadSRTFromUrl(api.getSRTUrl(url as string));
              newTranslatedSegments[lang] = parseSRT(srtText);
            } catch (error) {
              console.error(`Erreur chargement SRT ${lang}:`, error);
            }
          }
          setTranslatedSegments(newTranslatedSegments);
        } catch (error) {
          console.error('Erreur parsing translations:', error);
        }
      }
      
      // Update dans la liste
      setJobs(prev => {
        const idx = prev.findIndex(j => j.id === jobId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = job;
          return updated;
        }
        return prev;
      });
    } catch (error) {
      setStatus(`❌ Erreur: ${error}`);
    }
  };

  const loadSRT = async (url: string) => {
    try {
      const res = await fetch(url);
      const text = await res.text();
      const parsed = parseSRT(text);
      setSegments(parsed);
    } catch (error) {
      console.error('Erreur chargement SRT:', error);
    }
  };

  const parseSRT = (text: string): SRTSegment[] => {
    const blocks = text.trim().split('\n\n');
    return blocks.map(block => {
      const lines = block.split('\n');
      return {
        index: lines[0],
        time: lines[1],
        text: lines.slice(2).join('\n')
      };
    });
  };

  const handleSegmentChange = (index: number, field: 'text' | 'time', value: string) => {
    setSegments(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDownload = (segmentsToDownload: SRTSegment[], filename: string = 'subtitles.srt') => {
    const srtContent = segmentsToDownload.map((seg, idx) => 
      `${idx + 1}\n${seg.time}\n${seg.text}\n`
    ).join('\n');
    
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadOriginal = () => {
    handleDownload(segments, currentFilename);
  };

  const handleDownloadTranslated = (lang: string) => {
    const baseAudioName = currentJobData?.filename
      ? currentJobData.filename.replace(/\.[^/.]+$/, '')
      : 'subtitles';
    handleDownload(translatedSegments[lang], `${baseAudioName}_${lang}.srt`);
  };

  const handleTranslatedSegmentChange = (lang: string, index: number, field: 'text' | 'time', value: string) => {
    setTranslatedSegments(prev => {
      const updated = { ...prev };
      if (updated[lang]) {
        updated[lang] = [...updated[lang]];
        updated[lang][index] = { ...updated[lang][index], [field]: value };
      }
      return updated;
    });
  };

  const handleTranslate = async (languages: string[], method: 'classic' | 'strict') => {
    if (!currentJobId) return;
    
    setIsTranslating(true);
    setStatus('🌍 Traduction en cours...');
    
    try {
      const data = await api.translateSRT(currentJobId, languages, method);
      
      if (data.error) {
        setStatus(`❌ Erreur: ${data.error}`);
      } else {
        setTranslations(data.translations);
        setStatus('✅ Traductions terminées !');
        
        // Charger les SRT traduits
        const newTranslatedSegments: Record<string, SRTSegment[]> = {};
        for (const [lang, url] of Object.entries(data.translations)) {
          try {
            const srtText = await loadSRTFromUrl(api.getSRTUrl(url as string));
            newTranslatedSegments[lang] = parseSRT(srtText);
          } catch (error) {
            console.error(`Erreur chargement SRT ${lang}:`, error);
          }
        }
        setTranslatedSegments(prev => ({ ...prev, ...newTranslatedSegments }));
      }
    } catch (error) {
      setStatus(`❌ Erreur: ${error}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const loadSRTFromUrl = async (url: string): Promise<string> => {
    const res = await fetch(url);
    return res.text();
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        jobs={jobs}
        currentJobId={currentJobId}
        onSelectJob={(id) => {
          setCurrentJobId(id);
          loadJob(id);
        }}
      />
      
      <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            DuckCaption 🦆
          </h1>
          <p className="text-gray-600 text-sm">Transcription et traduction de sous-titres intelligente</p>
        </div>
        
        <DropZone onFileSelected={handleFileUpload} />
        
        {status && (
          <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200/80 shadow-md text-gray-900 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">{status}</span>
            </div>
          </div>
        )}
        
        <div className="mt-6 p-8 bg-white rounded-2xl border border-gray-200/80 shadow-lg shadow-gray-200/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-gray-900">Options de transcription</h4>
          </div>
          
          {/* Slider d'intervalle de transcription */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="text-base font-semibold text-gray-900">
                2. Intervalle à transcrire
              </label>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-purple-700 bg-gradient-to-r from-purple-100 to-purple-50 px-4 py-1.5 rounded-lg border border-purple-200 shadow-sm">
                  {formatTime(startTime)}
                </span>
                <span className="text-gray-400 text-lg">→</span>
                <span className="text-sm font-bold text-purple-700 bg-gradient-to-r from-purple-100 to-purple-50 px-4 py-1.5 rounded-lg border border-purple-200 shadow-sm">
                  {formatTime(endTime)}
                </span>
              </div>
            </div>
            
            {audioInfo ? (
              <>
                <div className="mb-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">Début</label>
                  <input
                    type="range"
                    min="0"
                    max={audioInfo.duration_sec}
                    step="0.1"
                    value={Math.min(startTime, endTime - 0.1)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setStartTime(Math.min(val, endTime - 0.1));
                    }}
                    className="w-full h-2.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-600 hover:accent-purple-700 transition-colors"
                  />
                </div>
                <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">Fin</label>
                  <input
                    type="range"
                    min="0"
                    max={audioInfo.duration_sec}
                    step="0.1"
                    value={endTime}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setEndTime(Math.max(val, startTime + 0.1));
                    }}
                    className="w-full h-2.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-colors"
                  />
                </div>
                <div className="flex justify-between text-xs font-medium text-gray-600 mt-2 px-1">
                  <span>0:00</span>
                  <span>{formatTime(audioInfo.duration_sec)}</span>
                </div>
                <div className="mt-4 p-3 bg-blue-50/80 rounded-lg border border-blue-100">
                  <small className="block text-gray-700 text-xs font-medium">
                    {startTime === initialStartTime && endTime === initialEndTime 
                      ? "💡 Audio entier sélectionné (ajuster l'intervalle si nécessaire)" 
                      : `📌 Intervalle personnalisé: ${formatTime(endTime - startTime)} (${(endTime - startTime).toFixed(1)}s)`}
                  </small>
                </div>
              </>
            ) : (
              <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600 text-center font-medium">
                  ⏳ Chargez un fichier audio pour configurer l'intervalle
                </p>
              </div>
            )}
          </div>
          
          {/* Slider nombre de mots */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-base font-semibold text-gray-900">
                3. Nombre maximum de mots par segment
              </label>
              <span className="text-sm font-bold text-blue-700 bg-gradient-to-r from-blue-100 to-blue-50 px-4 py-1.5 rounded-lg border border-blue-200 shadow-sm">
                {maxWords} {maxWords === 1 ? 'mot' : 'mots'}
              </span>
            </div>
            <div className="px-2">
              <input
                type="range"
                min="1"
                max="20"
                value={maxWords}
                onChange={(e) => setMaxWords(parseInt(e.target.value))}
                className="w-full h-2.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-colors"
              />
              <div className="flex justify-between text-xs font-medium text-gray-600 mt-2">
                <span>1</span>
                <span>20</span>
              </div>
            </div>
          </div>
          
          {/* Slider nombre de caractères */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-base font-semibold text-gray-900">
                4. Nombre maximum de caractères par segment
              </label>
              <span className="text-sm font-bold text-emerald-700 bg-gradient-to-r from-emerald-100 to-emerald-50 px-4 py-1.5 rounded-lg border border-emerald-200 shadow-sm">
                {maxChars} {maxChars === 1 ? 'caractère' : 'caractères'}
              </span>
            </div>
            <div className="px-2">
              <input
                type="range"
                min="10"
                max="80"
                value={maxChars}
                onChange={(e) => setMaxChars(parseInt(e.target.value))}
                className="w-full h-2.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-700 transition-colors"
              />
              <div className="flex justify-between text-xs font-medium text-gray-600 mt-2">
                <span>10</span>
                <span>80</span>
              </div>
            </div>
          </div>

          {/* Slider nombre de caractères par ligne */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-base font-semibold text-gray-900">
                5. Nombre maximum de caractères par ligne avant d'aller à la ligne
              </label>
              <span className="text-sm font-bold text-indigo-700 bg-gradient-to-r from-indigo-100 to-indigo-50 px-4 py-1.5 rounded-lg border border-indigo-200 shadow-sm">
                {maxCharsPerLine} {maxCharsPerLine === 1 ? 'caractère' : 'caractères'}
              </span>
            </div>
            <div className="px-2">
              <input
                type="range"
                min="5"
                max="50"
                value={maxCharsPerLine}
                onChange={(e) => setMaxCharsPerLine(parseInt(e.target.value))}
                className="w-full h-2.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-colors"
              />
              <div className="flex justify-between text-xs font-medium text-gray-600 mt-2">
                <span>5</span>
                <span>50</span>
              </div>
            </div>
          </div>

          {/* Termes clés (Scribe v2) */}
          <div className="mb-8 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              6. Termes clés (optionnel)
            </label>
            <input
              type="text"
              value={keyterms}
              onChange={(e) => setKeyterms(e.target.value)}
              placeholder="Ex: Duckmotion, AXA , Nauticare...(séparés par des virgules)"
              className="w-full px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900 text-sm"
            />
            <p className="text-xs text-gray-600 mt-2">
              Aide le modèle à reconnaître des noms propres, marques ou termes techniques.
            </p>
          </div>

          
          {currentJobId && (
            <button
              onClick={handleGenerateSRT}
              disabled={isGeneratingSRT}
              className="mt-8 w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-98 text-lg disabled:hover:scale-100"
            >
              {isGeneratingSRT ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Transcription en cours...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Lancer transcription
                </span>
              )}
            </button>
          )}
        </div>
        
        {segments.length > 0 && currentJobId && (
          <div ref={subtitlesRef} className="mt-8 space-y-8">
            <AudioPlayer audioUrl={api.getAudioUrl(currentJobId)} />
            
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Sous-titres originaux</h3>
              </div>
              <SRTEditor
                segments={segments}
                onSegmentChange={handleSegmentChange}
                onDownload={handleDownloadOriginal}
              />
            </div>
            
            {Object.keys(translatedSegments).length > 0 && (
              <div className="space-y-8">
                {Object.entries(translatedSegments).map(([lang, langSegments]) => {
                  const langNames: Record<string, string> = {
                    'en': 'Anglais',
                    'nl': 'Néerlandais',
                    'es': 'Espagnol',
                    'de': 'Allemand',
                    'fr': 'Français'
                  };
                  const langName = langNames[lang] || lang.toUpperCase();
                  
                  return (
                    <div key={lang}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Sous-titres traduits ({langName})
                        </h3>
                      </div>
                      <SRTEditor
                        segments={langSegments}
                        onSegmentChange={(index, field, value) => handleTranslatedSegmentChange(lang, index, field, value)}
                        onDownload={() => handleDownloadTranslated(lang)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
            
            {currentJobData?.srt_url && (
              <>
                <TranslationPanel
                  jobId={currentJobId}
                  onTranslate={handleTranslate}
                  translations={translations}
                  isTranslating={isTranslating}
                />
                
                <NotionExportPanel
                  segments={segments}
                  jobId={currentJobId}
                  filename={currentJobData?.filename}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}