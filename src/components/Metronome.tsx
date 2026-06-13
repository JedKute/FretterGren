
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import * as Tone from 'tone';
import { cn } from '@/lib/utils';

interface MetronomeProps {
  soundType?: 'Woodblock' | 'Digital Beep' | 'Drum Stick';
}

export const Metronome: React.FC<MetronomeProps> = ({ soundType = 'Woodblock' }) => {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const loopRef = useRef<Tone.Loop | null>(null);
  
  const woodblockRef = useRef<Tone.MembraneSynth | null>(null);
  const beepRef = useRef<Tone.Synth | null>(null);
  const clickRef = useRef<Tone.NoiseSynth | null>(null);
  
  const beatCountRef = useRef(0);

  useEffect(() => {
    woodblockRef.current = new Tone.MembraneSynth().toDestination();
    beepRef.current = new Tone.Synth({ oscillator: { type: "square" }, envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 } }).toDestination();
    clickRef.current = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.05, sustain: 0 } }).toDestination();
    
    loopRef.current = new Tone.Loop((time) => {
      const currentBeat = beatCountRef.current % 4;
      
      const timeUntilPlay = Math.max(0, (time - Tone.now()) * 1000);
      setTimeout(() => {
        setBeat(currentBeat);
      }, timeUntilPlay);

      if (soundType === 'Digital Beep') {
        beepRef.current?.triggerAttackRelease(currentBeat === 0 ? "C6" : "C5", "32n", time, currentBeat === 0 ? 1 : 0.5);
      } else if (soundType === 'Drum Stick') {
        clickRef.current?.triggerAttackRelease("32n", time, currentBeat === 0 ? 1 : 0.5);
      } else {
        woodblockRef.current?.triggerAttackRelease(currentBeat === 0 ? "C5" : "G4", "32n", time, currentBeat === 0 ? 1 : 0.5);
      }
      
      beatCountRef.current += 1;
    }, "4n");

    return () => {
      loopRef.current?.dispose();
      woodblockRef.current?.dispose();
      beepRef.current?.dispose();
      clickRef.current?.dispose();
    };
  }, [soundType]);

  const toggleMetronome = async () => {
    if (isPlaying) {
      Tone.Transport.stop();
      loopRef.current?.stop();
      setIsPlaying(false);
      setBeat(0);
      beatCountRef.current = 0;
    } else {
      await Tone.start();
      Tone.Transport.bpm.value = bpm;
      beatCountRef.current = 0;
      loopRef.current?.start(0);
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  const handleBpmChange = (newBpm: number | number[]) => {
    const val = Array.isArray(newBpm) ? newBpm[0] : newBpm;
    if (typeof val !== 'number' || isNaN(val)) return;
    const clamped = Math.min(240, Math.max(40, val));
    setBpm(clamped);
  };

  const handleBpmCommit = (newBpm: number | number[]) => {
    const val = Array.isArray(newBpm) ? newBpm[0] : newBpm;
    if (typeof val !== 'number' || isNaN(val)) return;
    const clamped = Math.min(240, Math.max(40, val));
    if (Tone.Transport) {
      Tone.Transport.bpm.value = clamped;
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl w-full max-w-md">
      <div className="flex items-center justify-center gap-4 mb-8">
        {[0, 1, 2, 3].map((b) => (
          <div
            key={b}
            className={cn(
              "w-4 h-4 rounded-full transition-all duration-100",
              beat === b && isPlaying ? "bg-orange-500 scale-125 shadow-[0_0_10px_rgba(249,115,22,0.8)]" : "bg-zinc-700"
            )}
          />
        ))}
      </div>

      <div className="text-6xl font-black text-white mb-8 font-mono tracking-tighter">
        {bpm}<span className="text-xl text-zinc-500 ml-2">BPM</span>
      </div>

      <div className="flex items-center gap-4 w-full mb-8">
        <Button variant="outline" size="icon" onClick={() => { handleBpmChange(bpm - 1); handleBpmCommit(bpm - 1); }}>
          <Minus className="h-4 w-4" />
        </Button>
        <Slider
          value={bpm}
          onValueChange={handleBpmChange}
          onValueCommitted={handleBpmCommit}
          min={40}
          max={240}
          step={1}
          className="flex-1"
        />
        <Button variant="outline" size="icon" onClick={() => { handleBpmChange(bpm + 1); handleBpmCommit(bpm + 1); }}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Button
        size="lg"
        className={cn(
          "w-full h-16 text-xl font-bold rounded-xl transition-all",
          isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"
        )}
        onClick={toggleMetronome}
      >
        {isPlaying ? <Pause className="mr-2 h-6 w-6" /> : <Play className="mr-2 h-6 w-6" />}
        {isPlaying ? 'STOP' : 'START'}
      </Button>
    </div>
  );
};
