
import React from 'react';
import { cn } from '@/lib/utils';
import { audioEngine } from '../lib/audio';
import { STRINGS, NOTES } from '../constants/guitar';

interface ChordDiagramProps {
  chord: number[]; // [e, B, G, D, A, E]
  name: string;
  className?: string;
}

export const ChordDiagram: React.FC<ChordDiagramProps> = ({ chord, name, className }) => {
  const strings = [0, 1, 2, 3, 4, 5];
  
  const maxFretRaw = Math.max(...chord.filter(f => f > 0));
  const numFrets = Math.max(4, Math.max(1, maxFretRaw));
  const frets = Array.from({ length: numFrets + 1 }, (_, i) => i);

  const playChord = async () => {
    await audioEngine.init();
    
    const notesToPlay = chord.map((fret, stringIndex) => {
      if (fret === -1) return null;
      const baseNote = STRINGS[stringIndex];
      const baseNoteIndex = NOTES.indexOf(baseNote.note);
      const totalSemitones = baseNoteIndex + fret;
      const noteName = NOTES[totalSemitones % 12];
      const octave = baseNote.octave + Math.floor(totalSemitones / 12);
      return `${noteName}${octave}`;
    }).filter(Boolean) as string[];
    
    audioEngine.playChord(notesToPlay);
  };

  return (
    <div 
      className={cn("flex flex-col items-center p-4 bg-zinc-900 rounded-xl border border-zinc-800 cursor-pointer hover:border-orange-500 transition-colors", className)}
      onClick={playChord}
    >
      <h3 className="text-xl font-bold mb-4 text-white">{name}</h3>
      <div className="relative w-32" style={{ height: `${numFrets * 2.5}rem` }}>
        {/* Nut */}
        <div className="absolute top-[-2px] left-0 right-0 h-1.5 bg-zinc-400 rounded-t-sm z-10" />
        
        {/* Strings */}
        <div className="absolute inset-0 flex justify-between mx-2 pt-1">
          {strings.map((s) => (
            <div key={s} className="bg-zinc-600 rounded-full" style={{ width: `${1 + (5 - s) * 0.5}px`, height: '100%' }} />
          ))}
        </div>

        {/* Frets */}
        <div className="absolute inset-0 flex flex-col justify-between pt-1">
          {frets.map((f) => (
            <div key={f} className="w-full h-[2px] bg-zinc-500/50" />
          ))}
        </div>

        {/* Notes */}
        <div className="absolute inset-0 mx-2 pt-1">
          {chord.map((fret, stringIndex) => {
            if (fret === -1) {
              return (
                <div key={stringIndex} className="absolute -top-7 text-zinc-500 text-sm font-bold w-4 text-center" style={{ left: `calc(${(5 - stringIndex) * 20}% - 8px)` }}>
                  ×
                </div>
              );
            }
            if (fret === 0) {
              return (
                <div key={stringIndex} className="absolute -top-7 text-green-500 text-sm font-bold w-4 text-center" style={{ left: `calc(${(5 - stringIndex) * 20}% - 8px)` }}>
                  ○
                </div>
              );
            }
            return (
              <div
                key={stringIndex}
                className="absolute w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-sm z-20"
                style={{
                  left: `calc(${(5 - stringIndex) * 20}% - 8px)`,
                  top: `calc(${((fret - 0.5) / numFrets) * 100}% - 8px)`
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
