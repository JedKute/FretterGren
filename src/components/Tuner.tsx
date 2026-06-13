
import React, { useState, useEffect, useRef } from 'react';
import { Tuner as TunerLogic } from '../lib/tuner';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Tuner: React.FC = () => {
  const [pitch, setPitch] = useState<number | null>(null);
  const [note, setNote] = useState<string>('');
  const [cents, setCents] = useState<number>(0);
  const [isListening, setIsListening] = useState(false);
  const tunerRef = useRef<TunerLogic | null>(null);

  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  useEffect(() => {
    tunerRef.current = new TunerLogic();
    return () => tunerRef.current?.stop();
  }, []);

  const toggleListening = () => {
    if (isListening) {
      tunerRef.current?.stop();
      setIsListening(false);
      setPitch(null);
    } else {
      tunerRef.current?.start((p) => {
        setPitch(p);
        const noteNum = tunerRef.current!.getNoteFromPitch(p);
        const noteName = NOTES[noteNum % 12];
        const octave = Math.floor(noteNum / 12) - 1;
        setNote(`${noteName}${octave}`);
        
        const standardPitch = tunerRef.current!.getStandardPitch(noteNum);
        const diff = 1200 * Math.log2(p / standardPitch);
        setCents(diff);
      });
      setIsListening(true);
    }
  };

  const isTuned = Math.abs(cents) < 5;

  return (
    <div className="flex flex-col items-center p-8 bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl w-full max-w-md overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />
      
      <div className="mb-8 text-center">
        <h2 className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-2">Guitar Tuner</h2>
        <div className="h-24 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {pitch ? (
              <motion.div
                key="note"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="flex flex-col items-center"
              >
                <span className={cn(
                  "text-7xl font-black transition-colors duration-300",
                  isTuned ? "text-green-500" : "text-white"
                )}>
                  {note}
                </span>
                <span className="text-zinc-500 font-mono mt-2">{pitch.toFixed(1)} Hz</span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-zinc-700 text-lg font-medium italic"
              >
                {isListening ? "Waiting for sound..." : "Tap to start tuning"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tuning Gauge */}
      <div className="w-full h-32 relative flex items-center justify-center mb-8">
        <div className="absolute w-full h-[2px] bg-zinc-800" />
        <div className="absolute left-1/2 -translate-x-1/2 w-[2px] h-8 bg-zinc-600" />
        
        {/* Center Zone */}
        <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 border-2 border-zinc-800 rounded-full" />
        
        {/* Needle */}
        {pitch && (
          <motion.div
            animate={{ x: `${cents * 1.5}px` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute flex flex-col items-center"
          >
            <div className={cn(
              "w-1 h-16 rounded-full shadow-lg",
              isTuned ? "bg-green-500 shadow-green-500/50" : "bg-orange-500 shadow-orange-500/50"
            )} />
            <div className={cn(
              "w-3 h-3 rounded-full mt-[-6px]",
              isTuned ? "bg-green-500" : "bg-orange-500"
            )} />
          </motion.div>
        )}

        {/* Cents Labels */}
        <div className="absolute bottom-0 w-full flex justify-between px-4 text-[10px] font-mono text-zinc-600">
          <span>-50</span>
          <span>0</span>
          <span>+50</span>
        </div>
      </div>

      <Button
        size="lg"
        variant={isListening ? "destructive" : "default"}
        className={cn(
          "w-full h-14 rounded-xl font-bold text-lg transition-all",
          !isListening && "bg-orange-500 hover:bg-orange-600"
        )}
        onClick={toggleListening}
      >
        {isListening ? <MicOff className="mr-2 h-5 w-5" /> : <Mic className="mr-2 h-5 w-5" />}
        {isListening ? "STOP TUNER" : "START TUNER"}
      </Button>
    </div>
  );
};

import { cn } from '@/lib/utils';
