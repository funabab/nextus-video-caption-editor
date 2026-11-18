import { useRef, useEffect } from 'react';
import type { Caption, Preset } from '../types';
import { useAppStore } from '../stores/useAppStore';
import { Play, Pause } from 'lucide-react';

interface Props {
  src: string;
  currentTime: number;
  setCurrentTime: (t: number) => void;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  captions: Caption[];
  preset: Preset;
}

export default function VideoPreview({ src, currentTime, setCurrentTime, isPlaying, setIsPlaying, captions, preset }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setCurrentTime: storeSetTime } = useAppStore();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      storeSetTime(video.currentTime);
    };
    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, [storeSetTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Math.abs(video.currentTime - currentTime) > 0.3) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    isPlaying ? video.play().catch(() => {}) : video.pause();
  }, [isPlaying]);

  const currentCaption = captions.find(c => currentTime >= c.start && currentTime <= c.end);

  const getOverlayStyle = () => {
    const base: React.CSSProperties = {
      fontSize: `${preset.fontSize}px`,
      color: preset.color,
      backgroundColor: preset.bgColor,
      opacity: preset.bgOpacity,
      transition: `all ${preset.transitionMs}ms ease`,
      padding: '4px 16px',
      borderRadius: '4px',
      textAlign: 'center',
      maxWidth: '80%',
      whiteSpace: 'pre-wrap',
    };
    if (preset.animation === 'pop' && currentCaption) base.transform = 'scale(1.02)';
    return base;
  };

  const positionClass = 
    preset.position === 'bottom' ? 'bottom-12' : 
    preset.position === 'top' ? 'top-12' : 'top-1/2 -translate-y-1/2';

  return (
    <div className="relative flex-1 flex items-center justify-center bg-background overflow-hidden">
      <video 
        ref={videoRef} 
        src={src} 
        className="max-h-full max-w-full object-contain" 
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Caption Overlay - Neutral Glass */}
      {currentCaption && (
        <div className={`absolute left-1/2 -translate-x-1/2 z-10 ${positionClass}`}>
          <div style={getOverlayStyle()} className="glass shadow-xl">
            {currentCaption.text}
          </div>
        </div>
      )}

      {/* Player Controls - Neutral */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 flex items-center gap-4 z-20">
        <button onClick={() => setIsPlaying(!isPlaying)} className="text-foreground p-2">
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <input 
          type="range" 
          min={0} 
          max={videoRef.current?.duration || 100} 
          step={0.01}
          value={currentTime}
          onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
          className="flex-1 accent-accent"
        />
        <div className="font-mono text-xs text-muted tabular-nums w-20 text-right">
          {currentTime.toFixed(1)}s
        </div>
      </div>
    </div>
  );
}
