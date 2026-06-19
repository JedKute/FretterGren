
import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface FretboardProps {
  activeNotes?: { string: number; fret: number; label?: string }[];
  onNoteClick?: (string: number, fret: number) => void;
  className?: string;
  numFrets?: number;
}

const STRINGS = ['e', 'B', 'G', 'D', 'A', 'E'];

export const Fretboard: React.FC<FretboardProps> = ({
  activeNotes = [],
  onNoteClick,
  className,
  numFrets = 15,
}) => {
  const frets = Array.from({ length: numFrets + 1 }, (_, i) => i);

  return (
    <div className={cn("relative overflow-x-auto pb-4", className)}>
      <div className="min-w-[800px] h-64 md:h-72 lg:h-80 bg-[#2a1b0a] rounded-lg border-4 border-[#3d2b1f] relative shadow-2xl">
        {/* Strings */}
        <div className="absolute inset-0 flex flex-col justify-between py-4 px-0">
          {STRINGS.map((_, i) => (
            <div
              key={i}
              className="w-full bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400 shadow-[0_1px_2px_rgba(0,0,0,0.5)] rounded-full"
              style={{ height: `${1 + i * 0.5}px` }} // Thicker strings for lower notes (index 5 is low E)
            />
          ))}
        </div>

        {/* Frets */}
        <div className="absolute inset-0 flex">
          {frets.map((fret) => (
            <div
              key={fret}
              className="flex-1 border-r border-gray-400/50 relative"
              style={{ flexGrow: Math.pow(0.94, fret) }} // Realistic fret spacing
            >
              {/* Fret Markers */}
              {[3, 5, 7, 9, 12, 15, 17, 19, 21].includes(fret) && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                   {fret === 12 ? (
                     <div className="flex flex-col gap-8 md:gap-10">
                       <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-white/20 rounded-full" />
                       <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-white/20 rounded-full" />
                     </div>
                   ) : (
                     <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-white/20 rounded-full" />
                   )}
                </div>
              )}

              {/* Interaction Layer */}
              <div className="absolute inset-0 flex flex-col justify-between py-4">
                {STRINGS.map((_, stringIndex) => {
                  const activeNoteInfo = activeNotes.find(n => n.string === stringIndex && n.fret === fret);
                  const isActive = !!activeNoteInfo;
                  return (
                    <div
                      key={stringIndex}
                      className="relative w-full h-4 cursor-pointer group flex items-center justify-center"
                      onClick={() => onNoteClick?.(stringIndex, fret)}
                    >
                      <div className="absolute inset-0 group-hover:bg-white/5 transition-colors rounded" />
                      {isActive && (
                        <motion.div
                          layoutId={`note-${stringIndex}-${fret}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute w-5 h-5 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)] z-10 flex items-center justify-center border border-white"
                        >
                          {activeNoteInfo.label && (
                            <span className="text-[9px] font-bold text-white leading-none mt-px">
                              {activeNoteInfo.label}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Fret Numbers */}
      <div className="flex mt-2">
        {frets.map((fret) => (
          <div
            key={fret}
            className="text-[10px] md:text-xs text-gray-500 text-center"
            style={{ flex: `1 1 0%`, flexGrow: Math.pow(0.94, fret) }}
          >
            {fret}
          </div>
        ))}
      </div>
    </div>
  );
};
