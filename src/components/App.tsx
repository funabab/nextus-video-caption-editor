import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { Settings, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../stores/useAppStore';
import VideoPreview from './VideoPreview';
import CaptionEditor from './CaptionEditor';
import PresetSider from './PresetSider';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { transcribeAudio, extractAudioFromVideo } from '../lib/transcribe';
import { generateSRT, exportBakedVideo } from '../lib/export';

export default function App() {
  const [siderOpen, setSiderOpen] = useState(false);
  const { 
    videoUrl, isPlaying, setIsPlaying, currentTime, setCurrentTime, 
    captions, selectedPresetId, presets, error, reset, isProcessing, setError 
  } = useAppStore();

  // Browser capability check
  React.useEffect(() => {
    const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
    const hasWebkitAudio = 'webkitAudioContext' in window;
    const hasAudioContext = typeof AudioContext !== 'undefined' || hasWebkitAudio;
    
    if (!hasMediaRecorder || !hasAudioContext) {
      setError('Your browser does not support required features (MediaRecorder / Audio). Please use a modern browser (Chrome, Edge, Firefox).');
    }
  }, [setError]);

  const selectedPreset = presets.find(p => p.id === selectedPresetId)!;

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoUrl) return;

      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
      if (e.key === 'ArrowRight') {
        setCurrentTime(Math.min(currentTime + 10, 9999));
      }
      if (e.key === 'ArrowLeft') {
        setCurrentTime(Math.max(currentTime - 10, 0));
      }
      if (e.key.toLowerCase() === 's' && e.metaKey) {
        e.preventDefault();
        document.dispatchEvent(new Event('trigger-export'));
      }
      if (e.key === 'Escape' && siderOpen) {
        setSiderOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoUrl, isPlaying, currentTime, siderOpen, setIsPlaying, setCurrentTime]);

  // Persistence (captions + preset)
  React.useEffect(() => {
    if (captions.length > 0) {
      localStorage.setItem('nexus-captions', JSON.stringify({
        captions,
        selectedPresetId,
        timestamp: Date.now()
      }));
    }
  }, [captions, selectedPresetId]);

  // Load saved project on mount (if no video)
  React.useEffect(() => {
    const saved = localStorage.getItem('nexus-captions');
    if (saved && !videoUrl) {
      try {
        const data = JSON.parse(saved);
        if (data.captions) {
          useAppStore.getState().setCaptions(data.captions);
          if (data.selectedPresetId) {
            useAppStore.getState().setPreset(data.selectedPresetId);
          }
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {/* Top Bar - Neutral Futuristic */}
      <header className="h-14 border-b border-border flex items-center px-6 justify-between z-50 glass">
        <div className="flex items-center gap-3">
          <div className="font-mono text-sm tracking-3 text-foreground">NEXUS</div>
          <div className="text-muted text-xs">CAPTIONS</div>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          {videoUrl && (
            <>
              <button onClick={reset} className="neutral-btn px-3 py-1.5 rounded border border-border flex items-center gap-2 hover:border-accent">
                <RefreshCw size={14} /> New
              </button>
              <button onClick={() => setSiderOpen(!siderOpen)} className="neutral-btn px-3 py-1.5 rounded border border-border flex items-center gap-2 hover:border-accent">
                <Settings size={14} /> Style
              </button>
              <button 
                onClick={async () => {
                  const state = useAppStore.getState();
                  if (!state.videoFile || state.captions.length === 0) return;

                  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
                  const baseName = `nexus-captions-${date}`;

                  // SRT Export (always available)
                  const srt = generateSRT(state.captions);
                  const srtBlob = new Blob([srt], { type: 'text/plain' });
                  const srtUrl = URL.createObjectURL(srtBlob);
                  const a = document.createElement('a');
                  a.href = srtUrl;
                  a.download = `${baseName}.srt`;
                  a.click();

                  toast.success('SRT downloaded');

                  // Baked video export (captions burned into video)
                  if (confirm('Export video with baked-in captions? (outputs WebM)')) {
                    const loadingToast = toast.loading('Rendering baked video...');
                    const blob = await exportBakedVideo(
                      state.videoFile, 
                      state.captions, 
                      state.presets.find(p => p.id === state.selectedPresetId)!,
                      (p) => toast.loading(`Rendering... ${p}%`, { id: loadingToast })
                    );
                    const url = URL.createObjectURL(blob);
                    const va = document.createElement('a');
                    va.href = url;
                    va.download = `${baseName}.webm`;
                    va.click();
                    toast.success('Baked video exported', { id: loadingToast });
                  }
                }}
                className="neutral-btn px-4 py-1.5 rounded bg-accent text-background flex items-center gap-2 font-medium"
              >
                <Download size={14} /> Export
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Split View - Matches Reference */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Video Preview */}
        <div className="flex-1 flex flex-col border-r border-border bg-background relative min-w-0">
          {videoUrl ? (
            <VideoPreview 
              src={videoUrl} 
              currentTime={currentTime} 
              setCurrentTime={setCurrentTime}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              captions={captions}
              preset={selectedPreset}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <UploadZone />
            </div>
          )}
          {videoUrl && captions.length === 0 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
              <button 
                onClick={async () => {
                  const state = useAppStore.getState();
                  const file = state.videoFile;
                  if (!file) return;
                  
                  state.setProcessing(true);
                  const toastId = toast.loading(`Downloading ${state.modelSize} model & transcribing...`, { duration: Infinity });
                  
                  try {
                    const audio = await extractAudioFromVideo(file);
                    const result = await transcribeAudio(audio, state.modelSize, () => {
                      // progress update
                    });
                    
                    type Chunk = { timestamp: [number, number]; text: string };
                    const segments = (result.chunks || []).map((chunk: Chunk, i: number) => ({
                      id: 'c' + i,
                      start: chunk.timestamp[0],
                      end: chunk.timestamp[1] || chunk.timestamp[0] + 3,
                      text: chunk.text.trim()
                    }));
                    
                    state.setCaptions(segments);
                    toast.success('Captions generated locally', { id: toastId });
                  } catch (error: unknown) {
                    console.error(error);
                    state.setError('Could not extract audio. Try a different video file or format.');
                    toast.error('Audio extraction failed', { id: toastId });
                  }
                  state.setProcessing(false);
                }}
                 className="neutral-btn px-5 py-2 rounded border border-accent text-xs tracking-widest disabled:opacity-50"

                disabled={isProcessing}
              >
                {isProcessing ? 'PROCESSING...' : 'GENERATE CAPTIONS (LOCAL WHISPER)'}
              </button>
            </div>
          )}
        </div>

        {/* Right: Caption Editor */}
        <div className="w-editor-width flex flex-col bg-background min-w-0">
          <CaptionEditor />
        </div>
      </div>

      {/* Style Sider - Slides in (matches reference) */}
      <AnimatePresence>
        {siderOpen && (
          <PresetSider onClose={() => setSiderOpen(false)} />
        )}
      </AnimatePresence>

      <Toaster position="top-center" richColors closeButton theme="dark" />
      
      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-950 border border-red-900 text-red-200 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <PWAInstallPrompt />
    </div>
  );
}

function UploadZone() {
  const { setVideo, setError, setProcessing } = useAppStore();
  
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Unsupported format. Use MP4, MOV or WebM.');
      return;
    }
    setProcessing(true);
    try {
      const url = URL.createObjectURL(file);
      setVideo(url, file);
    } catch {
      setError('Failed to load video');
    }
    setProcessing(false);
  };

  return (
      <div 
      className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-accent transition-all max-w-md"
      onClick={() => document.getElementById('file-input')?.click()}
      onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
      onDragOver={(e) => e.preventDefault()}
    >
      <input id="file-input" type="file" accept="video/*" className="hidden" onChange={(_e) => handleFile((_e.target as HTMLInputElement).files?.[0] as File)} />
      <div className="text-muted mb-2">Drop video here or click to upload</div>
      <div className="text-xs text-muted/60">MP4 • MOV • WebM • Local processing only</div>
    </div>

  );
}
