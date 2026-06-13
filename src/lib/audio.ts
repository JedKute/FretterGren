
import * as Tone from 'tone';

export type InstrumentType = 'acoustic' | 'electric' | 'piano' | 'violin';

class AudioEngine {
  private synths: Record<string, any> = {};
  private currentInstrument: InstrumentType = 'acoustic';
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  async init() {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      await Tone.start();

      // Acoustic Guitar: Real audio samples for realistic sound
      this.synths.acoustic = new Tone.Sampler({
        urls: {
          "E2": "E2.mp3",
          "A2": "A2.mp3",
          "D3": "D3.mp3",
          "G3": "G3.mp3",
          "B3": "B3.mp3",
          "E4": "E4.mp3",
        },
        release: 1,
        baseUrl: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_steel-mp3/"
      }).toDestination();

      // Electric Guitar: Real audio samples processed with amp-like effects
      const eDist = new Tone.Distortion(0.5);
      const eChorus = new Tone.Chorus(4, 2.5, 0.5).start();
      const eReverb = new Tone.Freeverb(0.4, 2000);
      const eEq = new Tone.EQ3(5, -2, 5); // Boost lows and highs
      this.synths.electric = new Tone.Sampler({
        urls: {
          "E2": "E2.mp3",
          "A2": "A2.mp3",
          "D3": "D3.mp3",
          "G3": "G3.mp3",
          "B3": "B3.mp3",
          "E4": "E4.mp3",
        },
        release: 1,
        baseUrl: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/electric_guitar_clean-mp3/"
      }).chain(eChorus, eDist, eEq, eReverb, Tone.Destination);

      // Violin: Real audio samples
      const vVibrato = new Tone.Vibrato(4, 0.1);
      const vReverb = new Tone.Freeverb(0.8, 4000);
      this.synths.violin = new Tone.Sampler({
        urls: {
          "G3": "G3.mp3",
          "D4": "D4.mp3",
          "A4": "A4.mp3",
          "E5": "E5.mp3",
        },
        release: 1,
        baseUrl: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/violin-mp3/"
      }).chain(vVibrato, vReverb, Tone.Destination);

      // Piano: Real audio samples for the best piano sound
      this.synths.piano = new Tone.Sampler({
        urls: {
          A0: "A0.mp3",
          C1: "C1.mp3",
          "D#1": "Ds1.mp3",
          "F#1": "Fs1.mp3",
          A1: "A1.mp3",
          C2: "C2.mp3",
          "D#2": "Ds2.mp3",
          "F#2": "Fs2.mp3",
          A2: "A2.mp3",
          C3: "C3.mp3",
          "D#3": "Ds3.mp3",
          "F#3": "Fs3.mp3",
          A3: "A3.mp3",
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
          C5: "C5.mp3",
          "D#5": "Ds5.mp3",
          "F#5": "Fs5.mp3",
          A5: "A5.mp3",
          C6: "C6.mp3",
          "D#6": "Ds6.mp3",
          "F#6": "Fs6.mp3",
          A6: "A6.mp3",
          C7: "C7.mp3",
          "D#7": "Ds7.mp3",
          "F#7": "Fs7.mp3",
          A7: "A7.mp3",
          C8: "C8.mp3"
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/"
      }).toDestination();

      await Tone.loaded();
      this.initialized = true;
    })();

    return this.initPromise;
  }

  setVolume(volumeDb: number) {
    if (typeof volumeDb === 'number' && !isNaN(volumeDb) && isFinite(volumeDb)) {
      Tone.getDestination().volume.value = volumeDb;
    }
  }

  setMute(mute: boolean) {
    if (Tone.getDestination().mute !== mute) {
      if (!mute) {
        // Ensure volume doesn't ramp to undefined by setting it briefly first
        Tone.getDestination().volume.value = Tone.getDestination().volume.value;
      }
      Tone.getDestination().mute = !!mute;
    }
  }

  setInstrument(inst: InstrumentType) {
    this.currentInstrument = inst;
  }

  playNote(note: string, duration = "4n", instrument?: InstrumentType) {
    if (!this.initialized) return;
    const synth = this.synths[instrument || this.currentInstrument];
    if (synth) {
      synth.triggerAttackRelease(note, duration);
    }
  }

  playChord(notes: string[], duration = "2n", instrument?: InstrumentType) {
    if (!this.initialized) return;
    const synth = this.synths[instrument || this.currentInstrument];
    if (synth) {
      synth.triggerAttackRelease(notes, duration);
    }
  }
}

export const audioEngine = new AudioEngine();
