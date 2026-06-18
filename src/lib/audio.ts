
import * as Tone from 'tone';
import { EFFECTS, EffectName, getInstrumentById } from './effects';

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

type SamplerEntry = {
  sampler: Tone.Sampler;
  currentEffect: EffectName;
  effectNodes: Tone.ToneAudioNode[];
};

class AudioEngine {
  private entries: Map<string, SamplerEntry> = new Map();
  private currentInstrumentId: string = 'acoustic';
  private currentEffectId: EffectName = 'clean';
  private initialized = false;
  private initPromise: Promise<void> | null = null;
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

  private disposeNodes(nodes: Tone.ToneAudioNode[]) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      try { nodes[i].dispose(); } catch { /* already disposed */ }
    }
  }

  async ensureInstrument(instrumentId: string): Promise<Tone.Sampler> {
    const existing = this.entries.get(instrumentId);
    if (existing) {
      if (existing.currentEffect !== this.currentEffectId) {
        existing.sampler.disconnect();
        this.disposeNodes(existing.effectNodes);
        const nodes = EFFECTS[this.currentEffectId].build(existing.sampler);
        existing.effectNodes = nodes;
        existing.currentEffect = this.currentEffectId;
      }
      return existing.sampler;
    }

    const profile = getInstrumentById(instrumentId);
    if (!profile) throw new Error(`Instrument not found: ${instrumentId}`);

    const sampler = new Tone.Sampler({
      urls: profile.notes,
      release: profile.release ?? 1,
      baseUrl: profile.baseUrl,
    });
    sampler.volume.value = 3;

    const effectNodes = EFFECTS[this.currentEffectId].build(sampler);

    this.entries.set(instrumentId, { sampler, currentEffect: this.currentEffectId, effectNodes });
    return sampler;
  }

  async setInstrument(instrumentId: string) {
    this.currentInstrumentId = instrumentId;
    const sampler = await this.ensureInstrument(instrumentId);
    return sampler;
  }

  setEffect(effectId: EffectName) {
    this.currentEffectId = effectId;
    const entry = this.entries.get(this.currentInstrumentId);
    if (entry) {
      entry.sampler.disconnect();
      this.disposeNodes(entry.effectNodes);
      entry.effectNodes = EFFECTS[effectId].build(entry.sampler);
      entry.currentEffect = effectId;
    }
  }

  async setInstrumentAndEffect(instrumentId: string, effectId: EffectName) {
    this.currentInstrumentId = instrumentId;
    this.currentEffectId = effectId;
    await this.ensureInstrument(instrumentId);
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
    if (Tone.getDestination().mute !== mute) {
      if (!mute) {
        Tone.getDestination().volume.value = Tone.getDestination().volume.value;
      }
      Tone.getDestination().mute = !!mute;
    }
  }

  getCurrentInstrument(): string {
    return this.currentInstrumentId;
  }

  getCurrentEffect(): EffectName {
    return this.currentEffectId;
  }

  async startRecording(): Promise<void> {
    if (this.isRecording) return;
    const ctx = Tone.getContext().rawContext as AudioContext;
    this.mediaStreamDest = ctx.createMediaStreamDestination();
    Tone.getDestination().connect(this.mediaStreamDest);
    this.recordingChunks = [];

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    return new Promise<void>((resolve) => {
      const recorder = new MediaRecorder(this.mediaStreamDest!.stream, { mimeType });
      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) this.recordingChunks.push(e.data);
      };
      recorder.onstart = () => {
        this.isRecording = true;
        resolve();
      };
      recorder.start();
      this.mediaRecorder = recorder;
    });
  }

  async stopRecording(): Promise<Blob> {
    if (!this.isRecording || !this.mediaRecorder) throw new Error('Not recording');

    return new Promise<Blob>((resolve, reject) => {
      this.mediaRecorder!.onstop = async () => {
        const rawBlob = new Blob(this.recordingChunks, { type: this.mediaRecorder!.mimeType });
        if (this.mediaStreamDest) {
          Tone.getDestination().disconnect(this.mediaStreamDest);
        }
        this.mediaRecorder = null;
        this.mediaStreamDest = null;
        this.recordingChunks = [];
        this.isRecording = false;

        try {
          const wavBlob = await this.decodeToWav(rawBlob);
          resolve(wavBlob);
        } catch (e) {
          reject(e);
        }
      };
      this.mediaRecorder!.stop();
    });
  }

  private async decodeToWav(blob: Blob): Promise<Blob> {
    const ctx = Tone.getContext().rawContext as AudioContext;
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    return this.audioBufferToWav(audioBuffer);
  }

  cancelRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.ondataavailable = null;
      this.mediaRecorder.onstop = null;
      this.mediaRecorder.stop();
    }
    if (this.mediaStreamDest) {
      Tone.getDestination().disconnect(this.mediaStreamDest);
    }
    this.mediaRecorder = null;
    this.mediaStreamDest = null;
    this.recordingChunks = [];
    this.isRecording = false;
  }

  get isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  audioBufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataLength = buffer.length * blockAlign;
    const headerLength = 44;
    const totalLength = headerLength + dataLength;

    const wavData = new ArrayBuffer(totalLength);
    const view = new DataView(wavData);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, totalLength - 8, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = buffer.getChannelData(ch)[i];
        const clamped = Math.max(-1, Math.min(1, sample));
        view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([wavData], { type: 'audio/wav' });
  }

  async convertToMp3(wavBlob: Blob): Promise<Blob> {
    const lamejs: any = await import('lamejs');
    const arrayBuffer = await wavBlob.arrayBuffer();
    const headerView = new DataView(arrayBuffer);

    const numChannels = headerView.getUint16(22, true);
    const sampleRate = headerView.getUint32(24, true);

    const samples = new Uint8Array(arrayBuffer, 44);
    const sampleCount = samples.byteLength / 2;
    const int16Samples = new Int16Array(sampleCount);
    for (let i = 0; i < sampleCount; i++) {
      int16Samples[i] = (samples[i * 2] | (samples[i * 2 + 1] << 8));
    }

    let encoder: any;
    let mp3Data: Int32Array;

    if (numChannels === 1) {
      encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);
      mp3Data = encoder.encodeBuffer(int16Samples);
    } else {
      encoder = new lamejs.Mp3Encoder(2, sampleRate, 128);
      const left = new Int16Array(sampleCount / 2);
      const right = new Int16Array(sampleCount / 2);
      for (let i = 0; i < sampleCount / 2; i++) {
        left[i] = int16Samples[i * 2];
        right[i] = int16Samples[i * 2 + 1];
      }
      mp3Data = encoder.encodeBuffer(left, right);
    }

    const mp3End = encoder.flush();

    const totalLength = mp3Data.length + mp3End.length;
    const combined = new Int32Array(totalLength);
    combined.set(mp3Data, 0);
    combined.set(mp3End, mp3Data.length);

    return new Blob([combined], { type: 'audio/mp3' });
  }

  async getSupportedFormats(): Promise<{ wav: boolean; mp3: boolean }> {
    try {
      await import('lamejs');
      return { wav: true, mp3: true };
    } catch {
      return { wav: true, mp3: false };
    }
  }
}

export const audioEngine = new AudioEngine();
