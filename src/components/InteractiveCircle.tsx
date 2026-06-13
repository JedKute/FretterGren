import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { audioEngine } from "../lib/audio";

// Map notes correctly across scales for the piano
const getScaleNotesWithOctave = (notes: string[], startOctave = 4): string[] => {
  let currentOctave = startOctave;
  let previousNoteClassIndex = -1;

  const noteOrder = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };

  return notes.map((noteInfo) => {
    const cleanNote = noteInfo.split("/")[0].trim();
    const baseNote = cleanNote.replace(/b|#|x/g, "")[0];
    const order = noteOrder[baseNote as keyof typeof noteOrder];

    if (previousNoteClassIndex !== -1 && order < previousNoteClassIndex) {
      currentOctave++;
    }
    previousNoteClassIndex = order;

    return `${cleanNote}${currentOctave}`;
  });
};

const CIRCLE_DATA = [
  {
    major: "C",
    minor: "Am",
    notes: ["C", "D", "E", "F", "G", "A", "B"],
    chords: ["C Maj", "D min", "E min", "F Maj", "G Maj", "A min", "B dim"],
  },
  {
    major: "G",
    minor: "Em",
    notes: ["G", "A", "B", "C", "D", "E", "F#"],
    chords: ["G Maj", "A min", "B min", "C Maj", "D Maj", "E min", "F# dim"],
  },
  {
    major: "D",
    minor: "Bm",
    notes: ["D", "E", "F#", "G", "A", "B", "C#"],
    chords: ["D Maj", "E min", "F# min", "G Maj", "A Maj", "B min", "C# dim"],
  },
  {
    major: "A",
    minor: "F#m",
    notes: ["A", "B", "C#", "D", "E", "F#", "G#"],
    chords: ["A Maj", "B min", "C# min", "D Maj", "E Maj", "F# min", "G# dim"],
  },
  {
    major: "E",
    minor: "C#m",
    notes: ["E", "F#", "G#", "A", "B", "C#", "D#"],
    chords: ["E Maj", "F# min", "G# min", "A Maj", "B Maj", "C# min", "D# dim"],
  },
  {
    major: "B",
    minor: "G#m",
    notes: ["B", "C#", "D#", "E", "F#", "G#", "A#"],
    chords: [
      "B Maj",
      "C# min",
      "D# min",
      "E Maj",
      "F# Maj",
      "G# min",
      "A# dim",
    ],
  },
  {
    major: "F# / Gb",
    minor: "D#m / Ebm",
    notes: ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
    chords: [
      "F# Maj",
      "G# min",
      "A# min",
      "B Maj",
      "C# Maj",
      "D# min",
      "E# dim",
    ],
  },
  {
    major: "Db",
    minor: "Bbm",
    notes: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
    chords: [
      "Db Maj",
      "Eb min",
      "F min",
      "Gb Maj",
      "Ab Maj",
      "Bb min",
      "C dim",
    ],
  },
  {
    major: "Ab",
    minor: "Fm",
    notes: ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
    chords: ["Ab Maj", "Bb min", "C min", "Db Maj", "Eb Maj", "F min", "G dim"],
  },
  {
    major: "Eb",
    minor: "Cm",
    notes: ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
    chords: ["Eb Maj", "F min", "G min", "Ab Maj", "Bb Maj", "C min", "D dim"],
  },
  {
    major: "Bb",
    minor: "Gm",
    notes: ["Bb", "C", "D", "Eb", "F", "G", "A"],
    chords: ["Bb Maj", "C min", "D min", "Eb Maj", "F Maj", "G min", "A dim"],
  },
  {
    major: "F",
    minor: "Dm",
    notes: ["F", "G", "A", "Bb", "C", "D", "E"],
    chords: ["F Maj", "G min", "A min", "Bb Maj", "C Maj", "D min", "E dim"],
  },
];

export const InteractiveCircle = () => {
  const [selectedKey, setSelectedKey] = useState(CIRCLE_DATA[0]);

  const handleNoteClick = async (index: number) => {
    await audioEngine.init();
    // Assuming starting at octave 4
    const scale = getScaleNotesWithOctave(selectedKey.notes, 4);
    audioEngine.playNote(scale[index], "4n", "piano");
  };

  const handleChordClick = async (index: number) => {
    await audioEngine.init();
    // We need two octaves to easily build triads even when wrapping around the scale
    const twoOctaves = [...selectedKey.notes, ...selectedKey.notes];
    const scale = getScaleNotesWithOctave(twoOctaves, 4);
    
    const root = scale[index];
    const third = scale[index + 2];
    const fifth = scale[index + 4];
    
    audioEngine.playChord([root, third, fifth], "2n", "piano");
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 w-full">
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-80 md:h-80 w-full max-w-sm aspect-square flex items-center justify-center">
        {/* Center decoration */}
        <div className="absolute w-24 h-24 rounded-full border-4 border-zinc-800 flex items-center justify-center">
          <span className="text-zinc-600 font-bold text-xs uppercase tracking-widest text-center leading-tight">
            Circle of
            <br />
            Fifths
          </span>
        </div>

        {/* Outer circle for majors */}
        {CIRCLE_DATA.map((item, index) => {
          const angle = (index * 30 - 90) * (Math.PI / 180);
          const radius = 45; // percentage
          const x = 50 + radius * Math.cos(angle);
          const y = 50 + radius * Math.sin(angle);

          const isSelected = selectedKey.major === item.major;

          return (
            <button
              key={`maj-${index}`}
              onClick={() => setSelectedKey(item)}
              className={cn(
                "absolute w-12 h-12 sm:w-14 sm:h-14 -ml-6 -mt-6 sm:-ml-7 sm:-mt-7 rounded-full flex flex-col items-center justify-center transition-all shadow-lg",
                isSelected
                  ? "bg-orange-500 scale-110 z-10 text-white"
                  : "bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 text-zinc-300",
              )}
              style={{ left: `${x}%`, top: `${y}%` }}
              title={`${item.major} Major (Click to view info)`}
            >
              <span className="font-bold sm:text-base text-sm">
                {item.major}
              </span>
            </button>
          );
        })}

        {/* Inner circle for minors */}
        {CIRCLE_DATA.map((item, index) => {
          const angle = (index * 30 - 90) * (Math.PI / 180);
          const radius = 24; // percentage
          const x = 50 + radius * Math.cos(angle);
          const y = 50 + radius * Math.sin(angle);

          const isSelected = selectedKey.major === item.major;

          return (
            <button
              key={`min-${index}`}
              onClick={() => setSelectedKey(item)}
              className={cn(
                "absolute font-semibold transition-all -ml-4 -mt-4 sm:-ml-5 sm:-mt-5 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xs sm:text-sm",
                isSelected
                  ? "text-orange-400 scale-110"
                  : "text-zinc-500 hover:text-white",
              )}
              style={{ left: `${x}%`, top: `${y}%` }}
              title={`${item.minor} (Relative Minor to ${item.major})`}
            >
              {item.minor}
            </button>
          );
        })}
      </div>

      {/* Info panel */}
      <div className="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700 w-full text-left space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-zinc-700 pb-3 gap-2">
          <div>
            <h4 className="text-xl sm:text-2xl font-black text-white">
              {selectedKey.major} Major
            </h4>
            <p className="text-zinc-400 font-medium">
              Relative Minor:{" "}
              <span className="text-orange-400">{selectedKey.minor}</span>
            </p>
          </div>
        </div>

        <div>
          <h5 className="text-xs sm:text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wider">
            Notes in Scale
          </h5>
          <div className="flex flex-wrap gap-2">
            {selectedKey.notes.map((note, i) => (
              <button
                key={`${note}-${i}`}
                onClick={() => handleNoteClick(i)}
                title="Play note"
                className="bg-zinc-900 border border-zinc-700 px-3 py-1 rounded-lg text-white font-medium text-sm sm:text-base hover:bg-zinc-700 hover:border-zinc-500 transition-colors"
              >
                {note}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h5 className="text-xs sm:text-sm font-bold text-zinc-500 mb-2 uppercase tracking-wider">
            Chords in Key
          </h5>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {selectedKey.chords.map((chord, i) => {
              let degree = ["I", "ii", "iii", "IV", "V", "vi", "vii°"][i];
              return (
                <button
                  key={`${chord}-${i}`}
                  onClick={() => handleChordClick(i)}
                  title="Play chord"
                  className="bg-zinc-900 border border-zinc-700 px-2 py-2 rounded-lg flex flex-col justify-center items-center text-center hover:bg-zinc-700 hover:border-zinc-500 transition-colors"
                >
                  <span className="text-zinc-500 text-[10px] sm:text-xs font-bold mb-1">
                    {degree}
                  </span>
                  <span className="text-white font-medium text-xs sm:text-sm whitespace-nowrap">
                    {chord}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
