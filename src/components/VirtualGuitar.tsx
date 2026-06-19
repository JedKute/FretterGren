
import React, { useState, useEffect, useRef } from 'react';
import { Fretboard } from './Fretboard';
import { audioEngine } from '../lib/audio';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { NOTES, STRINGS } from '../constants/guitar';
import { Volume2, Music, ListMusic, Play, Square, Circle, Plus, Minus, Grid, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { InstrumentCategory, EffectName, EFFECTS, getInstrumentsByCategory } from '../lib/effects';
import { ExportPanel } from './ExportPanel';

type NoteData = {
  string: number;
  fret: number;
  fullNote: string;
  noteName: string;
};

interface VirtualGuitarProps {
  effect: EffectName;
  onEffectChange: (effect: EffectName) => void;
}

export const VirtualGuitar: React.FC<VirtualGuitarProps> = ({ effect, onEffectChange }) => {
  const [activeNotes, setActiveNotes] = useState<{ string: number; fret: number; label?: string }[]>([]);

  // Sequencer state
  const [recordingMode, setRecordingMode] = useState<boolean>(false);
  const [sequence, setSequence] = useState<NoteData[][]>([[]]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [playbackStyle, setPlaybackStyle] = useState<'grouped' | 'arpeggio'>('grouped');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<InstrumentCategory>('guitars');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('acoustic');

  const currentIdxRef = useRef(0);

  const playingIdxRef = useRef(0);
  const bpmRef = useRef(bpm);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  const isPlayingRef = useRef(isPlaying);
  const sequenceRef = useRef(sequence);

  // Keep refs in sync with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    if (!isPlaying && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [isPlaying]);

  useEffect(() => {
    sequenceRef.current = sequence;
  }, [sequence]);

  const handleNoteClick = async (stringIndex: number, fret: number) => {
    await audioEngine.init();
    await audioEngine.ensureInstrument(audioEngine.getCurrentInstrument());

    const baseNote = STRINGS[stringIndex];
    const baseNoteIndex = NOTES.indexOf(baseNote.note);
    const noteIndex = (baseNoteIndex + fret) % 12;
    const octaveShift = Math.floor((baseNoteIndex + fret) / 12);
    const noteName = NOTES[noteIndex];
    const octave = baseNote.octave + octaveShift;

    const fullNote = `${noteName}${octave}`;
    audioEngine.playNote(fullNote);

    const newNoteData = { string: stringIndex, fret, fullNote, noteName };

    setSequence(prev => {
      const newSeq = [...prev];
      if (!newSeq[currentStepIndex]) newSeq[currentStepIndex] = [];
      const step = [...newSeq[currentStepIndex]];
      const existingIdx = step.findIndex(n => n.string === stringIndex && n.fret === fret);
      if (existingIdx >= 0) {
        step[existingIdx] = newNoteData;
      } else {
        step.push(newNoteData);
      }
      newSeq[currentStepIndex] = step;
      return newSeq;
    });

    const newNote = { string: stringIndex, fret, label: noteName };
    setActiveNotes((prev) => {
      const filtered = prev.filter(n => n.string !== stringIndex || n.fret !== fret);
      return [...filtered, newNote];
    });
    setTimeout(() => {
      setActiveNotes(prev => prev.filter(n => n.string !== newNote.string || n.fret !== newNote.fret));
    }, 500);
  };

  const togglePlayback = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    if (sequence.length === 0 || (sequence.length === 1 && sequence[0].length === 0)) return;

    await audioEngine.init();
    setIsPlaying(true);
    isPlayingRef.current = true;

    // Determine steps to play dynamically for real‑time changes
    const computeSteps = () => {
      const seq = sequenceRef.current;
      if (playbackStyle === 'grouped') {
        return seq.filter(step => step.length > 0);
      } else {
        // Flatten all notes for arpeggio (one‑by‑one) playback
        return seq.flatMap(step => step);
      }
    };

    let stepsToPlay = computeSteps();
    if (stepsToPlay.length === 0) {
      setIsPlaying(false);
      return;
    }

    let currentIdx = 0;

    const playNext = () => {
      if (!isPlayingRef.current) {
        setIsPlaying(false);
        return;
      }
      const steps = computeSteps();
      if (steps.length === 0) {
        setIsPlaying(false);
        return;
      }

      const msPerBeat = 60000 / bpmRef.current;
      const stepData = steps[currentIdx % steps.length];
      const stepNotes = Array.isArray(stepData) ? stepData : [stepData];
      // Update UI current step index to match the original sequence index (only for grouped style)
      if (playbackStyle === 'grouped') {
        const originalIdx = sequenceRef.current.findIndex(s => s === stepData);
        if (originalIdx !== -1) setCurrentStepIndex(originalIdx);
      }
      stepNotes.forEach(n => audioEngine.playNote(n.fullNote));
      setActiveNotes(stepNotes.map(n => ({ string: n.string, fret: n.fret, label: n.noteName })));

      setTimeout(() => {
        setActiveNotes([]);
      }, msPerBeat > 100 ? msPerBeat * 0.8 : 80);

      currentIdx = (currentIdx + 1) % steps.length;
      timeoutRef.current = setTimeout(playNext, msPerBeat);
    };

    playNext();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Music className="text-orange-500" />
            Interactive Simulator
          </h2>
          <p className="text-zinc-500 text-sm">Tap the fretboard to play real guitar sounds.</p>
        </div>
      </div>

      <Fretboard
        numFrets={22}
        activeNotes={activeNotes}
        onNoteClick={handleNoteClick}
        className="mt-8"
      />

      {/* Instrument Selector */}
      <div className="space-y-3 mt-6">
        {/* Category Tabs */}
        <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
          {(['guitars', 'keys', 'strings'] as InstrumentCategory[]).map(cat => (
            <button
              key={cat}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              onClick={async () => {
                setSelectedCategory(cat);
                const firstInst = getInstrumentsByCategory(cat)[0];
                if (firstInst) {
                  setSelectedInstrument(firstInst.id);
                  try {
                    await audioEngine.setInstrument(firstInst.id);
                  } catch (e) {
                    console.error('Failed to set instrument:', firstInst.id, e);
                  }
                }
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Instrument Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {getInstrumentsByCategory(selectedCategory).map(inst => (
            <button
              key={inst.id}
              className={`py-2 px-3 rounded-lg text-sm font-bold transition-all border ${
                selectedInstrument === inst.id
                  ? 'bg-orange-500/20 border-orange-500 text-orange-500 shadow-sm'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
              }`}
              onClick={async () => {
                setSelectedInstrument(inst.id);
                try {
                  await audioEngine.setInstrument(inst.id);
                } catch (e) {
                  console.error('Failed to set instrument:', inst.id, e);
                }
              }}
            >
              {inst.name}
            </button>
          ))}
        </div>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 text-center">
          <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Current Note</span>
          <span className="text-2xl font-black text-white">{activeNotes.length > 0 ? NOTES[(NOTES.indexOf(STRINGS[activeNotes[0].string].note) + activeNotes[0].fret) % 12] : '--'}</span>
        </div>
        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 text-center">
          <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">String</span>
          <span className="text-2xl font-black text-white">{activeNotes.length > 0 ? STRINGS[activeNotes[0].string].note : '--'}</span>
        </div>
        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 text-center">
          <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Fret</span>
          <span className="text-2xl font-black text-white">{activeNotes.length > 0 ? activeNotes[0].fret : '--'}</span>
        </div>
        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 text-center">
          <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Octave</span>
          <span className="text-2xl font-black text-white">{activeNotes.length > 0 ? STRINGS[activeNotes[0].string].octave + Math.floor((NOTES.indexOf(STRINGS[activeNotes[0].string].note) + activeNotes[0].fret) / 12) : '--'}</span>
        </div>
      </div>

      {/* Sequencer Section */}
      <div className="mt-12 space-y-6 pt-8 border-t border-zinc-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
              <ListMusic className="text-orange-500" />
              Music Maker
            </h3>
            <p className="text-sm text-zinc-500 mt-1">Record your own melodies and chord progressions.</p>
          </div>
          <Button
            variant={recordingMode ? "destructive" : "outline"}
            className={`gap-2 font-bold ${!recordingMode && 'border-zinc-700 hover:border-zinc-500'}`}
            onClick={() => setRecordingMode(!recordingMode)}
          >
            {recordingMode ? <Square size={16} className="fill-current" /> : <Circle size={16} className="fill-red-500 text-red-500" />}
            {recordingMode ? "Stop Recording" : "Record Sequence"}
          </Button>
        </div>

        {recordingMode && (
          <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl text-orange-200 text-sm">
            <strong className="block text-orange-500 mb-1">Recording Mode Active:</strong>
            Tap notes on the fretboard to add them to the current group. Click the "+" button below to start a new group (or beat) in the sequence.
          </div>
        )}
        <div className="p-6 bg-zinc-900/40 rounded-xl border border-zinc-800/50 space-y-8">
          {/* Sequence Editor */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-400">Your Sequence</label>
            <div className="flex bg-[#0f0f0f] p-4 rounded-xl border border-zinc-800/80 gap-3 overflow-x-auto min-h-[100px] items-start">
              {sequence.map((step, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'group', idx }))
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const data = e.dataTransfer.getData('text/plain')
                    if (!data) return
                    const parsed = JSON.parse(data)
                    if (parsed.type === 'group' && parsed.idx !== undefined) {
                      const srcIdx = parsed.idx
                      if (srcIdx !== idx) {
                        const newSeq = [...sequence]
                        const [moved] = newSeq.splice(srcIdx, 1)
                        newSeq.splice(idx, 0, moved)
                        setSequence(newSeq)
                        setCurrentStepIndex(idx)
                      }
                    } else if (parsed.type === 'note' && parsed.srcGroupIdx !== undefined && parsed.srcNoteIdx !== undefined) {
                      const { srcGroupIdx, srcNoteIdx } = parsed
                      const isCopy = e.altKey
                      const newSeq = [...sequence]
                      const noteToMove = newSeq[srcGroupIdx][srcNoteIdx]
                      if (!isCopy) {
                        newSeq[srcGroupIdx] = newSeq[srcGroupIdx].filter((_, i) => i !== srcNoteIdx)
                      }
                      newSeq[idx] = [...newSeq[idx], noteToMove]
                      setSequence(newSeq)
                    }
                  }}
                  className={`relative shrink-0 min-w-[70px] min-h-[70px] rounded-xl border-2 flex flex-col gap-1 p-2 justify-center cursor-pointer transition-colors shadow-sm
                    ${idx === currentStepIndex ? 'border-orange-500 bg-orange-500/5' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'}
                  `}
                  onClick={() => setCurrentStepIndex(idx)}
                >
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-800 text-[10px] font-bold px-2 py-0.5 rounded-full text-zinc-400">
                    Group {idx + 1}
                  </span>
                  {/* Delete group button */}
                  <button
                    className="absolute -top-2 -right-2 bg-zinc-800 p-1 rounded-full text-zinc-500 hover:text-red-500 hover:bg-zinc-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (sequence.length > 1) {
                        setSequence(sequence.filter((_, i) => i !== idx));
                        setCurrentStepIndex(Math.max(0, currentStepIndex - 1));
                      } else {
                        setSequence([[]]);
                      }
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                  {/* Move group up/down */}
                  {idx > 0 && (
                    <button
                      className="absolute -top-2 left-2 bg-zinc-800 p-1 rounded-full text-zinc-500 hover:text-orange-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newSeq = [...sequence];
                        const temp = newSeq[idx - 1];
                        newSeq[idx - 1] = newSeq[idx];
                        newSeq[idx] = temp;
                        setSequence(newSeq);
                        setCurrentStepIndex(idx - 1);
                      }}
                    >
                      <ChevronUp size={12} />
                    </button>
                  )}
                  {idx < sequence.length - 1 && (
                    <button
                      className="absolute -bottom-2 left-2 bg-zinc-800 p-1 rounded-full text-zinc-500 hover:text-orange-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newSeq = [...sequence];
                        const temp = newSeq[idx + 1];
                        newSeq[idx + 1] = newSeq[idx];
                        newSeq[idx] = temp;
                        setSequence(newSeq);
                        setCurrentStepIndex(idx + 1);
                      }}
                    >
                      <ChevronDown size={12} />
                    </button>
                  )}
                  <div className="flex flex-wrap gap-1 justify-center mt-2 w-full">
                    {step.length === 0 && <span className="text-zinc-600 text-[10px] font-medium text-center w-full">Empty</span>}
                    {step.map((n, i) => (
                      <div key={i} className="flex items-center gap-0.5" draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'note', srcGroupIdx: idx, srcNoteIdx: i }));
                        }}>
                        <span className="text-[10px] font-bold bg-zinc-800 border border-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded shadow-sm">
                          {n.noteName}
                        </span>
                        {/* Note reorder buttons */}
                        {i > 0 && (
                          <button
                            className="text-zinc-400 hover:text-orange-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newSeq = [...sequence];
                              const grp = [...newSeq[idx]];
                              [grp[i - 1], grp[i]] = [grp[i], grp[i - 1]];
                              newSeq[idx] = grp;
                              setSequence(newSeq);
                            }}
                          >
                            <ChevronLeft size={10} />
                          </button>
                        )}
                        {i < step.length - 1 && (
                          <button
                            className="text-zinc-400 hover:text-orange-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newSeq = [...sequence];
                              const grp = [...newSeq[idx]];
                              [grp[i], grp[i + 1]] = [grp[i + 1], grp[i]];
                              newSeq[idx] = grp;
                              setSequence(newSeq);
                            }}
                          >
                            <ChevronRight size={10} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Button
                variant="ghost"
                className="h-[70px] w-[70px] shrink-0 border-2 border-dashed border-zinc-700/80 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-500/5 flex items-center justify-center rounded-xl"
                onClick={() => {
                  setSequence([...sequence, []]);
                  setCurrentStepIndex(sequence.length);
                }}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            <div className="space-y-4">
              <label className="text-sm font-bold text-zinc-400 flex justify-between">
                <span>Tempo (BPM)</span>
                <span className="text-white bg-zinc-800 px-2 py-0.5 rounded-md text-xs">{bpm}</span>
              </label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full border-zinc-700 hover:bg-zinc-800"
                  onClick={() => setBpm(b => Math.max(1, b - 1))}
                >
                  <Minus size={14} />
                </Button>
                <div className="flex-1 transition-all">
                  <Slider
                    value={[bpm]}
                    onValueChange={(v) => {
                      const val = Array.isArray(v) ? v[0] : v;
                      if (typeof val === 'number' && !isNaN(val)) setBpm(val);
                    }}
                    min={1}
                    max={300}
                    step={1}
                    className="py-2"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full border-zinc-700 hover:bg-zinc-800"
                  onClick={() => setBpm(b => Math.min(300, b + 1))}
                >
                  <Plus size={14} />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-zinc-400">Playback Style</label>
              <div className="flex bg-[#0f0f0f] p-1 rounded-xl border border-zinc-800">
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-200 ${playbackStyle === 'grouped' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                  onClick={() => setPlaybackStyle('grouped')}
                >
                  <Grid size={16} />
                  Chords
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-200 ${playbackStyle === 'arpeggio' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                  onClick={() => setPlaybackStyle('arpeggio')}
                >
                  <ListMusic size={16} />
                  One by One
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-zinc-700/80 hover:bg-zinc-800 font-bold"
                onClick={() => {
                  setSequence([[]]);
                  setCurrentStepIndex(0);
                  setIsPlaying(false);
                }}
              >
                Clear
              </Button>
              <Button
                className={`flex-1 font-bold gap-2 text-white shadow-lg ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'}`}
                onClick={togglePlayback}
              >
                {isPlaying ? <Square size={16} className="fill-current" /> : <Play size={16} className="fill-current" />}
                {isPlaying ? "Stop" : "Play"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="mt-8 pt-8 border-t border-zinc-800/80">
        <ExportPanel />
      </div>
    </div>
  );
};

