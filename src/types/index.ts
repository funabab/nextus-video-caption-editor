export interface Caption {
  id: string;
  start: number;
  end: number;
  text: string;
}

export interface Preset {
  id: string;
  name: string;
  fontSize: number;
  color: string;
  bgColor: string;
  bgOpacity: number;
  position: 'bottom' | 'center' | 'top';
  animation: 'none' | 'fade' | 'pop' | 'slide';
  transitionMs: number;
}

export interface TranscriptionResult {
  segments: Array<{ start: number; end: number; text: string }>;
}
