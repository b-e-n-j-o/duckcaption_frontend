// Base de l'API transcription côté backend
// Par défaut on pointe vers FastAPI monté sur /api/transcription
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${BASE_URL}/api/transcription`;

export const api = {
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    return res.json();
  },

  async getAudioInfo(jobId: string) {
    const res = await fetch(`${API_URL}/audio_info/${jobId}`);
    return res.json();
  },

  async generateSRT(
    jobId: string,
    startTime?: number,
    endTime?: number,
    maxWords?: number,
    maxChars?: number,
    dryRun: boolean = false,
    engine: 'whisper_gemini' | 'scribe_v2' = 'whisper_gemini',
    keyterms?: string
  ) {
    const params = new URLSearchParams();
    if (startTime !== undefined && !isNaN(startTime)) params.append('start_time', startTime.toString());
    if (endTime !== undefined && !isNaN(endTime)) params.append('end_time', endTime.toString());
    if (maxWords !== undefined && !isNaN(maxWords)) params.append('max_words', maxWords.toString());
    if (maxChars !== undefined && !isNaN(maxChars)) params.append('max_chars', maxChars.toString());
    if (dryRun) params.append('dry_run', 'true');
    params.append('engine', engine);
    if (keyterms && engine === 'scribe_v2') {
      params.append('keyterms', keyterms);
    }
    
    const res = await fetch(`${API_URL}/generate_srt/${jobId}?${params}`, {
      method: 'POST',
    });
    
    return res.json();
  },

  async getJob(jobId: string) {
    const res = await fetch(`${API_URL}/job/${jobId}`);
    return res.json();
  },

  async translateSRT(
    jobId: string,
    languages: string[],
    method: 'classic' | 'strict' = 'strict',
  ) {
    // Endpoint backend: /api/transcription/translate/{job_id}
    const res = await fetch(`${API_URL}/translate/${jobId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ languages, method }),
    });
    
    return res.json();
  },

  async translateSRTContent(
    srt: string,
    languages: string[],
    method: 'classic' | 'strict' = 'strict',
    maxWords?: number
  ) {
    const res = await fetch(`${API_URL}/translate_srt_content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        srt,
        languages,
        method,
        max_words: maxWords,
      }),
    });

    return res.json();
  },

  getAudioUrl(jobId: string) {
    return `${API_URL}/audio/${jobId}`;
  },

  getSRTUrl(url: string) {
    return url.startsWith('http') ? url : `${API_URL}${url}`;
  },
};