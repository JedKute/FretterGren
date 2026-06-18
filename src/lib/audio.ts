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

  private scriptNode: ScriptProcessorNode | null = null;
  private captureContext: AudioContext | null = null;
  private capturedBuffers: Float32Array[][] = [[], []];
  private capturing = false;

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
      try { nodes[i].dispose(); } catch { }
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
    if (this.capturing) return;
    const ctx = Tone.getContext().rawContext as AudioContext;
    this.captureContext = ctx;
    this.capturedBuffers = [[], []];
    this.capturing = true;

    Tone.getDestination().disconnect();

    const bufferSize = 4096;
    const node = ctx.createScriptProcessor(bufferSize, 2, 2);
    node.onaudioprocess = (event) => {
      if (!this.capturing) return;
      for (let ch = 0; ch < event.inputBuffer.numberOfChannels && ch < 2; ch++) {
        this.capturedBuffers[ch].push(new Float32Array(event.inputBuffer.getChannelData(ch)));
      }
      for (let ch = 0; ch < event.outputBuffer.numberOfChannels; ch++) {
        event.outputBuffer.getChannelData(ch).set(event.inputBuffer.getChannelData(ch));
      }
    };

    Tone.getDestination().connect(node);
    node.connect(ctx.destination);
    this.scriptNode = node;
  }

  async stopRecording(): Promise<Blob> {
    if (!this.capturing || !this.scriptNode || !this.captureContext) {
      throw new Error('Not recording');
    }

    this.capturing = false;

    return new Promise<Blob>((resolve, reject) => {
      setTimeout(() => {
        try {
          if (this.scriptNode) {
            this.scriptNode.disconnect();
            this.scriptNode.onaudioprocess = null;
            this.scriptNode = null;
          }

          Tone.getDestination().connect(this.captureContext!.destination);

          const sampleRate = this.captureContext!.sampleRate;
          this.captureContext = null;

          const wavBlob = this.capturedToWav(sampleRate);
          this.capturedBuffers = [[], []];
          resolve(wavBlob);
        } catch (e) {
          reject(e);
        }
      }, 50);
    });
  }

  cancelRecording() {
    this.capturing = false;
    if (this.scriptNode) {
      this.scriptNode.disconnect();
      this.scriptNode.onaudioprocess = null;
      this.scriptNode = null;
    }
    if (this.captureContext) {
      Tone.getDestination().connect(this.captureContext.destination);
      this.captureContext = null;
    }
    this.capturedBuffers = [[], []];
  }

  get isCurrentlyRecording(): boolean {
    return this.capturing;
  }

  private capturedToWav(sampleRate: number): Blob {
    const numChannels = 2;

    const channels: Float32Array[] = [];
    let totalSamples = 0;
    for (let ch = 0; ch < numChannels; ch++) {
      const totalLen = this.capturedBuffers[ch].reduce((sum, buf) => sum + buf.length, 0);
      const flat = new Float32Array(totalLen);
      let offset = 0;
      for (const buf of this.capturedBuffers[ch]) {
        flat.set(buf, offset);
        offset += buf.length;
      }
      channels.push(flat);
      if (ch === 0) totalSamples = totalLen;
    }

    if (totalSamples === 0) {
      return new Blob([], { type: 'audio/wav' });
    }

    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const dataLength = totalSamples * blockAlign;
    const headerLength = 44;
    const totalLength = headerLength + dataLength;

    const wavData = new ArrayBuffer(totalLength);
    const view = new DataView(wavData);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, totalLength - 8, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    let offset = 44;
    for (let i = 0; i < totalSamples; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
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
