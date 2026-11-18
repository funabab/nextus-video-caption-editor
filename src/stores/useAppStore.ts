import { create } from 'zustand';
import type { Caption, Preset } from '../types';

interface AppState {
  videoUrl: string | null;
  videoFile: File | null;
  captions: Caption[];
  currentTime: number;
  isPlaying: boolean;
  selectedPresetId: string;
  presets: Preset[];
  modelSize: 'tiny' | 'base';
  isProcessing: boolean;
  error: string | null;

  setVideo: (url: string, file: File) => void;
  setCaptions: (captions: Caption[]) => void;
  updateCaption: (id: string, text: string) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPreset: (id: string) => void;
  addPreset: (preset: Preset) => void;
  setModelSize: (size: 'tiny' | 'base') => void;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const defaultPresets: Preset[] = [
  { id: 'clean', name: 'Clean', fontSize: 24, color: '#FAFAFA', bgColor: '#000000', bgOpacity: 0.7, position: 'bottom', animation: 'fade', transitionMs: 200 },
  { id: 'minimal', name: 'Minimal', fontSize: 20, color: '#FFFFFF', bgColor: '#111111', bgOpacity: 0.5, position: 'bottom', animation: 'none', transitionMs: 100 },
  { id: 'hud', name: 'HUD', fontSize: 18, color: '#E5E5E5', bgColor: '#0A0A0A', bgOpacity: 0.85, position: 'center', animation: 'pop', transitionMs: 150 },
];

export const useAppStore = create<AppState>((set) => ({
  videoUrl: null,
  videoFile: null,
  captions: [],
  currentTime: 0,
  isPlaying: false,
  selectedPresetId: 'clean',
  presets: defaultPresets,
  modelSize: typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent) ? 'tiny' : 'base',
  isProcessing: false,
  error: null,

  setVideo: (url, file) => set({ videoUrl: url, videoFile: file, error: null }),
  setCaptions: (captions) => set({ captions }),
  updateCaption: (id, text) => set((state) => ({
    captions: state.captions.map(c => c.id === id ? { ...c, text } : c)
  })),
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPreset: (id) => set({ selectedPresetId: id }),
  addPreset: (preset) => set((state) => ({ presets: [...state.presets, preset] })),
  setModelSize: (size) => set({ modelSize: size }),
  setProcessing: (processing) => set({ isProcessing: processing }),
  setError: (error) => set({ error }),
  reset: () => set({
    videoUrl: null, videoFile: null, captions: [], currentTime: 0, isPlaying: false, error: null
  }),
}));
