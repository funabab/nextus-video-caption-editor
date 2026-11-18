import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../stores/useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.getState().reset();
  });

  it('should initialize with default values', () => {
    const state = useAppStore.getState();
    expect(state.captions).toEqual([]);
    expect(state.isPlaying).toBe(false);
    expect(state.currentTime).toBe(0);
  });

  it('should update current time', () => {
    const { setCurrentTime } = useAppStore.getState();
    setCurrentTime(12.5);
    expect(useAppStore.getState().currentTime).toBe(12.5);
  });

  it('should toggle play state', () => {
    const { setIsPlaying } = useAppStore.getState();
    setIsPlaying(true);
    expect(useAppStore.getState().isPlaying).toBe(true);
  });

  it('should update caption text', () => {
    const { setCaptions, updateCaption } = useAppStore.getState();
    
    setCaptions([
      { id: 'c1', start: 0, end: 5, text: 'Original text' }
    ]);
    
    updateCaption('c1', 'Updated text');
    
    const updated = useAppStore.getState().captions[0];
    expect(updated.text).toBe('Updated text');
  });
});
