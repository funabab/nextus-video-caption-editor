import { useAppStore } from '../stores/useAppStore';
import { RefreshCw, Globe, Languages, Palette } from 'lucide-react';

export default function CaptionEditor() {
  const { 
    captions, updateCaption, currentTime, selectedPresetId, presets, modelSize, isProcessing 
  } = useAppStore();

  const selectedPreset = presets.find(p => p.id === selectedPresetId)!;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar - Matches Reference */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between glass">
        <div className="flex items-center gap-2 text-sm">
          <button className="neutral-btn flex items-center gap-2 px-3 py-1.5 rounded border border-border text-xs">
            <RefreshCw size={14} /> Regenerate
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-xs">
            <Globe size={14} /> EN
          </div>
          <button className="neutral-btn flex items-center gap-2 px-3 py-1.5 rounded border border-border text-xs">
            <Languages size={14} /> Translate
          </button>
        </div>
        <button 
          onClick={() => { /* open preset sider handled in parent */ }}
          className="neutral-btn flex items-center gap-2 px-3 py-1.5 rounded border border-border text-xs"
        >
          <Palette size={14} /> {selectedPreset.name}
        </button>
      </div>

      {/* Caption List - Segmented, Highlighted, Editable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 text-sm">
        {captions.length === 0 ? (
          <div className="text-center text-muted pt-12 text-xs">Upload a video to generate captions</div>
        ) : (
          captions.map((cap) => {
            const isActive = currentTime >= cap.start && currentTime <= cap.end;
            return (
              <div 
                key={cap.id} 
                className={`group px-3 py-2.5 rounded border border-border flex gap-3 items-start caption-active transition-all ${isActive ? 'caption-active' : ''}`}
              >
                <div className="font-mono text-10 text-muted pt-0.5 w-caption-time shrink-0 tabular-nums">
                  {cap.start.toFixed(1)} → {cap.end.toFixed(1)}
                </div>
                <textarea 
                  value={cap.text}
                  onChange={(e) => updateCaption(cap.id, e.target.value)}
                  className="flex-1 bg-transparent resize-y min-h-8 focus:outline-none text-foreground placeholder:text-muted/70 text-13 leading-snug"
                  rows={1}
                />
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Status */}
      <div className="h-9 border-t border-border px-4 flex items-center text-10 text-muted justify-between">
        <div>{captions.length} segments • {modelSize.toUpperCase()}</div>
        {isProcessing && <div>Processing...</div>}
      </div>
    </div>
  );
}
