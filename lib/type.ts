export interface Job {
    id: string;
    filename: string;
    status: string;
    srt_url?: string;
    error?: string;
    audio_url?: string;
  }
  
  export interface AudioInfo {
    duration_sec: number;
    duration_min: number;
    estimated_cost: number;
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