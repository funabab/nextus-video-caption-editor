import type { Caption, Preset } from '../types';

// Generate SRT content
export function generateSRT(captions: Caption[]): string {
  return captions
    .map((cap, index) => {
      const start = formatSRTTime(cap.start);
      const end = formatSRTTime(cap.end);
      return `${index + 1}\n${start} --> ${end}\n${cap.text}\n`;
    })
    .join('\n');
}

function formatSRTTime(seconds: number): string {
  const date = new Date(seconds * 1000);
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  return `${hh}:${mm}:${ss},${ms}`;
}

/**
 * Baked video export using Canvas + MediaRecorder.
 * This burns the captions directly into the video frames.
 * For production, this should be moved to a Web Worker.
 */
export async function exportBakedVideo(
  videoFile: File, 
  captions: Caption[], 
  preset: Preset,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    video.muted = true;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false })!;

    let mediaRecorder: MediaRecorder;
    const chunks: Blob[] = [];

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const stream = canvas.captureStream(30);
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        onProgress?.(100);
        resolve(blob);
      };

      mediaRecorder.start();
      video.play();
    };

    const drawFrame = () => {
      if (video.paused || video.ended) {
        mediaRecorder.stop();
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Find current caption
      const currentTime = video.currentTime;
      const currentCaption = captions.find(c => currentTime >= c.start && currentTime <= c.end);

      if (currentCaption) {
        const fontSize = Math.max(18, Math.floor(canvas.height * (preset.fontSize / 720)));
        
        ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = preset.color;
        ctx.textAlign = 'center';

        // Background
        ctx.fillStyle = preset.bgColor;
        ctx.globalAlpha = preset.bgOpacity;
        
        const textWidth = ctx.measureText(currentCaption.text).width;
        const padding = 20;
        const x = canvas.width / 2;
        const y = preset.position === 'top' ? 80 : 
                  preset.position === 'center' ? canvas.height / 2 : 
                  canvas.height - 80;

        ctx.fillRect(x - textWidth/2 - padding, y - fontSize - 10, textWidth + padding * 2, fontSize + 20);
        
        // Text
        ctx.globalAlpha = 1;
        ctx.fillStyle = preset.color;
        ctx.fillText(currentCaption.text, x, y);
      }

      onProgress?.(Math.floor((video.currentTime / video.duration) * 100) || 0);
      requestAnimationFrame(drawFrame);
    };

    video.onplay = () => {
      requestAnimationFrame(drawFrame);
    };

    video.onerror = () => reject(new Error('Failed to load video for export'));
  });
}
