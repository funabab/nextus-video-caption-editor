// src/workers/whisper.worker.ts
import { pipeline, env, AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;

interface WorkerMessage {
  type: string;
  payload?: {
    modelSize?: 'tiny' | 'base';
    audio?: Float32Array;
  };
}

interface TranscriptionChunk {
  timestamp: [number, number];
  text: string;
}

let transcriber: AutomaticSpeechRecognitionPipeline | null = null;

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  if (type === 'init' && payload?.modelSize) {
    try {
      transcriber = await pipeline('automatic-speech-recognition', `Xenova/whisper-${payload.modelSize}`, {
        device: 'webgpu',
        dtype: 'q4',
      }) as AutomaticSpeechRecognitionPipeline;
      self.postMessage({ type: 'init-complete' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      self.postMessage({ type: 'error', error: message });
    }
  }

  if (type === 'transcribe' && payload) {
    const { audio, modelSize = 'tiny' } = payload;
    
    try {
      if (!transcriber) {
        transcriber = await pipeline('automatic-speech-recognition', `Xenova/whisper-${modelSize}`, {
          device: 'webgpu',
          dtype: 'q4',
        }) as AutomaticSpeechRecognitionPipeline;
      }

      if (!audio) {
        throw new Error('No audio data provided');
      }

      const result = await transcriber(audio, {
        return_timestamps: true,
        chunk_length_s: 30,
        stride_length_s: 5,
      }) as { chunks?: TranscriptionChunk[] };

      const segments = (result.chunks || []).map((chunk, i: number) => ({
        id: 'c' + i,
        start: chunk.timestamp[0],
        end: chunk.timestamp[1] || chunk.timestamp[0] + 3,
        text: chunk.text.trim()
      }));

      self.postMessage({ type: 'result', segments });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      self.postMessage({ type: 'error', error: message });
    }
  }
};
