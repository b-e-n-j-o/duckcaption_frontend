export interface Job {
  id: string;
  filename: string;
  status: string;
  srt_url?: string;
  language?: string;
  srt_filename?: string;
  error?: string;
  audio_url?: string;
  translations?: string; // JSON string
}

export interface AudioInfo {
  duration_sec: number;
  duration_min: number;
  estimated_cost: number;
  whisper_cost_usd?: number;
  gemini_tokens?: number;
}

export interface SRTSegment {
  index: string;
  time: string;
  text: string;
}

export interface TranslationResponse {
  translations: Record<string, string>;
  error?: string;
}
