import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/useAppStore';
import type { Preset } from '../types';

interface Props {
  onClose: () => void;
}

export default function PresetSider({ onClose }: Props) {
  const { presets, selectedPresetId, setPreset, addPreset } = useAppStore();
  const [editing, setEditing] = useState<Preset | null>(null);

  const current = presets.find(p => p.id === selectedPresetId)!;

  const handleSave = () => {
    if (!editing) return;
    const newPreset: Preset = { ...editing, id: 'custom-' + Date.now() };
    addPreset(newPreset);
    setPreset(newPreset.id);
    setEditing(null);
  };

  return (
    <motion.div 
      initial={{ x: '100%' }} 
      animate={{ x: 0 }} 
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-14 bottom-0 w-80 bg-background border-l border-border z-50 glass flex flex-col"
    >
      <div className="h-14 px-4 flex items-center justify-between border-b border-border">
        <div className="font-medium text-sm">Caption Style</div>
        <button onClick={onClose}><X size={18} /></button>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto flex-1 text-sm">
        {/* Preset Selector */}
        <div>
          <div className="text-xs text-muted mb-2">PRESETS</div>
          <div className="grid grid-cols-2 gap-2">
            {presets.map(p => (
              <button 
                key={p.id} 
                onClick={() => setPreset(p.id)}
                className={`px-3 py-2 rounded border text-left text-xs transition-all ${selectedPresetId === p.id ? 'border-foreground bg-card' : 'border-border hover:border-accent'}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tweak Controls - Neutral */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted">SIZE</label>
            <input type="range" min="12" max="48" value={current.fontSize} onChange={() => { /* TODO: live update preset */ }} className="w-full accent-accent" />
          </div>
          <div>
            <label className="text-xs text-muted">OPACITY</label>
            <input type="range" min="0" max="1" step="0.05" value={current.bgOpacity} onChange={() => { /* TODO */ }} className="w-full accent-accent" />
          </div>
          <div>
            <label className="text-xs text-muted">POSITION</label>
            <select value={current.position} className="w-full bg-card border border-border rounded p-2 text-xs">
              <option value="bottom">Bottom</option>
              <option value="center">Center</option>
              <option value="top">Top</option>
            </select>
          </div>
        </div>

        <button onClick={() => setEditing(current)} className="w-full neutral-btn py-2 border border-border rounded text-xs flex items-center justify-center gap-2">
          <Save size={14} /> Save as New Preset
        </button>
      </div>

      {editing && (
        <div className="p-4 border-t border-border">
          <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="bg-card border border-border w-full p-2 rounded text-sm mb-3" />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 bg-accent text-background py-1.5 rounded text-xs">Save</button>
            <button onClick={() => setEditing(null)} className="flex-1 border border-border py-1.5 rounded text-xs">Cancel</button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
