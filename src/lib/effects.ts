import * as Tone from 'tone';

export type EffectName = 'clean' | 'ambient' | 'overdrive' | 'heavy';
export type InstrumentCategory = 'guitars' | 'keys' | 'strings';
export type NoteMap = { [noteName: string]: string };

export interface InstrumentProfile {
  id: string;
  name: string;
  category: InstrumentCategory;
  baseUrl: string;
  notes: NoteMap;
  release?: number;
  isSalamander?: boolean;
}

export interface EffectChain {
  name: string;
  id: EffectName;
  build: (sampler: Tone.Sampler) => Tone.ToneAudioNode[];
}

const FLUID = '/samples/FluidR3_GM/';

function buildClean(sampler: Tone.Sampler): Tone.ToneAudioNode[] {
  sampler.connect(Tone.Destination);
  return [];
}

function buildAmbient(sampler: Tone.Sampler): Tone.ToneAudioNode[] {
  const chorus = new Tone.Chorus(4, 2.5, 0.5).start();
  const reverb = new Tone.Freeverb(0.6, 3000);
  sampler.chain(chorus, reverb, Tone.Destination);
  return [chorus, reverb];
}

function buildOverdrive(sampler: Tone.Sampler): Tone.ToneAudioNode[] {
  const distortion = new Tone.Distortion(0.4);
  const eq = new Tone.EQ3(3, 0, 4);
  sampler.chain(distortion, eq, Tone.Destination);
  return [distortion, eq];
}

function buildHeavy(sampler: Tone.Sampler): Tone.ToneAudioNode[] {
  const distortion = new Tone.Distortion(0.7);
  const delay = new Tone.FeedbackDelay('8n', 0.3);
  const reverb = new Tone.Freeverb(0.5, 5000);
  sampler.chain(distortion, delay, reverb, Tone.Destination);
  return [distortion, delay, reverb];
}

export const EFFECTS: Record<EffectName, EffectChain> = {
  clean: { name: 'Clean', id: 'clean', build: buildClean },
  ambient: { name: 'Ambient', id: 'ambient', build: buildAmbient },
  overdrive: { name: 'Overdrive', id: 'overdrive', build: buildOverdrive },
  heavy: { name: 'Heavy', id: 'heavy', build: buildHeavy },
};

const GUITAR_NOTES: NoteMap = { "E2": "E2.mp3", "A2": "A2.mp3", "D3": "D3.mp3", "G3": "G3.mp3", "B3": "B3.mp3", "E4": "E4.mp3" };
const BASS_NOTES: NoteMap = { "E1": "E1.mp3", "A1": "A1.mp3", "D2": "D2.mp3", "G2": "G2.mp3" };
const KEYS_NOTES: NoteMap = { "C3": "C3.mp3", "E3": "E3.mp3", "G3": "G3.mp3", "C4": "C4.mp3", "E4": "E4.mp3", "G4": "G4.mp3", "C5": "C5.mp3", "E5": "E5.mp3", "G5": "G5.mp3" };
const SYNTH_NOTES: NoteMap = { "C3": "C3.mp3", "G3": "G3.mp3", "C4": "C4.mp3", "G4": "G4.mp3", "C5": "C5.mp3", "G5": "G5.mp3" };
const VIOLIN_NOTES: NoteMap = { "G3": "G3.mp3", "D4": "D4.mp3", "A4": "A4.mp3", "E5": "E5.mp3" };
const CELLO_NOTES: NoteMap = { "C2": "C2.mp3", "G2": "G2.mp3", "D3": "D3.mp3", "A3": "A3.mp3" };
const VIOLA_NOTES: NoteMap = { "C3": "C3.mp3", "G3": "G3.mp3", "D4": "D4.mp3", "A4": "A4.mp3" };
const DBASS_NOTES: NoteMap = { "E1": "E1.mp3", "A1": "A1.mp3", "D2": "D2.mp3", "G2": "G2.mp3" };
const PIANO_NOTES: NoteMap = {
  "A0": "A0.mp3", "C1": "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
  "A1": "A1.mp3", "C2": "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
  "A2": "A2.mp3", "C3": "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
  "A3": "A3.mp3", "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
  "A4": "A4.mp3", "C5": "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
  "A5": "A5.mp3", "C6": "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
  "A6": "A6.mp3", "C7": "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
  "A7": "A7.mp3", "C8": "C8.mp3",
};

const INSTRUMENTS: InstrumentProfile[] = [
  { id: 'acoustic', name: 'Acoustic Guitar', category: 'guitars', baseUrl: `${FLUID}acoustic_guitar_steel-mp3/`, notes: GUITAR_NOTES, release: 1 },
  { id: 'electric', name: 'Electric Guitar', category: 'guitars', baseUrl: `${FLUID}electric_guitar_clean-mp3/`, notes: GUITAR_NOTES, release: 1 },
  { id: 'nylon', name: 'Nylon Guitar', category: 'guitars', baseUrl: `${FLUID}acoustic_guitar_nylon-mp3/`, notes: GUITAR_NOTES, release: 1 },
  { id: 'twelve_string', name: '12-String Guitar', category: 'guitars', baseUrl: `${FLUID}acoustic_guitar_steel-mp3/`, notes: GUITAR_NOTES, release: 1 },
  { id: 'resonator', name: 'Resonator Guitar', category: 'guitars', baseUrl: `${FLUID}acoustic_guitar_steel-mp3/`, notes: GUITAR_NOTES, release: 1 },
  { id: 'bass', name: 'Acoustic Bass', category: 'guitars', baseUrl: `${FLUID}acoustic_bass-mp3/`, notes: BASS_NOTES, release: 1 },
  { id: 'electric_bass', name: 'Electric Bass', category: 'guitars', baseUrl: `${FLUID}electric_bass_finger-mp3/`, notes: BASS_NOTES, release: 1 },
  { id: 'baritone', name: 'Baritone Guitar', category: 'guitars', baseUrl: `${FLUID}acoustic_guitar_steel-mp3/`, notes: GUITAR_NOTES, release: 1 },
  { id: 'piano', name: 'Piano', category: 'keys', baseUrl: '/samples/salamander/', notes: PIANO_NOTES, release: 1, isSalamander: true },
  { id: 'electric_piano', name: 'Electric Piano', category: 'keys', baseUrl: `${FLUID}electric_piano_1-mp3/`, notes: KEYS_NOTES, release: 1 },
  { id: 'synth_pad', name: 'Synth Pad', category: 'keys', baseUrl: `${FLUID}pad_2_warm-mp3/`, notes: SYNTH_NOTES, release: 1 },
  { id: 'organ', name: 'Organ', category: 'keys', baseUrl: `${FLUID}church_organ-mp3/`, notes: KEYS_NOTES, release: 1 },
  { id: 'harpsichord', name: 'Harpsichord', category: 'keys', baseUrl: `${FLUID}harpsichord-mp3/`, notes: KEYS_NOTES, release: 1 },
  { id: 'clavinet', name: 'Clavinet', category: 'keys', baseUrl: `${FLUID}clavinet-mp3/`, notes: KEYS_NOTES, release: 1 },
  { id: 'violin', name: 'Violin', category: 'strings', baseUrl: `${FLUID}violin-mp3/`, notes: VIOLIN_NOTES, release: 1 },
  { id: 'cello', name: 'Cello', category: 'strings', baseUrl: `${FLUID}cello-mp3/`, notes: CELLO_NOTES, release: 1 },
  { id: 'viola', name: 'Viola', category: 'strings', baseUrl: `${FLUID}viola-mp3/`, notes: VIOLA_NOTES, release: 1 },
  { id: 'double_bass', name: 'Double Bass', category: 'strings', baseUrl: `${FLUID}contrabass-mp3/`, notes: DBASS_NOTES, release: 1 },
];

export function getInstrumentById(id: string): InstrumentProfile | undefined {
  return INSTRUMENTS.find(inst => inst.id === id);
}

export function getInstrumentsByCategory(cat: InstrumentCategory): InstrumentProfile[] {
  return INSTRUMENTS.filter(inst => inst.category === cat);
}
