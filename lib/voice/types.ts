export type VoiceRecordingState =
  | 'idle'
  | 'requesting_permission'
  | 'recording'
  | 'processing_stt'
  | 'processing_ai'
  | 'playing_tts'
  | 'error';

export interface TranscribeResponse {
  text: string;
}

export interface TranscribeErrorResponse {
  error_code: string;
  message: string;
}

export interface SynthesiseRequest {
  text: string;
  voice?: string;
}
