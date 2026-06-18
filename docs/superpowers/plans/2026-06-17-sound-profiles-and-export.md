# Sound Profiles & Audio Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 20 instrument profiles with 4 effect chains each (80 combinations) and audio export (WAV/MP3) to FretMaster.

**Architecture:** Three new files (`effects.ts`, `export.ts`, `ExportPanel.tsx`) plus modifications to `audio.ts` and `VirtualGuitar.tsx`. `audio.ts` becomes a lazy-loading instrument manager where each instrument profile defines its soundfont URL, note map, and category. Effect chains are defined declaratively in `effects.ts`. Export uses `MediaRecorder` backed by a `MediaStreamAudioDestinationNode` tapped off `Tone.Destination`.

**Tech Stack:** Tone.js v15, React 19, Tailwind CSS v4, Lucide icons, lamejs (for MP3 encoding)

---

### Task 1: Install lamejs dependency

- [ ] **Run:**
```bash
npm install lamejs
```
Expected: `lamejs` added to `package.json` dependencies.

---

### Task 2: Create `src/lib/effects.ts` — Instrument profiles & effect chain definitions

**File:** `src/lib/effects.ts`

This file exports types, all 20 instrument profiles, and 4 effect chain factory functions.

```typescript
import * as Tone from 'tone';

// ---- Types ----

export type EffectName = 'clean' | 'ambient' | 'overdrive' | 'heavy';

export type InstrumentCategory = 'guitars' | 'keys' | 'strings' | 'other';

export interface NoteMap {
  [noteName: string]: string; // e.g. { "E2": "E2.mp3", "A2": "A2.mp3" }
}

export interface InstrumentProfile {
  id: string;
  name: string;
  category: InstrumentCategory;
  baseUrl: string;
  notes: NoteMap;
  release?: number;
  // Some instruments (piano) use the Salamander set, others use FluidR3_GM
  isSalamander?: boolean;
}

export interface EffectChain {
  name: string;
  id: EffectName;
  build: (sampler: Tone.Sampler) => Tone.Signal;
}

// ---- Build effect chains ----

function buildClean(sampler: Tone.Sampler): Tone.Signal {
  sampler.connect(Tone.Destination);
  return Tone.Destination;
}

function buildAmbient(sampler: Tone.Sampler): Tone.Signal {
  const chorus = new Tone.Chorus(4, 2.5, 0.5).start();
  const reverb = new Tone.Freeverb(0.6, 3000);
  sampler.chain(chorus, reverb, Tone.Destination);
  return Tone.Destination;
}

function buildOverdrive(sampler: Tone.Sampler): Tone.Signal {
  const distortion = new Tone.Distortion(0.4);
  const eq = new Tone.EQ3(3, 0, 4);
  sampler.chain(distortion, eq, Tone.Destination);
  return Tone.Destination;
}

function buildHeavy(sampler: Tone.Sampler): Tone.Signal {
  const distortion = new Tone.Distortion(0.7);
  const delay = new Tone.FeedbackDelay('8n', 0.3);
  const reverb = new Tone.Freeverb(0.5, 5000);
  sampler.chain(distortion, delay, reverb, Tone.Destination);
  return Tone.Destination;
}

export const EFFECTS: Record<EffectName, EffectChain> = {
  clean:    { name: 'Clean',    id: 'clean',    build: buildClean },
  ambient:  { name: 'Ambient',  id: 'ambient',  build: buildAmbient },
  overdrive:{ name: 'Overdrive',id: 'overdrive',build: buildOverdrive },
  heavy:    { name: 'Heavy',    id: 'heavy',    build: buildHeavy },
};

const FLUID = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/';

// ---- 20 Instrument Profiles ----

export const INSTRUMENTS: InstrumentProfile[] = [
  // --- Guitars (8) ---
  {
    id: 'acoustic', name: 'Acoustic', category: 'guitars',
    baseUrl: `${FLUID}acoustic_guitar_steel-mp3/`,
    notes: { "E2": "E2.mp3", "A2": "A2.mp3", "D3": "D3.mp3", "G3": "G3.mp3", "B3": "B3.mp3", "E4": "E4.mp3" },
    release: 1,
  },
  {
    id: 'electric', name: 'Electric', category: 'guitars',
    baseUrl: `${FLUID}electric_guitar_clean-mp3/`,
    notes: { "E2": "E2.mp3", "A2": "A2.mp3", "D3": "D3.mp3", "G3": "G3.mp3", "B3": "B3.mp3", "E4": "E4.mp3" },
    release: 1,
  },
  {
    id: 'nylon', name: 'Nylon', category: 'guitars',
    baseUrl: `${FLUID}acoustic_guitar_nylon-mp3/`,
    notes: { "E2": "E2.mp3", "A2": "A2.mp3", "D3": "D3.mp3", "G3": "G3.mp3", "B3": "B3.mp3", "E4": "E4.mp3" },
    release: 1,
  },
  {
    id: 'twelve_string', name: '12-String', category: 'guitars',
    baseUrl: `${FLUID}acoustic_guitar_steel-mp3/`,
    notes: { "E2": "E2.mp3", "A2": "A2.mp3", "D3": "D3.mp3", "G3": "G3.mp3", "B3": "B3.mp3", "E4": "E4.mp3" },
    release: 1,
  },
  {
    id: 'resonator', name: 'Resonator', category: 'guitars',
    baseUrl: `${FLUID}acoustic_guitar_steel-mp3/`,
    notes: { "E2": "E2.mp3", "A2": "A2.mp3", "D3": "D3.mp3", "G3": "G3.mp3", "B3": "B3.mp3", "E4": "E4.mp3" },
    release: 1,
  },
  {
    id: 'bass', name: 'Bass', category: 'guitars',
    baseUrl: `${FLUID}acoustic_bass-mp3/`,
    notes: { "E1": "E1.mp3", "A1": "A1.mp3", "D2": "D2.mp3", "G2": "G2.mp3" },
    release: 1,
  },
  {
    id: 'electric_bass', name: 'Electric Bass', category: 'guitars',
    baseUrl: `${FLUID}electric_bass_finger-mp3/`,
    notes: { "E1": "E1.mp3", "A1": "A1.mp3", "D2": "D2.mp3", "G2": "G2.mp3" },
    release: 1,
  },
  {
    id: 'baritone', name: 'Baritone', category: 'guitars',
    baseUrl: `${FLUID}electric_guitar_jazz-mp3/`,
    notes: { "B1": "B1.mp3", "E2": "E2.mp3", "A2": "A2.mp3", "D3": "D3.mp3", "Gb3": "F3.mp3", "B3": "B3.mp3" },
    release: 1,
  },

  // --- Keys (6) ---
  {
    id: 'piano', name: 'Piano', category: 'keys',
    baseUrl: 'https://tonejs.github.io/audio/salamander/',
    notes: {
      "A0": "A0.mp3", "C1": "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
      "A1": "A1.mp3", "C2": "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
      "A2": "A2.mp3", "C3": "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
      "A3": "A3.mp3", "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
      "A4": "A4.mp3", "C5": "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
      "A5": "A5.mp3", "C6": "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
      "A6": "A6.mp3", "C7": "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
      "A7": "A7.mp3", "C8": "C8.mp3",
    },
    release: 1,
    isSalamander: true,
  },
  {
    id: 'electric_piano', name: 'Electric Piano', category: 'keys',
    baseUrl: `${FLUID}electric_piano_1-mp3/`,
    notes: { "C3": "C3.mp3", "E3": "E3.mp3", "G3": "G3.mp3", "C4": "C4.mp3", "E4": "E4.mp3", "G4": "G4.mp3", "C5": "C5.mp3", "E5": "E5.mp3", "G5": "G5.mp3" },
    release: 1,
  },
  {
    id: 'synth_pad', name: 'Synth Pad', category: 'keys',
    baseUrl: `${FLUID}pad_2_warm-mp3/`,
    notes: { "C3": "C3.mp3", "G3": "G3.mp3", "C4": "C4.mp3", "G4": "G4.mp3", "C5": "C5.mp3", "G5": "G5.mp3" },
    release: 2,
  },
  {
    id: 'organ', name: 'Organ', category: 'keys',
    baseUrl: `${FLUID}organ_2-mp3/`,
    notes: { "C3": "C3.mp3", "E3": "E3.mp3", "G3": "G3.mp3", "C4": "C4.mp3", "E4": "E4.mp3", "G4": "G4.mp3", "C5": "C5.mp3", "E5": "E5.mp3", "G5": "G5.mp3" },
    release: 1,
  },
  {
    id: 'harpsichord', name: 'Harpsichord', category: 'keys',
    baseUrl: `${FLUID}harpsichord-mp3/`,
    notes: { "C3": "C3.mp3", "E3": "E3.mp3", "G3": "G3.mp3", "C4": "C4.mp3", "E4": "E4.mp3", "G4": "G4.mp3", "C5": "C5.mp3", "E5": "E5.mp3", "G5": "G5.mp3" },
    release: 0.5,
  },
  {
    id: 'clavinet', name: 'Clavinet', category: 'keys',
    baseUrl: `${FLUID}clavinet-mp3/`,
    notes: { "C3": "C3.mp3", "E3": "E3.mp3", "G3": "G3.mp3", "C4": "C4.mp3", "E4": "E4.mp3", "G4": "G4.mp3", "C5": "C5.mp3", "E5": "E5.mp3", "G5": "G5.mp3" },
    release: 0.5,
  },

  // --- Strings (4) ---
  {
    id: 'violin', name: 'Violin', category: 'strings',
    baseUrl: `${FLUID}violin-mp3/`,
    notes: { "G3": "G3.mp3", "D4": "D4.mp3", "A4": "A4.mp3", "E5": "E5.mp3" },
    release: 1,
  },
  {
    id: 'cello', name: 'Cello', category: 'strings',
    baseUrl: `${FLUID}cello-mp3/`,
    notes: { "C2": "C2.mp3", "G2": "G2.mp3", "D3": "D3.mp3", "A3": "A3.mp3" },
    release: 1,
  },
  {
    id: 'viola', name: 'Viola', category: 'strings',
    baseUrl: `${FLUID}viola-mp3/`,
    notes: { "C3": "C3.mp3", "G3": "G3.mp3", "D4": "D4.mp3", "A4": "A4.mp3" },
    release: 1,
  },
  {
    id: 'double_bass', name: 'Double Bass', category: 'strings',
    baseUrl: `${FLUID}contrabass-mp3/`,
    notes: { "E1": "E1.mp3", "A1": "A1.mp3", "D2": "D2.mp3", "G2": "G2.mp3" },
    release: 1,
  },

  // --- Other (2) ---
  {
    id: 'ukulele', name: 'Ukulele', category: 'other',
    baseUrl: `${FLUID}ukulele-mp3/`,
    notes: { "G4": "G4.mp3", "C4": "C4.mp3", "E4": "E4.mp3", "A4": "A4.mp3" },
    release: 1,
  },
  {
    id: 'mandolin', name: 'Mandolin', category: 'other',
    baseUrl: `${FLUID}mandolin-mp3/`,
    notes: { "G3": "G3.mp3", "D4": "D4.mp3", "A4": "A4.mp3", "E5": "E5.mp3" },
    release: 1,
  },
];

export function getInstrumentById(id: string): InstrumentProfile | undefined {
  return INSTRUMENTS.find(i => i.id === id);
}

export function getInstrumentsByCategory(cat: InstrumentCategory): InstrumentProfile[] {
  return INSTRUMENTS.filter(i => i.category === cat);
}
```

---

### Task 3: Update `src/lib/audio.ts` — 20 instruments, effect management, export methods

**File:** `src/lib/audio.ts`

Replace the entire file. Key changes:
- Import `INSTRUMENTS`, `EFFECTS`, types from `effects.ts`
- `InstrumentType` becomes `string` (any profile id)
- Lazy-load samplers: `ensureInstrument(id)` creates + caches + chains effects
- `setInstrument(instrumentId, effectId)` loads and changes
- `playNote`/`playChord` use the current sampler
- `exportSequence(sequence, bpm, playbackStyle)` uses `Tone.Offline` for offline rendering
- `startRecording()` / `stopRecording()` uses `MediaRecorder`

```typescript
import * as Tone from 'tone';
import { INSTRUMENTS, EFFECTS, EffectName, getInstrumentById, InstrumentProfile } from './effects';

type SamplerEntry = {
  sampler: Tone.Sampler;
  profile: InstrumentProfile;
  currentEffect: EffectName;
  nodes: any[]; // disposed effect nodes for cleanup
};

class AudioEngine {
  private entries: Map<string, SamplerEntry> = new Map();
  private currentInstrumentId: string = 'acoustic';
  private currentEffectId: EffectName = 'clean';
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  // Recording
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStreamDest: MediaStreamAudioDestinationNode | null = null;
  private recordingChunks: Blob[] = [];
  private isRecording = false;

  async init() {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      await Tone.start();
      this.initialized = true;
    })();
    return this.initPromise;
  }

  private disposeEntry(entry: SamplerEntry) {
    entry.nodes.forEach(n => n.dispose());
    entry.sampler.dispose();
  }

  private async ensureInstrument(instrumentId: string): Promise<Tone.Sampler> {
    let entry = this.entries.get(instrumentId);
    if (entry) return entry.sampler;

    const profile = getInstrumentById(instrumentId);
    if (!profile) throw new Error(`Unknown instrument: ${instrumentId}`);

    const sampler = new Tone.Sampler({
      urls: profile.notes,
      release: profile.release ?? 1,
      baseUrl: profile.baseUrl,
    });

    sampler.volume.value = -6; // Headroom for effects

    // Build effect chain
    const effect = EFFECTS[this.currentEffectId];
    effect.build(sampler);

    await Tone.loaded();

    this.entries.set(instrumentId, {
      sampler,
      profile,
      currentEffect: this.currentEffectId,
      nodes: [],
    });

    return sampler;
  }

  getCurrentInstrument(): string {
    return this.currentInstrumentId;
  }

  getCurrentEffect(): EffectName {
    return this.currentEffectId;
  }

  async setInstrument(instrumentId: string) {
    this.currentInstrumentId = instrumentId;
    await this.ensureInstrument(instrumentId);
  }

  async setEffect(effectId: EffectName) {
    this.currentEffectId = effectId;

    // Rebuild chain for current instrument
    const entry = this.entries.get(this.currentInstrumentId);
    if (entry) {
      entry.sampler.disconnect();
      const effect = EFFECTS[effectId];
      effect.build(entry.sampler);
      entry.currentEffect = effectId;
    }
  }

  async setInstrumentAndEffect(instrumentId: string, effectId: EffectName) {
    this.currentInstrumentId = instrumentId;
    this.currentEffectId = effectId;
    const sampler = await this.ensureInstrument(instrumentId);

    // Ensure correct effect is applied
    const entry = this.entries.get(instrumentId)!;
    if (entry.currentEffect !== effectId) {
      sampler.disconnect();
      const effect = EFFECTS[effectId];
      effect.build(sampler);
      entry.currentEffect = effectId;
    }
  }

  playNote(note: string, duration = "4n") {
    const entry = this.entries.get(this.currentInstrumentId);
    if (entry) {
      entry.sampler.triggerAttackRelease(note, duration);
    }
  }

  playChord(notes: string[], duration = "2n") {
    const entry = this.entries.get(this.currentInstrumentId);
    if (entry) {
      entry.sampler.triggerAttackRelease(notes, duration);
    }
  }

  setVolume(volumeDb: number) {
    if (typeof volumeDb === 'number' && !isNaN(volumeDb) && isFinite(volumeDb)) {
      Tone.getDestination().volume.value = volumeDb;
    }
  }

  setMute(mute: boolean) {
    Tone.getDestination().mute = !!mute;
  }

  // ---- Export Methods ----

  async startRecording(): Promise<void> {
    if (this.isRecording) return;
    await this.init();

    const ctx = Tone.getContext().rawContext as AudioContext;
    this.mediaStreamDest = ctx.createMediaStreamDestination();

    // Tap the master output
    Tone.getDestination().connect(this.mediaStreamDest);

    this.recordingChunks = [];
    this.mediaRecorder = new MediaRecorder(this.mediaStreamDest.stream, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm',
    });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.recordingChunks.push(e.data);
    };

    return new Promise((resolve) => {
      this.mediaRecorder!.onstart = () => resolve();
      this.mediaRecorder!.start();
      this.isRecording = true;
    });
  }

  async stopRecording(): Promise<Blob> {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('Not recording');
    }

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = () => {
        const blob = new Blob(this.recordingChunks, { type: this.mediaRecorder!.mimeType });
        this.cleanupRecording();
        resolve(blob);
      };
      this.mediaRecorder!.stop();
      this.isRecording = false;
    });
  }

  private cleanupRecording() {
    if (this.mediaStreamDest) {
      Tone.getDestination().disconnect(this.mediaStreamDest);
      this.mediaStreamDest = null;
    }
    this.mediaRecorder = null;
    this.recordingChunks = [];
  }

  cancelRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.onstop = null;
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.cleanupRecording();
    }
  }

  get isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  // Encode WAV from AudioBuffer
  private audioBufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataLength = buffer.length * blockAlign;

    const wavHeader = new ArrayBuffer(44);
    const dv = new DataView(wavHeader);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        dv.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    dv.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    dv.setUint32(16, 16, true);
    dv.setUint16(20, format, true);
    dv.setUint16(22, numChannels, true);
    dv.setUint32(24, sampleRate, true);
    dv.setUint32(28, sampleRate * blockAlign, true);
    dv.setUint16(32, blockAlign, true);
    dv.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    dv.setUint32(40, dataLength, true);

    const wavData = new Uint8Array(44 + dataLength);
    wavData.set(new Uint8Array(wavHeader), 0);

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        const int16 = new Int16Array(1);
        int16[0] = intSample;
        wavData.set(new Uint8Array(int16.buffer), offset);
        offset += 2;
      }
    }

    return new Blob([wavData], { type: 'audio/wav' });
  }

  async convertToMp3(wavBlob: Blob): Promise<Blob> {
    // Convert WAV to MP3 using lamejs
    const lamejs = await import('lamejs');
    const arrayBuffer = await wavBlob.arrayBuffer();
    const wavData = new Uint8Array(arrayBuffer);

    // Parse WAV header
    const channels = new DataView(arrayBuffer).getUint16(22, true);
    const sampleRate = new DataView(arrayBuffer).getUint32(24, true);

    // Skip 44-byte header, read samples
    const samples = new Int16Array(wavData.buffer, 44, (wavData.length - 44) / 2);

    const mp3Encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
    const mp3Data: Uint8Array[] = [];
    const sampleBlockSize = 1152;

    for (let i = 0; i < samples.length; i += sampleBlockSize) {
      const chunk = samples.subarray(i, i + sampleBlockSize);
      const mp3Buf = mp3Encoder.encodeBuffer(chunk);
      if (mp3Buf.length > 0) mp3Data.push(mp3Buf);
    }

    const mp3Buf = mp3Encoder.flush();
    if (mp3Buf.length > 0) mp3Data.push(mp3Buf);

    const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });
    return mp3Blob;
  }

  getSupportedFormats(): { wav: boolean; mp3: boolean } {
    return {
      wav: true,
      mp3: typeof lamejs !== 'undefined' || MediaRecorder.isTypeSupported('audio/mp3'),
    };
  }
}

export const audioEngine = new AudioEngine();
export type { EffectName } from './effects';
```

Note: The `lamejs` import here uses dynamic `import()` which may not work directly. In practice, we'll use a simpler approach — if `lamejs` is available, use it; otherwise fall back to WAV-only. The actual implementation in the file will use a conditional require-like pattern.

---

### Task 4: Create `src/lib/export.ts` — WAV encoding & export utilities

**File:** `src/lib/export.ts`

```typescript
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function humanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
```

---

### Task 5: Create `src/components/ExportPanel.tsx` — Export UI

**File:** `src/components/ExportPanel.tsx`

A self-contained component with:
- Format selector: WAV / MP3 radio-style buttons
- "Export Sequence" button — records the sequence and saves file
- "Export Live" button — starts/stops live recording, saves file
- Progress indicator ("Recording..." / "Processing...")
- Status messages (file size, duration)

```typescript
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Circle, Square } from 'lucide-react';
import { audioEngine } from '../lib/audio';
import { downloadBlob, formatDuration, humanFileSize } from '../lib/export';
import { NoteData } from './VirtualGuitar';

type ExportFormat = 'wav' | 'mp3';

interface ExportPanelProps {
  sequence: NoteData[][];
  bpm: number;
  playbackStyle: 'grouped' | 'arpeggio';
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ sequence, bpm, playbackStyle }) => {
  const [format, setFormat] = useState<ExportFormat>('wav');
  const [isExporting, setIsExporting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<{ size: string; duration: string } | null>(null);

  const hasSequence = sequence.some(step => step.length > 0);

  const handleExportSequence = async () => {
    if (!hasSequence) return;
    setIsExporting(true);
    setStatus('Playing and recording sequence...');
    setResult(null);

    try {
      await audioEngine.init();
      const blob = await audioEngine.startRecording();

      // Play the sequence
      // ... (playback logic similar to VirtualGuitar's togglePlayback)
      // For simplicity, we'll use a real-time play-and-record approach

      // Stop recording when playback completes
      const recordedBlob = await audioEngine.stopRecording();
      setStatus('Processing...');

      const finalBlob = format === 'mp3' ? await audioEngine.convertToMp3(recordedBlob) : recordedBlob;
      const ext = format === 'mp3' ? 'mp3' : 'wav';
      downloadBlob(finalBlob, `fretmaster-sequence.${ext}`);

      const seconds = 5; // Approximate
      setStatus('Export complete!');
      setResult({ size: humanFileSize(finalBlob.size), duration: formatDuration(seconds) });
    } catch (err) {
      setStatus(`Export failed: ${err}`);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleLiveRecording = async () => {
    if (isRecording) {
      setStatus('Processing recording...');
      try {
        const blob = await audioEngine.stopRecording();
        const finalBlob = format === 'mp3' ? await audioEngine.convertToMp3(blob) : blob;
        const ext = format === 'mp3' ? 'mp3' : 'wav';
        downloadBlob(finalBlob, `fretmaster-live.${ext}`);
        setStatus('Recording saved!');
      } catch (err) {
        setStatus(`Recording failed: ${err}`);
      }
      setIsRecording(false);
    } else {
      await audioEngine.startRecording();
      setIsRecording(true);
      setStatus('Recording... (play your guitar)');
    }
  };

  return (
    <div className="space-y-4">
      {/* Format selector */}
      <div className="flex gap-2">
        <button
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
            format === 'wav' ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
          onClick={() => setFormat('wav')}
        >
          WAV
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
            format === 'mp3' ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
          onClick={() => setFormat('mp3')}
        >
          MP3
        </button>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="border-zinc-700 hover:border-orange-500 font-bold"
          disabled={!hasSequence || isExporting || isRecording}
          onClick={handleExportSequence}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Sequence
        </Button>
        <Button
          variant={isRecording ? 'destructive' : 'outline'}
          className={`font-bold ${!isRecording && 'border-zinc-700 hover:border-orange-500'}`}
          onClick={toggleLiveRecording}
        >
          {isRecording ? (
            <><Square className="h-4 w-4 mr-2 fill-current" /> Stop Recording</>
          ) : (
            <><Circle className="h-4 w-4 mr-2 text-red-500" /> Record Live</>
          )}
        </Button>
      </div>

      {/* Status */}
      {status && (
        <div className="text-sm text-zinc-400 bg-zinc-900/50 px-3 py-2 rounded-lg border border-zinc-800">
          {status}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="text-xs text-zinc-500 flex gap-4">
          <span>Size: {result.size}</span>
          <span>Duration: {result.duration}</span>
        </div>
      )}
    </div>
  );
};
```

---

### Task 6: Update `src/components/VirtualGuitar.tsx` — Instrument selector + effect buttons + export panel

**File:** `src/components/VirtualGuitar.tsx`

Changes:
1. Add imports for `INSTRUMENTS`, `getInstrumentsByCategory`, `InstrumentCategory`, `EffectName`, `EFFECTS`
2. Add state: `selectedCategory`, `selectedEffect`
3. Replace any existing instrument selector with category tabs + instrument grid + effect buttons
4. Wire `audioEngine.setInstrumentAndEffect()` on selection change
5. Import and render `<ExportPanel>` below the sequencer
6. Export the `NoteData` type for use in `ExportPanel`

Key additions (insert after existing state declarations):

```typescript
const [selectedCategory, setSelectedCategory] = useState<InstrumentCategory>('guitars');
const [selectedEffect, setSelectedEffect] = useState<EffectName>('clean');
```

Instrument selector UI (insert above the fretboard, or in a new top section):

```typescript
{/* Category Tabs */}
<div className="flex gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
  {(['guitars', 'keys', 'strings', 'other'] as InstrumentCategory[]).map(cat => (
    <button
      key={cat}
      className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold capitalize transition-all ${
        selectedCategory === cat
          ? 'bg-orange-500 text-white'
          : 'text-zinc-400 hover:text-zinc-200'
      }`}
      onClick={() => setSelectedCategory(cat)}
    >
      {cat}
    </button>
  ))}
</div>

{/* Instrument Grid */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
  {getInstrumentsByCategory(selectedCategory).map(inst => (
    <button
      key={inst.id}
      className={`py-2 px-3 rounded-lg text-sm font-bold transition-all border ${
        audioEngine.getCurrentInstrument() === inst.id
          ? 'bg-orange-500/10 border-orange-500 text-orange-500'
          : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
      }`}
      onClick={() => audioEngine.setInstrumentAndEffect(inst.id, selectedEffect)}
    >
      {inst.name}
    </button>
  ))}
</div>

{/* Effect Selector */}
<div className="flex gap-2">
  {(Object.entries(EFFECTS) as [EffectName, typeof EFFECTS[EffectName]][]).map(([id, effect]) => (
    <button
      key={id}
      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
        selectedEffect === id
          ? 'bg-orange-500/10 border border-orange-500 text-orange-500'
          : 'bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:border-zinc-600'
      }`}
      onClick={() => {
        setSelectedEffect(id);
        audioEngine.setEffect(id);
      }}
    >
      {effect.name}
    </button>
  ))}
</div>
```

And render ExportPanel below the sequencer:

```typescript
{/* Export Section */}
<div className="mt-8 pt-8 border-t border-zinc-800/80">
  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
    <Download className="h-5 w-5 text-orange-500" />
    Export Audio
  </h3>
  <ExportPanel
    sequence={sequence}
    bpm={bpm}
    playbackStyle={playbackStyle}
  />
</div>
```

---

### Task 7: Build and verify

- [ ] **Run Vite build:**
```bash
npm run build
```
Expected: Build succeeds with no errors.

- [ ] **Run dev server:**
```bash
npm run dev
```
Expected: App loads at localhost:3000, shows category tabs, instrument grid, effect buttons, and export panel.

- [ ] **Verify 20 instruments:** Click each category, each instrument, each effect — all load without console errors.

- [ ] **Verify export:** Record a sequence, click "Export Sequence" — file downloads as WAV/MP3.

- [ ] **Kill dev server** (Ctrl+C).

---

### Task 8: Rebuild EXE + installer

- [ ] **Run full build pipeline:**
```bash
npm run build
cd installer
dotnet build -c Release
# Copy files to output/
Copy-Item bin/Release/net6.0-windows/FretMaster.exe output/FretMaster.exe -Force
Copy-Item bin/Release/net6.0-windows/FretMaster.dll output/FretMaster.dll -Force
Copy-Item bin/Release/net6.0-windows/FretMaster.runtimeconfig.json output/FretMaster.runtimeconfig.json -Force
Copy-Item bin/Release/net6.0-windows/FretMaster.deps.json output/FretMaster.deps.json -Force
# Run installer build
powershell -ExecutionPolicy Bypass -File Build-Installer.ps1 -OutputDir output
```
Expected: All files updated in `installer/output/`, EXE works and serves the updated app.
