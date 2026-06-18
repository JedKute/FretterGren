
export const NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export const STRINGS = [
  { note: 'E', octave: 4 }, // High E
  { note: 'B', octave: 3 },
  { note: 'G', octave: 3 },
  { note: 'D', octave: 3 },
  { note: 'A', octave: 2 },
  { note: 'E', octave: 2 }, // Low E
];

export const CHORDS = {
  major: {
    'C': [0, 1, 0, 2, 3, -1],
    'C#': [4, 6, 6, 6, 4, -1],
    'D': [2, 3, 2, 0, -1, -1],
    'Eb': [6, 8, 8, 8, 6, -1],
    'E': [0, 0, 1, 2, 2, 0],
    'F': [1, 1, 2, 3, 3, 1],
    'F#': [2, 2, 3, 4, 4, 2],
    'G': [3, 0, 0, 0, 2, 3],
    'Ab': [4, 4, 5, 6, 6, 4],
    'A': [0, 2, 2, 2, 0, -1],
    'Bb': [1, 3, 3, 3, 1, -1],
    'B': [2, 4, 4, 4, 2, -1],
    'G_barre': [3, 3, 4, 5, 5, 3],
    'A_barre': [5, 5, 6, 7, 7, 5],
    'C_barre': [3, 5, 5, 5, 3, -1],
    'D_barre': [5, 7, 7, 7, 5, -1],
  },
  minor: {
    'Cm': [3, 4, 5, 5, 3, -1],
    'C#m': [4, 5, 6, 6, 4, -1],
    'Dm': [1, 3, 2, 0, -1, -1],
    'Ebm': [6, 7, 8, 8, 6, -1],
    'Em': [0, 0, 0, 2, 2, 0],
    'Fm': [1, 1, 1, 3, 3, 1],
    'F#m': [2, 2, 2, 4, 4, 2],
    'Gm': [3, 3, 3, 5, 5, 3],
    'G#m': [4, 4, 4, 6, 6, 4],
    'Abm': [4, 4, 4, 6, 6, 4],
    'Am': [0, 1, 2, 2, 0, -1],
    'Bbm': [1, 2, 3, 3, 1, -1],
    'Bm': [2, 3, 4, 4, 2, -1],
  },
  dom7: {
    'C7': [0, 1, 3, 2, 3, -1],
    'C#7': [4, 6, 4, 6, 4, -1],
    'D7': [2, 1, 2, 0, -1, -1],
    'Eb7': [6, 8, 6, 8, 6, -1],
    'E7': [0, 0, 1, 0, 2, 0],
    'F7': [1, 1, 2, 1, 3, 1],
    'F#7': [2, 2, 3, 2, 4, 2],
    'G7': [1, 0, 0, 0, 2, 3],
    'Ab7': [4, 4, 5, 4, 6, 4],
    'A7': [0, 2, 0, 2, 0, -1],
    'Bb7': [1, 3, 1, 3, 1, -1],
    'B7': [2, 0, 2, 1, 2, -1],
  },
  maj7: {
    'Cmaj7': [0, 0, 0, 2, 3, -1],
    'C#maj7': [4, 6, 5, 6, 4, -1],
    'Dmaj7': [2, 2, 2, 0, -1, -1],
    'Ebmaj7': [6, 8, 7, 8, 6, -1],
    'Emaj7': [0, 0, 1, 1, 2, 0],
    'Fmaj7': [0, 1, 2, 3, -1, -1],
    'F#maj7': [1, 2, 3, 4, -1, -1], // Simplified
    'Gmaj7': [2, 0, 0, 0, 2, 3],
    'Abmaj7': [3, 4, 5, 6, -1, -1], // Simplified
    'Amaj7': [0, 2, 1, 2, 0, -1],
    'Bbmaj7': [1, 3, 2, 3, 1, -1],
    'Bmaj7': [2, 4, 3, 4, 2, -1],
  }
};

export const SCALES = {
  pentatonic_minor: {
    name: 'Pentatonic Minor',
    intervals: [0, 3, 5, 7, 10],
  },
  pentatonic_major: {
    name: 'Pentatonic Major',
    intervals: [0, 2, 4, 7, 9],
  },
  major: {
    name: 'Major (Ionian)',
    intervals: [0, 2, 4, 5, 7, 9, 11],
  },
  minor: {
    name: 'Natural Minor (Aeolian)',
    intervals: [0, 2, 3, 5, 7, 8, 10],
  },
  harmonic_minor: {
    name: 'Harmonic Minor',
    intervals: [0, 2, 3, 5, 7, 8, 11],
  },
  dorian: {
    name: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
  },
  phrygian: {
    name: 'Phrygian',
    intervals: [0, 1, 3, 5, 7, 8, 10],
  },
  lydian: {
    name: 'Lydian',
    intervals: [0, 2, 4, 6, 7, 9, 11],
  },
  mixolydian: {
    name: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
  },
  locrian: {
    name: 'Locrian',
    intervals: [0, 1, 3, 5, 6, 8, 10],
  }
};

export const ARPEGGIOS = {
  major: {
    name: 'Major',
    intervals: [0, 4, 7],
  },
  minor: {
    name: 'Minor',
    intervals: [0, 3, 7],
  },
  maj7: {
    name: 'Major 7',
    intervals: [0, 4, 7, 11],
  },
  min7: {
    name: 'Minor 7',
    intervals: [0, 3, 7, 10],
  },
  dom7: {
    name: 'Dominant 7',
    intervals: [0, 4, 7, 10],
  },
  dim: {
    name: 'Diminished',
    intervals: [0, 3, 6],
  },
  aug: {
    name: 'Augmented',
    intervals: [0, 4, 8],
  }
};

export const LESSONS = [
  {
    id: 'beg-1',
    title: 'Your First Chords',
    difficulty: 'Beginner',
    description: 'Learn the fundamental open chords: G, C, and D.',
    content: 'The G, C, and D chords are the building blocks of thousands of songs...',
  },
  {
    id: 'int-1',
    title: 'Barre Chords',
    difficulty: 'Intermediate',
    description: 'Unlock the entire fretboard with movable shapes.',
    content: 'Barre chords use your index finger as a nut...',
  }
];
