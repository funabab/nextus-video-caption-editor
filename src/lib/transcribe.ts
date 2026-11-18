import { pipeline, env, AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers';

// Configure for browser
env.allowLocalModels = false;
env.useBrowserCache = true;

let transcriber: AutomaticSpeechRecognitionPipeline | null = null;

interface ProgressInfo {
  status: string;
  loaded?: number;
  total?: number;
}

export async function transcribeAudio(
  audio: Float32Array, 
  modelSize: 'tiny' | 'base' = 'tiny', 
  onProgress?: (progress: number) => void
): Promise<{ chunks?: Array<{ timestamp: [number, number]; text: string }> }> {
  if (!transcriber) {
    transcriber = await pipeline('automatic-speech-recognition', `Xenova/whisper-${modelSize}`, {
      device: 'webgpu',
      dtype: 'q4',
      progress_callback: (progress: ProgressInfo) => {
        if (onProgress && progress.status === 'progress' && progress.loaded && progress.total) {
          onProgress(Math.round((progress.loaded / progress.total) * 100));
        }
      }
    }) as AutomaticSpeechRecognitionPipeline;
  }

  const result = await transcriber(audio, {
    return_timestamps: true,
    chunk_length_s: 30,
    stride_length_s: 5,
  });

  return result as { chunks?: Array<{ timestamp: [number, number]; text: string }> };
}

/**
 * Extract audio from video. Uses Web Audio API (reliable fallback).
 * MediaBunny integration can be added for more advanced use cases.
 */
export async function extractAudioFromVideo(file: File): Promise<Float32Array> {
  const arrayBuffer = await file.arrayBuffer();
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioContext = new AudioContextClass();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // Convert to mono 16kHz
  const offline = new OfflineAudioContext(1, audioBuffer.duration * 16000, 16000);
  const source = offline.createBufferSource();
  source.buffer = audioBuffer;
  const gain = offline.createGain();
  const merger = offline.createChannelMerger(1);
  source.connect(gain);
  gain.connect(merger);
  merger.connect(offline.destination);
  source.start();
  
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0);
}
