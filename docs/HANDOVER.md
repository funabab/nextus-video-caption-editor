# Nexus Captions - AI Agent Handover Document

**Project**: Local-first AI Video Caption Editor  
**Status**: Core features implemented and visually verified  
**Last Updated**: 2026-07-10

---

## Project Overview

Nexus Captions is a fully client-side Progressive Web App (PWA) for editing and baking captions into videos using local AI (Whisper via Transformers.js) and MediaBunny for video processing.

**Key Constraints**:
- Everything runs in the browser (no backend)
- First-time model download is cached
- Must use MediaBunny for video operations where possible
- Strict neutral dark futuristic design system (no neon/magenta)
- All TypeScript strict, ESLint clean, no `any`

---

## Current Architecture

### Tech Stack
- **Framework**: Astro 7 + React 19
- **Styling**: Tailwind 4 with custom `@theme` design system
- **State**: Zustand
- **AI**: `@huggingface/transformers` (Whisper tiny/base)
- **Video**: `mediabunny` (used in export + audio extraction fallback)
- **PWA**: `@vite-pwa/astro` (disabled in dev)
- **Linting**: ESLint + Astro + Tailwind + TypeScript plugins
- **Testing**: Vitest + Testing Library

### Design System (src/styles/global.css)
- `--color-background`, `--color-foreground`, `--color-muted`, `--color-border`, `--color-card`, `--color-accent`
- Extended tokens: `w-editor-width`, `tracking-3`, `text-10`, `text-13`, etc.
- **Strict rule**: `no-arbitrary-value` is enforced as error

### Key Components
- `src/components/App.tsx` — Main shell + keyboard shortcuts + persistence
- `src/components/VideoPreview.tsx` — Video player + live caption overlay
- `src/components/CaptionEditor.tsx` — Toolbar + editable segmented list
- `src/components/PresetSider.tsx` — Style editor + save presets
- `src/components/PWAInstallPrompt.tsx` — Install banner
- `src/stores/useAppStore.ts` — Central state (Zustand)

### Workers (Prepared)
- `src/workers/whisper.worker.ts` — Created but not fully integrated (main thread used for stability)

---

## What's Implemented

### Core Features
- [x] Video upload with format validation
- [x] Local Whisper transcription (tiny/base, auto model download & cache)
- [x] Live preview with synced caption overlay (respects preset style)
- [x] Caption list with inline editing and active highlight
- [x] Preset system (5 built-in) + live style sider with save
- [x] SRT export with unique dated filename
- [x] Baked video export (Canvas + MediaRecorder — captions burned in)
- [x] Keyboard shortcuts (Space/K, ←/→, Cmd+S, Esc)
- [x] PWA install prompt
- [x] LocalStorage persistence (captions + selected preset)
- [x] Browser capability checks + error handling
- [x] Full ESLint + TypeScript strict mode (0 errors/warnings)
- [x] Vitest tests for core functions (generateSRT, store)

### Visual & UX
- [x] Neutral dark futuristic design system matching reference images
- [x] Glassmorphism, HUD grid, proper typography
- [x] Responsive split layout (desktop) + mobile considerations

---

## What's Missing / Recommended Next Work

### High Priority
1. **Full MediaBunny Baked Export**  
   Current implementation uses Canvas + MediaRecorder (pragmatic).  
   Replace with proper `VideoSampleSink` + `CanvasSource` + frame-by-frame caption drawing for better quality/control.

2. **Proper Web Worker Integration for Whisper**  
   The worker file exists. Wire it up so heavy transcription runs off the main thread.

3. **Robust Audio Extraction**  
   Current method uses Web Audio API fallback. Improve MediaBunny `AudioSampleSink` path for better compatibility with large/long videos.

4. **Export Progress & Cancellation**  
   The baked export currently has basic progress but no cancel support.

### Medium Priority
- IndexedDB persistence (currently only localStorage for captions)
- Better error messages for transcription failures
- Support for more caption animations in overlay
- Add undo/redo for caption edits
- Improve mobile experience (currently desktop-first)

### Low Priority / Polish
- Custom font support in presets
- Subtitle track (WebVTT) export option alongside baked video
- Performance profiling for very long videos (>10min)

---

## How to Run the Project

```bash
# Install dependencies
pnpm install

# Start dev server (background mode)
pnpm astro dev --background

# Run linter
pnpm lint

# Run tests
pnpm test:run

# Build for production
pnpm build
```

**Important**: PWA service worker is disabled in development (`devOptions.enabled: false`).

---

## Key Files for New Agents

| File | Purpose |
|------|---------|
| `src/pages/index.astro` | Root entry + global CSS import |
| `src/styles/global.css` | Design system tokens (`@theme`) |
| `src/stores/useAppStore.ts` | Single source of truth |
| `src/lib/transcribe.ts` | Whisper pipeline + audio extraction |
| `src/lib/export.ts` | SRT + baked video export logic |
| `eslint.config.js` | Strict lint rules (no arbitrary values, no any) |
| `docs/designs/` | UI reference screenshots (must match) |

---

## Known Technical Debt

- Some `any` were removed, but the Whisper pipeline return type is still partially loose.
- The baked export always outputs WebM (MediaRecorder limitation). MP4 would require MediaBunny.
- Audio resampling to exactly 16kHz is not implemented (Whisper works but quality may vary).
- The demo "Generate Captions" button uses the real model but does not yet use the worker.

---

## Testing Notes

- 6 tests currently passing (`generateSRT` + store operations)
- No E2E tests yet (Playwright or Cypress recommended for future)
- Visual regression testing is manual against `docs/designs/` references

---

## Contact / Next Steps

If continuing development:
1. Start by running `pnpm lint` and `pnpm astro check` — both must stay green.
2. When modifying styles, prefer adding tokens to `@theme` instead of arbitrary values.
3. For any new AI processing, prefer Web Workers.
4. Keep the neutral color palette — no cyan/magenta.

---

**This document should be updated after each major feature addition.**
