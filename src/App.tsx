
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Home, 
  BookOpen, 
  Wrench, 
  Music2, 
  Flame, 
  Trophy, 
  Clock,
  ChevronRight,
  Settings,
  User,
  GraduationCap,
  Library,
  Brain,
  Dumbbell,
  Lightbulb,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

import { Fretboard } from './components/Fretboard';
import { ChordDiagram } from './components/ChordDiagram';
import { Metronome } from './components/Metronome';
import { Tuner } from './components/Tuner';
import { InteractiveCircle } from './components/InteractiveCircle';

import { VirtualGuitar } from './components/VirtualGuitar';
import { CHORDS, SCALES, LESSONS, NOTES, ARPEGGIOS, STRINGS } from './constants/guitar';
import { cn } from '@/lib/utils';
import { audioEngine, InstrumentType } from './lib/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const [selectedScale, setSelectedScale] = useState<string | null>(null);
  const [selectedScaleRoot, setSelectedScaleRoot] = useState<string>('C');
  const [selectedArpeggio, setSelectedArpeggio] = useState<string | null>(null);
  const [selectedArpeggioRoot, setSelectedArpeggioRoot] = useState<string>('C');
  const [toast, setToast] = useState<string | null>(null);
  const [instrument, setInstrument] = useState<InstrumentType>('acoustic');
  const [metronomeSound, setMetronomeSound] = useState<'Woodblock' | 'Digital Beep' | 'Drum Stick'>('Woodblock');
  const [masterVolume, setMasterVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    import('tone').then((Tone) => {
      // 80 -> ~0dB. We'll map 0-100 to -60dB -> +10dB
      if (isMuted || masterVolume === 0) {
        audioEngine.setMute(true);
      } else {
        const minDb = -60;
        const maxDb = 10;
        const volDb = minDb + (masterVolume / 100) * (maxDb - minDb);
        audioEngine.setVolume(volDb);
        audioEngine.setMute(false);
      }
    });
  }, [masterVolume, isMuted]);

  const handleNoteClick = async (stringIndex: number, fret: number) => {
    await audioEngine.init();
    
    // Calculate the note name
    const baseNote = STRINGS[stringIndex];
    const baseNoteIndex = NOTES.indexOf(baseNote.note);
    const noteIndex = (baseNoteIndex + fret) % 12;
    const octaveShift = Math.floor((baseNoteIndex + fret) / 12);
    const noteName = NOTES[noteIndex];
    const octave = baseNote.octave + octaveShift;
    
    const fullNote = `${noteName}${octave}`;
    audioEngine.playNote(fullNote);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLessonComplete = (lessonId: string, lessonTitle: string) => {
    showToast(`Started lesson: ${lessonTitle}`);
    setActiveLesson(lessonId);
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#fb923c', '#ffffff']
      });
    } catch (e) {
      console.error("Confetti error:", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-orange-500/30">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white px-6 py-3 rounded-full shadow-2xl border border-zinc-700 z-50 font-bold"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 bottom-0 w-20 md:w-64 bg-zinc-900 border-r border-zinc-800 z-50 flex flex-col">
        <div className="p-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              <Music2 className="text-white h-6 w-6" />
            </div>
            <span className="text-xl font-black tracking-tighter hidden md:block">FRETMASTER</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavButton 
            icon={<Home />} 
            label="Home" 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
          />
          <NavButton 
            icon={<GraduationCap />} 
            label="Lessons" 
            active={activeTab === 'lessons'} 
            onClick={() => setActiveTab('lessons')} 
          />
          <NavButton 
            icon={<Library />} 
            label="Chords Directory" 
            active={activeTab === 'directory'} 
            onClick={() => setActiveTab('directory')} 
          />
          <NavButton 
            icon={<Brain />} 
            label="Theory" 
            active={activeTab === 'theory'} 
            onClick={() => setActiveTab('theory')} 
          />
          <NavButton 
            icon={<Dumbbell />} 
            label="Scales" 
            active={activeTab === 'scales'} 
            onClick={() => setActiveTab('scales')} 
          />
          <NavButton 
            icon={<Music2 />} 
            label="Arpeggios" 
            active={activeTab === 'arpeggios'} 
            onClick={() => setActiveTab('arpeggios')} 
          />
          <NavButton 
            icon={<Wrench />} 
            label="Tools" 
            active={activeTab === 'tools'} 
            onClick={() => setActiveTab('tools')} 
          />
          <NavButton 
            icon={<Lightbulb />} 
            label="Tips" 
            active={activeTab === 'tips'} 
            onClick={() => setActiveTab('tips')} 
          />

        </nav>

        <div className="p-4 mt-auto border-t border-zinc-800 space-y-2">
          <NavButton icon={<Settings />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          <div 
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer group",
              activeTab === 'profile' && "bg-zinc-800"
            )}
            onClick={() => setActiveTab('profile')}
          >
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
              <User className="text-zinc-500 h-6 w-6" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold">Local Player</p>
              <p className="text-xs text-zinc-500">Offline Mode</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="pl-20 md:pl-64 min-h-screen">
        <header className="h-20 border-b border-zinc-800 flex items-center justify-between px-8 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-xl z-40">
          <h1 className="text-xl font-bold capitalize">{activeTab}</h1>
          <div className="flex items-center gap-4">
            <select 
              value={instrument} 
              onChange={(e) => {
                const val = e.target.value as InstrumentType;
                setInstrument(val);
                audioEngine.setInstrument(val);
              }}
              className="bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700 outline-none focus:border-orange-500 transition-colors font-bold cursor-pointer hidden md:block"
            >
              <option value="acoustic">Acoustic Guitar</option>
              <option value="electric">Electric Guitar</option>
              <option value="violin">Violin</option>
              <option value="piano">Grand Piano</option>
            </select>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'home' && (
                <div className="space-y-12">
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative bg-gradient-to-br from-orange-500/20 to-orange-900/10 border border-orange-500/30 rounded-3xl p-8 md:p-12 overflow-hidden"
                  >
                    <div className="absolute -right-20 -bottom-20 opacity-10 pointer-events-none">
                      <Music2 className="w-96 h-96 text-orange-500" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 bg-zinc-900 rounded-full flex items-center justify-center border-4 border-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.4)] overflow-hidden">
                        <motion.div 
                          animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }} 
                          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                          className="text-6xl md:text-7xl"
                        >
                          🎸
                        </motion.div>
                      </div>
                      <div className="text-center md:text-left flex-1">
                        <motion.h2 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-4xl md:text-5xl font-black text-white mb-4"
                        >
                          Hey there! I'm <span className="text-orange-500">Fretmaster</span>.
                        </motion.h2>
                        <motion.p 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-xl text-orange-100/80 max-w-2xl mb-8"
                        >
                          Welcome to your ultimate guitar journey. Whether you're picking up the guitar for the first time or looking to shred like the legends, I'm here to guide your fingers to the right notes. Let's make some noise!
                        </motion.p>
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="flex flex-wrap justify-center md:justify-start gap-4"
                        >
                          <Button className="bg-orange-500 hover:bg-orange-600 font-bold h-12 px-8 rounded-xl text-lg text-white" onClick={() => setActiveTab('lessons')}>
                            Start Learning
                          </Button>
                          <Button variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 h-12 px-8 rounded-xl text-lg hover:text-orange-300" onClick={() => setActiveTab('tools')}>
                            Tune Guitar
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="pt-8">
                    <h3 className="text-3xl font-black mb-8 text-white flex items-center gap-3">
                      <Flame className="text-orange-500 w-8 h-8" />
                      Words from the Pioneers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div whileHover={{ scale: 1.02 }} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Music2 className="w-24 h-24" />
                        </div>
                        <p className="text-xl text-zinc-300 italic mb-6 relative z-10">"Sometimes you want to give up with the guitar, you'll hate the guitar. But if you stick with it, you're gonna be rewarded."</p>
                        <p className="font-bold text-orange-500 relative z-10">— Jimi Hendrix</p>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.02 }} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Music2 className="w-24 h-24" />
                        </div>
                        <p className="text-xl text-zinc-300 italic mb-6 relative z-10">"The beautiful thing about learning is nobody can take it away from you."</p>
                        <p className="font-bold text-orange-500 relative z-10">— B.B. King</p>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.02 }} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Music2 className="w-24 h-24" />
                        </div>
                        <p className="text-xl text-zinc-300 italic mb-6 relative z-10">"I play the guitar because it lets me speak the things I can’t say in words."</p>
                        <p className="font-bold text-orange-500 relative z-10">— Stevie Ray Vaughan</p>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.02 }} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Music2 className="w-24 h-24" />
                        </div>
                        <p className="text-xl text-zinc-300 italic mb-6 relative z-10">"If you want to play the guitar, play it. Don't let anyone tell you you can't do it."</p>
                        <p className="font-bold text-orange-500 relative z-10">— Eddie Van Halen</p>
                      </motion.div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'lessons' && (
                <div className="space-y-6">
                  {activeLesson ? (
                    <div className="space-y-8">
                      <Button 
                        variant="outline" 
                        className="border-zinc-800 text-zinc-400 hover:text-white"
                        onClick={() => setActiveLesson(null)}
                      >
                        ← Back to Lessons
                      </Button>
                      
                      {activeLesson === 'beg-1' && (
                        <div className="space-y-8">
                          <div>
                            <h2 className="text-3xl font-black mb-4">Your First Chords</h2>
                            <p className="text-zinc-400 text-lg">Let's learn the fundamental open chords: G, C, and D. These are the building blocks of thousands of songs.</p>
                          </div>
                          <h3 className="text-2xl font-bold mb-4 mt-8 text-white">Major Chords</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {Object.keys(CHORDS.major).filter(k => !k.includes('_barre')).map(key => (
                              <div key={`maj-${key}`} className="flex flex-col items-center justify-start bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 min-h-[280px]">
                                <ChordDiagram chord={CHORDS.major[key as keyof typeof CHORDS.major]} name={`${key} Major`} className="scale-125 origin-top" />
                              </div>
                            ))}
                          </div>
                          
                          <h3 className="text-2xl font-bold mb-4 mt-12 text-white">Minor Chords</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {Object.keys(CHORDS.minor).map(key => (
                              <div key={`min-${key}`} className="flex flex-col items-center justify-start bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 min-h-[280px]">
                                <ChordDiagram chord={CHORDS.minor[key as keyof typeof CHORDS.minor]} name={`${key}`} className="scale-125 origin-top" />
                              </div>
                            ))}
                          </div>

                          <h3 className="text-2xl font-bold mb-4 mt-12 text-white">Dominant 7th Chords</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {Object.keys(CHORDS.dom7).map(key => (
                              <div key={`dom7-${key}`} className="flex flex-col items-center justify-start bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 min-h-[280px]">
                                <ChordDiagram chord={CHORDS.dom7[key as keyof typeof CHORDS.dom7]} name={`${key}`} className="scale-125 origin-top" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeLesson === 'beg-2' && (
                        <div className="space-y-8">
                          <div>
                            <h2 className="text-3xl font-black mb-4">Strumming Basics</h2>
                            <p className="text-zinc-400 text-lg">Rhythm is just as important as the notes you play. A steady strumming hand acts as the drum kit of the acoustic guitar. Let's start by understanding the fundamental strokes before combining them into patterns.</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 space-y-4 text-center">
                              <h3 className="text-xl font-bold text-white">1. The Downstroke (↓)</h3>
                              <p className="text-zinc-400">Drive downwards across the strings. Keep your wrist loose and let gravity do the work. The downstroke usually lands on the strong beats (1, 2, 3, 4).</p>
                              <img src="/src/assets/images/guitar_downstroke_1781229161369.jpg" className="rounded-xl w-full object-cover aspect-video" alt="Downstroke" />
                            </div>
                            <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 space-y-4 text-center">
                              <h3 className="text-xl font-bold text-white">2. The Upstroke (↑)</h3>
                              <p className="text-zinc-400">Brush upwards against the bottom 3-4 strings. It should feel lighter than a downstroke. Upstrokes typically fall on the weak "and" beats between numbers.</p>
                              <img src="/src/assets/images/guitar_upstroke_1781229177606.jpg" className="rounded-xl w-full object-cover aspect-video" alt="Upstroke" />
                            </div>
                          </div>

                          <div className="pt-8">
                            <h3 className="text-2xl font-bold mb-6 text-white">Essential Strumming Patterns</h3>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                              
                              <div className="bg-[#0f0f0f] border border-zinc-800 hover:border-zinc-700 transition p-6 rounded-3xl text-center space-y-4 shadow-lg shadow-black/50">
                                <h4 className="text-lg font-bold text-orange-500">The Campfire (Universal Pattern)</h4>
                                <div className="flex justify-center items-center gap-2 sm:gap-4 text-xl sm:text-3xl font-black text-white py-6 bg-zinc-900 rounded-2xl">
                                  <span>↓</span>
                                  <span>↓</span>
                                  <span>↑</span>
                                  <span className="text-zinc-700 px-2">—</span>
                                  <span>↑</span>
                                  <span>↓</span>
                                  <span>↑</span>
                                </div>
                                <p className="text-zinc-300 font-mono">D - D - U - (miss) - U - D - U</p>
                                <p className="text-sm text-zinc-500 my-2 text-left">The most popular strumming pattern in existence. Instead of a downstroke on beat 3, your hand "misses" the strings, creating a syncopated groove.</p>
                              </div>

                              <div className="bg-[#0f0f0f] border border-zinc-800 hover:border-zinc-700 transition p-6 rounded-3xl text-center space-y-4 shadow-lg shadow-black/50">
                                <h4 className="text-lg font-bold text-orange-500">Four on the Floor (Straight 8ths)</h4>
                                <div className="flex justify-center items-center gap-2 sm:gap-4 text-xl sm:text-3xl font-black text-white py-6 bg-zinc-900 rounded-2xl">
                                  <span>↓</span>
                                  <span className="text-zinc-500 text-lg px-1 text-base">&amp;</span>
                                  <span>↓</span>
                                  <span className="text-zinc-500 text-lg px-1 text-base">&amp;</span>
                                  <span>↓</span>
                                  <span className="text-zinc-500 text-lg px-1 text-base">&amp;</span>
                                  <span>↓</span>
                                  <span className="text-zinc-500 text-lg px-1 text-base">&amp;</span>
                                </div>
                                <p className="text-zinc-300 font-mono">1 &amp; 2 &amp; 3 &amp; 4 &amp;</p>
                                <p className="text-sm text-zinc-500 text-left">A driving pattern great for rock and punk. It relies entirely on rhythmic, powerful downstrokes on every eighth note.</p>
                              </div>

                              <div className="bg-[#0f0f0f] border border-zinc-800 hover:border-zinc-700 transition p-6 rounded-3xl text-center space-y-4 shadow-lg shadow-black/50">
                                <h4 className="text-lg font-bold text-orange-500">The Waltz (3/4 Time)</h4>
                                <div className="flex justify-center items-center gap-2 sm:gap-4 text-xl sm:text-3xl font-black text-white py-6 bg-zinc-900 rounded-2xl">
                                  <span className="text-orange-400">↓</span>
                                  <span className="text-zinc-700 px-2">|</span>
                                  <span>↓</span>
                                  <span>↑</span>
                                  <span className="text-zinc-700 px-2">|</span>
                                  <span>↓</span>
                                  <span>↑</span>
                                </div>
                                <p className="text-zinc-300 font-mono">1 - 2 &amp; 3 &amp;</p>
                                <p className="text-sm text-zinc-500 text-left">Counted in 3 instead of 4. Hit the first downstroke hard (the bass note), followed by lighter down-up strums. Gives a dancing feel.</p>
                              </div>

                              <div className="bg-[#0f0f0f] border border-zinc-800 hover:border-zinc-700 transition p-6 rounded-3xl text-center space-y-4 shadow-lg shadow-black/50">
                                <h4 className="text-lg font-bold text-orange-500">The Folk Driving Pattern</h4>
                                <div className="flex justify-center items-center gap-2 sm:gap-4 text-xl sm:text-3xl font-black text-white py-6 bg-zinc-900 rounded-2xl">
                                  <span>↓</span>
                                  <span>↓</span>
                                  <span>↑</span>
                                  <span className="text-zinc-700 px-2">|</span>
                                  <span>↓</span>
                                  <span>↓</span>
                                  <span>↑</span>
                                </div>
                                <p className="text-zinc-300 font-mono">D - D - U - D - D - U</p>
                                <p className="text-sm text-zinc-500 text-left">Fast and energetic. Often played with a strong emphasis on the first downstroke. Perfect for upbeat folk and country songs.</p>
                              </div>

                            </div>
                          </div>
                        </div>
                      )}

                      {activeLesson === 'int-1' && (
                        <div className="space-y-8">
                          <div>
                            <h2 className="text-3xl font-black mb-4">Barre Chords</h2>
                            <p className="text-zinc-400 text-lg">Unlock the entire fretboard with movable shapes. Barre chords use your index finger as a nut.</p>
                          </div>
                          <h3 className="text-2xl font-bold mb-4 mt-8 text-white">Major 7th Chords</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {Object.keys(CHORDS.maj7).map(key => (
                              <div key={`maj7-${key}`} className="flex flex-col items-center justify-start bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 min-h-[280px]">
                                <ChordDiagram chord={CHORDS.maj7[key as keyof typeof CHORDS.maj7]} name={`${key}`} className="scale-125 origin-top" />
                              </div>
                            ))}
                          </div>

                          <h3 className="text-2xl font-bold mb-4 mt-12 text-white">Common Barre Shapes</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {Object.keys(CHORDS.major).filter(k => k.includes('_barre')).map(key => (
                              <div key={`barre-${key}`} className="flex flex-col items-center justify-start bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 min-h-[280px]">
                                <ChordDiagram chord={CHORDS.major[key as keyof typeof CHORDS.major]} name={`${key.replace('_barre', '')} Major`} className="scale-125 origin-top" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-3xl font-black">Structured Lessons</h2>
                          <p className="text-zinc-500">Follow our expert-crafted path from zero to hero.</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Beginner</Badge>
                          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Intermediate</Badge>
                          <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Advanced</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {LESSONS.map((lesson) => (
                          <Card key={lesson.id} className="bg-zinc-900 border-zinc-800 text-white group hover:border-orange-500/50 transition-all cursor-pointer">
                            <CardHeader>
                              <div className="flex justify-between items-start mb-2">
                                <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">{lesson.difficulty}</Badge>
                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                                  <ChevronRight className="h-4 w-4" />
                                </div>
                              </div>
                              <CardTitle className="text-xl font-bold group-hover:text-orange-500 transition-colors">{lesson.title}</CardTitle>
                              <CardDescription className="text-zinc-400 line-clamp-2">{lesson.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Button 
                                className="w-full bg-zinc-800 hover:bg-orange-500 font-bold relative z-10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLessonComplete(lesson.id, lesson.title);
                                }}
                              >
                                Start Lesson
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'scales' && (
                <div className="space-y-8">
                  <div className="mb-8">
                    <h2 className="text-3xl font-black flex items-center gap-3">
                      <Music2 className="text-orange-500" />
                      Scale Library
                    </h2>
                    <p className="text-zinc-500">Explore interactive scales across the fretboard.</p>
                  </div>

                  <div className="space-y-8">
                    <div className="flex flex-col gap-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Root Note</h3>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {NOTES.map((note) => (
                            <Button 
                              key={note} 
                              variant={selectedScaleRoot === note ? 'default' : 'outline'}
                              className={cn(
                                "h-12 w-12 font-bold rounded-xl flex-shrink-0",
                                selectedScaleRoot === note ? "bg-orange-500" : "border-zinc-800 bg-zinc-900"
                              )}
                              onClick={() => setSelectedScaleRoot(note)}
                            >
                              {note}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Scale Type</h3>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                          {Object.entries(SCALES).map(([key, scale]) => (
                            <Button 
                              key={key} 
                              variant={selectedScale === key ? 'default' : 'outline'}
                              className={cn(
                                "h-12 px-6 font-bold whitespace-nowrap rounded-xl",
                                selectedScale === key ? "bg-orange-500" : "border-zinc-800 bg-zinc-900"
                              )}
                              onClick={() => setSelectedScale(key)}
                            >
                              {scale.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bg-zinc-900/30 rounded-3xl border border-zinc-800 p-8">
                      {selectedScale ? (
                        <div className="space-y-8">
                          <Fretboard 
                            activeNotes={
                              Array.from({ length: 6 }).flatMap((_, stringIndex) => 
                                Array.from({ length: 15 }).map((_, fret) => ({ string: stringIndex, fret }))
                              ).filter(({ string, fret }) => {
                                const stringBaseNotes = [4, 11, 7, 2, 9, 4]; // E, B, G, D, A, E
                                const noteIndex = (stringBaseNotes[string] + fret) % 12;
                                const rootIndex = NOTES.indexOf(selectedScaleRoot);
                                return SCALES[selectedScale as keyof typeof SCALES].intervals.includes((noteIndex - rootIndex + 12) % 12);
                              })
                            }
                            onNoteClick={handleNoteClick}
                            className="w-full"
                          />
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-zinc-600 italic">Select a scale to visualize on the fretboard</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'arpeggios' && (
                <div className="space-y-8">
                  <div className="mb-8">
                    <h2 className="text-3xl font-black flex items-center gap-3">
                      <Music2 className="text-orange-500" />
                      Arpeggio Library
                    </h2>
                    <p className="text-zinc-500">Explore interactive arpeggios across the fretboard.</p>
                  </div>

                  <div className="space-y-8">
                    <div className="flex flex-col gap-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Root Note</h3>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {NOTES.map((note) => (
                            <Button 
                              key={note} 
                              variant={selectedArpeggioRoot === note ? 'default' : 'outline'}
                              className={cn(
                                "h-12 w-12 font-bold rounded-xl flex-shrink-0",
                                selectedArpeggioRoot === note ? "bg-orange-500" : "border-zinc-800 bg-zinc-900"
                              )}
                              onClick={() => setSelectedArpeggioRoot(note)}
                            >
                              {note}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Arpeggio Type</h3>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                          {Object.entries(ARPEGGIOS).map(([key, arpeggio]) => (
                            <Button 
                              key={key} 
                              variant={selectedArpeggio === key ? 'default' : 'outline'}
                              className={cn(
                                "h-12 px-6 font-bold whitespace-nowrap rounded-xl",
                                selectedArpeggio === key ? "bg-orange-500" : "border-zinc-800 bg-zinc-900"
                              )}
                              onClick={() => setSelectedArpeggio(key)}
                            >
                              {arpeggio.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bg-zinc-900/30 rounded-3xl border border-zinc-800 p-8">
                      {selectedArpeggio ? (
                        <div className="space-y-8">
                          <Fretboard 
                            activeNotes={
                              Array.from({ length: 6 }).flatMap((_, stringIndex) => 
                                Array.from({ length: 15 }).map((_, fret) => ({ string: stringIndex, fret }))
                              ).filter(({ string, fret }) => {
                                const stringBaseNotes = [4, 11, 7, 2, 9, 4]; // E, B, G, D, A, E
                                const noteIndex = (stringBaseNotes[string] + fret) % 12;
                                const rootIndex = NOTES.indexOf(selectedArpeggioRoot);
                                return ARPEGGIOS[selectedArpeggio as keyof typeof ARPEGGIOS].intervals.includes((noteIndex - rootIndex + 12) % 12);
                              })
                            }
                            onNoteClick={handleNoteClick}
                            className="w-full"
                          />
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-zinc-600 italic">Select an arpeggio to visualize on the fretboard</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'directory' && (
                <div className="space-y-8">
                  <div className="mb-8">
                    <h2 className="text-3xl font-black flex items-center gap-3">
                      <BookOpen className="text-orange-500" />
                      Chords Directory
                    </h2>
                    <p className="text-zinc-500">A complete reference of all chords in all keys.</p>
                  </div>
                  
                  <div className="space-y-12">
                    {['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'].map((key) => (
                      <div key={key} className="space-y-4">
                        <h3 className="text-2xl font-bold border-b border-zinc-800 pb-2">Key of {key}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {CHORDS.major[key as keyof typeof CHORDS.major] && (
                            <div className="flex flex-col items-center gap-2 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 hover:border-orange-500/50 transition-colors cursor-pointer">
                              <span className="font-bold">{key} Major</span>
                              <ChordDiagram chord={CHORDS.major[key as keyof typeof CHORDS.major]} name={key} className="scale-75" />
                            </div>
                          )}
                          {CHORDS.minor[`${key}m` as keyof typeof CHORDS.minor] && (
                            <div className="flex flex-col items-center gap-2 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 hover:border-orange-500/50 transition-colors cursor-pointer">
                              <span className="font-bold">{key} Minor</span>
                              <ChordDiagram chord={CHORDS.minor[`${key}m` as keyof typeof CHORDS.minor]} name={`${key}m`} className="scale-75" />
                            </div>
                          )}
                          {CHORDS.dom7[`${key}7` as keyof typeof CHORDS.dom7] && (
                            <div className="flex flex-col items-center gap-2 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 hover:border-orange-500/50 transition-colors cursor-pointer">
                              <span className="font-bold">{key}7</span>
                              <ChordDiagram chord={CHORDS.dom7[`${key}7` as keyof typeof CHORDS.dom7]} name={`${key}7`} className="scale-75" />
                            </div>
                          )}
                          {CHORDS.maj7[`${key}maj7` as keyof typeof CHORDS.maj7] && (
                            <div className="flex flex-col items-center gap-2 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 hover:border-orange-500/50 transition-colors cursor-pointer">
                              <span className="font-bold">{key}maj7</span>
                              <ChordDiagram chord={CHORDS.maj7[`${key}maj7` as keyof typeof CHORDS.maj7]} name={`${key}maj7`} className="scale-75" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'theory' && (
                <div className="space-y-8">
                  <div className="mb-8">
                    <h2 className="text-3xl font-black flex items-center gap-3">
                      <BookOpen className="text-orange-500" />
                      Music Theory
                    </h2>
                    <p className="text-zinc-500">Master the language and foundation of music.</p>
                  </div>
                  
                  <Tabs defaultValue="intervals" className="w-full">
                    <TabsList className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl mb-8 flex justify-start gap-2 overflow-x-auto">
                      <TabsTrigger value="intervals" className="rounded-lg bg-zinc-800 text-zinc-400 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold transition-all px-6 py-3">Intervals</TabsTrigger>
                      <TabsTrigger value="harmony" className="rounded-lg bg-zinc-800 text-zinc-400 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold transition-all px-6 py-3">Harmony & Modes</TabsTrigger>
                      <TabsTrigger value="sheet_music" className="rounded-lg bg-zinc-800 text-zinc-400 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold transition-all px-6 py-3">Sheet Music</TabsTrigger>
                      <TabsTrigger value="terms" className="rounded-lg bg-zinc-800 text-zinc-400 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold transition-all px-6 py-3">Musical Terms</TabsTrigger>
                    </TabsList>

                    <TabsContent value="intervals" className="space-y-6">
                      <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                          <CardTitle className="text-2xl font-bold text-zinc-400">Understanding Intervals</CardTitle>
                          <CardDescription className="text-zinc-400">An interval is the distance in pitch between two notes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <p className="text-zinc-300">
                            In Western music, the smallest interval is the half step (or semitone). Two half steps equal a whole step (or whole tone). 
                            Intervals are the building blocks of chords and scales.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { name: 'Unison', halfSteps: 0, desc: 'The exact same pitch.' },
                              { name: 'Minor second', halfSteps: 1, desc: 'One half-step apart (e.g., C to C#). Creates tension.' },
                              { name: 'Major second', halfSteps: 2, desc: 'One whole step apart (e.g., C to D).' },
                              { name: 'Minor third', halfSteps: 3, desc: 'Used in minor chords. Gives a sad or dark feel.' },
                              { name: 'Major third', halfSteps: 4, desc: 'Used in major chords. Bright and happy.' },
                              { name: 'Perfect fourth', halfSteps: 5, desc: 'Very stable, open sound.' },
                              { name: 'Tritone', halfSteps: 6, desc: 'The "Devil\'s interval." Very dissonant.' },
                              { name: 'Perfect fifth', halfSteps: 7, desc: 'The foundation of power chords. Highly stable.' },
                              { name: 'Minor sixth', halfSteps: 8, desc: 'Often found in minor scales, creates emotional pull.' },
                              { name: 'Major sixth', halfSteps: 9, desc: 'Pleasant, open, slightly sweet.' },
                              { name: 'Minor seventh', halfSteps: 10, desc: 'Crucial for dominant 7th chords. Bluesy.' },
                              { name: 'Major seventh', halfSteps: 11, desc: 'Creates a dreamy, floating tension.' },
                              { name: 'Octave', halfSteps: 12, desc: 'Same note name, higher pitch. Perfect harmony.' },
                            ].map((interval) => (
                              <div key={interval.name} className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-bold text-orange-400">{interval.name}</h4>
                                  <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-300 bg-zinc-800 px-2 py-0.5">{interval.halfSteps} Half Steps</Badge>
                                </div>
                                <p className="text-zinc-400 text-sm">{interval.desc}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="harmony" className="space-y-6">
                      <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                          <CardTitle className="text-2xl font-bold text-zinc-400">Harmony & Modes</CardTitle>
                          <CardDescription className="text-zinc-400">Keys, circle of fifths, chords in a key, and relative modes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-12">
                          
                          <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">Circle of Fifths & Fourths</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                              <div>
                                <p className="text-zinc-300 mb-4">
                                  The **Circle of Fifths** is a visual representation of all 12 keys. Moving clockwise around the circle, each key is a perfect fifth up from the previous one, adding one sharp (#) to the key signature.
                                </p>
                                <p className="text-zinc-300 mb-4">
                                  Going counter-clockwise gives the **Circle of Fourths**, adding one flat (b) per step. This tool is essential for understanding key signatures, chord progressions, and modulation.
                                </p>
                                <p className="text-orange-400 font-medium text-sm">
                                  Click on any key in the circle to see its relative minor, scale notes, and diatonic chords. Tap the scale notes and chords below the circle to hear what they sound like on piano.
                                </p>
                              </div>
                              <InteractiveCircle />
                            </div>
                          </div>

                          <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">Chords in a Major Key (Diatonic Harmony)</h3>
                            <p className="text-zinc-300">
                              Every major scale inherently contains 7 chords, one built on each degree of the scale. For a Major Key, the pattern of chord types is always:
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-7 gap-2 text-center text-sm md:text-xs xl:text-sm">
                              <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                                <div className="text-orange-400 font-bold mb-1">I</div>
                                <div className="text-white">Major</div>
                              </div>
                              <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                                <div className="text-zinc-400 font-bold mb-1">ii</div>
                                <div className="text-white">Minor</div>
                              </div>
                              <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                                <div className="text-zinc-400 font-bold mb-1">iii</div>
                                <div className="text-white">Minor</div>
                              </div>
                              <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                                <div className="text-orange-400 font-bold mb-1">IV</div>
                                <div className="text-white">Major</div>
                              </div>
                              <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                                <div className="text-orange-400 font-bold mb-1">V</div>
                                <div className="text-white">Major</div>
                              </div>
                              <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                                <div className="text-zinc-400 font-bold mb-1">vi</div>
                                <div className="text-white">Minor</div>
                              </div>
                              <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                                <div className="text-red-400 font-bold mb-1">vii°</div>
                                <div className="text-white">Diminished</div>
                              </div>
                            </div>
                            <p className="text-zinc-400 text-sm mt-2 italic">Example in C Major: C Maj, D min, E min, F Maj, G Maj, A min, B dim.</p>
                          </div>

                          <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">Degrees & Relative Modes</h3>
                            <p className="text-zinc-300">
                              By starting the major scale from a different note (degree), we create "Modes", each with a distinct emotional flavor. 
                            </p>
                            <div className="space-y-4">
                              <div className="flex flex-col md:flex-row bg-zinc-800/30 p-4 rounded-xl border border-zinc-700 gap-4 md:items-center">
                                <div className="w-full md:w-32 text-center py-2 px-4 bg-orange-500/20 text-orange-400 font-bold rounded">Ionian</div>
                                <div>
                                  <div className="font-bold text-white">The Major Scale (1st Degree)</div>
                                  <div className="text-sm text-zinc-400">Happy, bright, and resolved. Used as the foundation of Western harmony.</div>
                                </div>
                              </div>
                              <div className="flex flex-col md:flex-row bg-zinc-800/30 p-4 rounded-xl border border-zinc-700 gap-4 md:items-center">
                                <div className="w-full md:w-32 text-center py-2 px-4 bg-yellow-500/20 text-yellow-500 font-bold rounded">Dorian</div>
                                <div>
                                  <div className="font-bold text-white">Relative Dorian (2nd Degree)</div>
                                  <div className="text-sm text-zinc-400">Jazzy minor, soul, slightly brighter than natural minor. Starts on the 2nd degree.</div>
                                </div>
                              </div>
                              <div className="flex flex-col md:flex-row bg-zinc-800/30 p-4 rounded-xl border border-zinc-700 gap-4 md:items-center">
                                <div className="w-full md:w-32 text-center py-2 px-4 bg-purple-500/20 text-purple-400 font-bold rounded">Phrygian</div>
                                <div>
                                  <div className="font-bold text-white">Relative Phrygian (3rd Degree)</div>
                                  <div className="text-sm text-zinc-400">Dark, exotic, Spanish/Flamenco feel. Starts on the 3rd degree of the major scale.</div>
                                </div>
                              </div>
                              <div className="flex flex-col md:flex-row bg-zinc-800/30 p-4 rounded-xl border border-zinc-700 gap-4 md:items-center">
                                <div className="w-full md:w-32 text-center py-2 px-4 bg-green-500/20 text-green-400 font-bold rounded">Lydian</div>
                                <div>
                                  <div className="font-bold text-white">Relative Lydian (4th Degree)</div>
                                  <div className="text-sm text-zinc-400">Dreamy, floaty major scale with a raised 4th. Starts on the 4th degree.</div>
                                </div>
                              </div>
                              <div className="flex flex-col md:flex-row bg-zinc-800/30 p-4 rounded-xl border border-zinc-700 gap-4 md:items-center">
                                <div className="w-full md:w-32 text-center py-2 px-4 bg-pink-500/20 text-pink-400 font-bold rounded">Mixolydian</div>
                                <div>
                                  <div className="font-bold text-white">Relative Mixolydian (5th Degree)</div>
                                  <div className="text-sm text-zinc-400">Bluesy, rock/pop major scale with a flat 7th. Starts on the 5th degree.</div>
                                </div>
                              </div>
                              <div className="flex flex-col md:flex-row bg-zinc-800/30 p-4 rounded-xl border border-zinc-700 gap-4 md:items-center">
                                <div className="w-full md:w-32 text-center py-2 px-4 bg-blue-500/20 text-blue-400 font-bold rounded">Aeolian</div>
                                <div>
                                  <div className="font-bold text-white">Relative Minor (6th Degree)</div>
                                  <div className="text-sm text-zinc-400">Sad, emotional, dark. Found by starting on the 6th degree of the major scale.</div>
                                </div>
                              </div>
                              <div className="flex flex-col md:flex-row bg-zinc-800/30 p-4 rounded-xl border border-zinc-700 gap-4 md:items-center">
                                <div className="w-full md:w-32 text-center py-2 px-4 bg-red-500/20 text-red-500 font-bold rounded">Locrian</div>
                                <div>
                                  <div className="font-bold text-white">Relative Locrian (7th Degree)</div>
                                  <div className="text-sm text-zinc-400">Very dark, dissonant and unresolved. Starts on the 7th degree.</div>
                                </div>
                              </div>
                            </div>
                          </div>

                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="terms" className="space-y-6">
                      <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                          <CardTitle className="text-2xl font-bold text-zinc-400">Glossary of Musical Terms</CardTitle>
                          <CardDescription className="text-zinc-400">Common terminology used in music and guitar playing.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {[
                            { term: 'Arpeggio', def: 'Playing the notes of a chord one by one rather than strumming them all together.' },
                            { term: 'BPM', def: 'Beats Per Minute. Used to indicate the tempo (speed) of a piece of music.' },
                            { term: 'Chord Progression', def: 'A sequence of chords played in specific order to form the harmonic foundation of a song.' },
                            { term: 'Dissonance', def: 'A combination of notes that sound unstable or harsh together, wanting resolution.' },
                            { term: 'Key Signature', def: 'The set of sharps or flats at the beginning of a piece indicating the ruling scale.' },
                            { term: 'Legato', def: 'Playing notes smoothly connected without breaks. On guitar, often involves hammer-ons and pull-offs.' },
                            { term: 'Root', def: 'The foundational note upon which a chord or scale is built. A "C major" chord has "C" as the root.' },
                            { term: 'Syncopation', def: 'Placing emphasis on a normally weak or unaccented beat.' },
                            { term: 'Tempo', def: 'The speed or pace of a given piece of music.' },
                            { term: 'Vibrato', def: 'A slight, rapid fluctuation in pitch used to add expression to a note.' },
                          ].map((item) => (
                            <div key={item.term} className="bg-zinc-800/50 p-4 rounded-xl border-l-4 border-l-orange-500 border-t border-b border-r border-zinc-700">
                              <h4 className="font-bold text-white mb-1">{item.term}</h4>
                              <p className="text-zinc-400 text-sm">{item.def}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="sheet_music" className="space-y-8">
                      <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                          <CardTitle className="text-2xl font-bold text-zinc-400">How to Read Sheet Music</CardTitle>
                          <CardDescription className="text-zinc-400">The universal language for communicating music.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-12">
                          
                          <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">1. The Staff</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                              <div>
                                <p className="text-zinc-300 mb-4">
                                  The **musical staff** is made up of five horizontal lines and four spaces. Notes are placed on these lines or in the spaces to indicate their pitch.
                                </p>
                                <p className="text-zinc-400">
                                  Higher notes on the staff sound higher in pitch, while lower notes sound lower. If a note goes higher or lower than the 5 lines, we use short extra lines called "ledger lines".
                                </p>
                              </div>
                              <img src="/src/assets/images/staff_lines_illustration_1781220938959.jpg" alt="Musical Staff Lines" className="rounded-xl border border-zinc-700 w-full object-cover" />
                            </div>
                          </div>

                          <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">2. The Clefs</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-4">
                                <h4 className="text-orange-400 font-bold">Treble Clef (G-Clef)</h4>
                                <p className="text-zinc-300">
                                  Used for higher-pitched instruments, like Guitar, Violin, and the right hand on a piano. The swirly part circles around the note "G" (the second line from the bottom).
                                </p>
                                <ul className="text-zinc-400 text-sm list-disc pl-5">
                                  <li>Lines (bottom to top): E, G, B, D, F (Every Good Boy Deserves Fudge)</li>
                                  <li>Spaces (bottom to top): F, A, C, E (Spells "FACE")</li>
                                </ul>
                                <img src="/src/assets/images/treble_clef_illustration_1781220952050.jpg" alt="Treble Clef" className="rounded-xl border border-zinc-700 w-full object-cover aspect-video mt-4" />
                              </div>
                              <div className="space-y-4">
                                <h4 className="text-blue-400 font-bold">Bass Clef (F-Clef)</h4>
                                <p className="text-zinc-300">
                                  Used for lower-pitched instruments, like Bass Guitar, Cello, and the left hand on a piano. The two dots surround the note "F" (the second line from the top).
                                </p>
                                <ul className="text-zinc-400 text-sm list-disc pl-5">
                                  <li>Lines (bottom to top): G, B, D, F, A (Good Boys Do Fine Always)</li>
                                  <li>Spaces (bottom to top): A, C, E, G (All Cows Eat Grass)</li>
                                </ul>
                                <img src="/src/assets/images/bass_clef_illustration_1781220965677.jpg" alt="Bass Clef" className="rounded-xl border border-zinc-700 w-full object-cover aspect-video mt-4" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">3. Note Durations</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                              <div>
                                <p className="text-zinc-300 mb-4">
                                  While the vertical position of a note tells you *what* pitch to play, the shape of the note tells you *how long* to play it.
                                </p>
                                <ul className="text-zinc-400 space-y-2">
                                  <li><strong className="text-white">Whole Note:</strong> An empty circle. Lasts for 4 beats.</li>
                                  <li><strong className="text-white">Half Note:</strong> An empty circle with a stem. Lasts for 2 beats.</li>
                                  <li><strong className="text-white">Quarter Note:</strong> A filled-in circle with a stem. Lasts for 1 beat.</li>
                                  <li><strong className="text-white">Eighth Note:</strong> A filled circle with a stem and one flag. Lasts for 1/2 of a beat.</li>
                                </ul>
                              </div>
                              <img src="/src/assets/images/note_durations_illustration_1781220976441.jpg" alt="Note Durations" className="rounded-xl border border-zinc-700 w-full object-cover" />
                            </div>
                          </div>

                          <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">4. Time Signatures</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                              <div>
                                <p className="text-zinc-300 mb-4">
                                  Found right after the clef, the time signature tells you how the music is counted. It looks like a fraction without a line.
                                </p>
                                <ul className="text-zinc-400 space-y-2">
                                  <li><strong className="text-white">Top Number:</strong> How many beats are in each measure.</li>
                                  <li><strong className="text-white">Bottom Number:</strong> Which note gets one beat (4 = quarter note, 8 = eighth note).</li>
                                </ul>
                                <p className="text-zinc-400 mt-4">
                                  **4/4 Time (Common Time)** is the most frequent: 4 beats per measure, quarter note gets the beat. **3/4 Time (Waltz)** has 3 beats per measure.
                                </p>
                              </div>
                              <img src="/src/assets/images/time_signatures_1781222891260.jpg" alt="Time Signatures" className="rounded-xl border border-zinc-700 w-full object-cover" />
                            </div>
                          </div>

                          <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">5. Sharps, Flats, and Naturals</h3>
                            <p className="text-zinc-300">Accidentals change the pitch of a note by a half-step:</p>
                            <ul className="text-zinc-400 space-y-4">
                              <li className="flex items-start gap-3">
                                <span className="text-2xl font-bold text-orange-500 w-8 text-center">#</span>
                                <div><strong className="text-white">Sharp:</strong> Raises the note pitch by one half-step (one fret higher on guitar).</div>
                              </li>
                              <li className="flex items-start gap-3">
                                <span className="text-2xl font-bold text-blue-500 w-8 text-center">b</span>
                                <div><strong className="text-white">Flat:</strong> Lowers the note pitch by one half-step (one fret lower on guitar).</div>
                              </li>
                              <li className="flex items-start gap-3">
                                <span className="text-2xl font-bold text-zinc-300 w-8 text-center">♮</span>
                                <div><strong className="text-white">Natural:</strong> Cancels a previous sharp or flat, returning the note to its normal pitch.</div>
                              </li>
                            </ul>
                          </div>

                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {activeTab === 'tips' && (
                <div className="space-y-8">
                  <div className="mb-8">
                    <h2 className="text-3xl font-black flex items-center gap-3">
                      <Lightbulb className="text-orange-500" />
                      Learning Tips
                    </h2>
                    <p className="text-zinc-500">Advice on how to get the most out of your guitar journey.</p>
                  </div>

                  <Card className="bg-orange-500/10 border-orange-500/30 text-orange-200">
                    <CardHeader>
                      <CardTitle className="text-orange-500">Welcome to your learning lab!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p>
                        <strong>Disclaimer:</strong> This app is best used when you are doing research and practicing. This app has all the information you need, but how you learn is entirely up to you! We're here to give you the tools, but you are the artist. Have fun with it, be patient with yourself, and enjoy the process.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="space-y-6 mt-8">
                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          <Flame className="text-orange-500 h-5 w-5" />
                          Universal Beginner Advice
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside space-y-2 text-zinc-300">
                          <li><strong>Calluses take time:</strong> Your fingertips will hurt for the first few weeks. Play through it (but stop if there's sharp joint pain). Calluses are a guitarist's badge of honor.</li>
                          <li><strong>Tune every time:</strong> Make it a habit. Open our <strong>Precision Tuner</strong> every time you pick up the guitar. An untuned guitar makes even perfect playing sound terrible.</li>
                          <li><strong>Posture matters:</strong> Sit up straight, keep the guitar close to your body, and don't hunch over the fretboard. Your back will thank you when you're older.</li>
                          <li><strong>Listen to yourself:</strong> Record yourself playing on your phone. You will notice mistakes and rhythmic inconsistencies you miss while you're focused on playing.</li>
                          <li><strong>Rome wasn't built in a day:</strong> There will be plateaus. You might feel stuck for a week, and then suddenly, a difficult chord change clicks into place overnight. Trust the process.</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          <Music2 className="text-orange-500 h-5 w-5" />
                          Mastering Arpeggios
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-zinc-300">
                          The best way to learn arpeggios is to actually open the Arpeggios library in this app. Using your phone? Great. Take a picture or screenshot of the arpeggio shapes and notes you want to learn.
                        </p>
                        <p className="text-zinc-300">
                          Then, go online and search, <span className="italic text-zinc-400">"Oh, this is how these arpeggios go,"</span> or simply decide the order of notes yourself. Take that sequence, open up the <strong className="text-white">Virtual Guitar</strong> in the Tools section, and put that command right into the Music Maker sequence.
                        </p>
                        <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
                          <p className="text-sm text-zinc-400 mb-2"><strong>Developer Secret:</strong></p>
                          <p className="text-sm text-zinc-300">
                            We purposely did not put a BPM tempo or playback engine directly in the Arpeggio or Chords libraries! Why? Because we want you to be involved in the learning process. You have to take screenshots, do research online about which notes come first, and experiment. Even if it seems obvious, doing the research and manually entering the notes builds tremendous muscle memory.
                          </p>
                        </div>
                        <p className="text-zinc-300">
                          You can play the notes in any order you want—it's completely flexible. Try putting the notes in one by one, set the playback style to "One by One," and slowly increase the BPM in the Virtual Guitar as you get comfortable.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          <Brain className="text-blue-500 h-5 w-5" />
                          Tip: The 5-Minute Rule
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-zinc-300">
                          Don't have time for a full hour practice session? Just commit to 5 minutes. Pick up the guitar, open the <strong>Virtual Guitar</strong> or the <strong>Chords Directory</strong>, and play for just 5 minutes. More often than not, you'll end up playing much longer once you start. Consistency beats duration!
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          <Dumbbell className="text-green-500 h-5 w-5" />
                          Tip: Use the Metronome Every Day
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-zinc-300">
                          It doesn't matter if you're practicing scales, chords, or a full song. Go to the <strong>Tools</strong> section, turn on the Metronome, and force yourself to play in time. Start at a painfully slow BPM where you can play it perfectly, and only increase the speed when you can play it 3 times flawlessly.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          <BookOpen className="text-purple-500 h-5 w-5" />
                          Navigating Music Theory
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-zinc-300">
                          Music theory isn't rules; it's explanations for why things sound good. Don't try to memorize it all at once. When you learn a new song, go to the <strong>Theory</strong> section and see if you can figure out what key it's in. Learning theory little by little as it relates to what you're already playing is the key to mastering the fretboard.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          <Library className="text-yellow-500 h-5 w-5" />
                          Exploring the Chords Directory
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-zinc-300">
                          The <strong>Chords Directory</strong> is meant to be a dictionary, not a novel to read cover-to-cover. Look up chords as you encounter them in songs. Focus intensely on smooth transitions between pairs of common open chords (C to G, D to A, E to Am) before worrying about complex dominant 7ths or diminished chords.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          <Brain className="text-cyan-500 h-5 w-5" />
                          Conquering Barre Chords
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-zinc-300">
                          Barre chords are the great filter for beginner guitarists. It will hurt at first, and it will sound muted. <strong>This is completely normal.</strong> It takes time to build the required muscle strength. Focus on strengthening your index finger clamping power, but don't forget the other fingers! Your pinky is often the weakest link; do spider exercises to strengthen it. Roll your index finger slightly to its bony side rather than using the fleshy bottom to get a cleaner sound.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          <Dumbbell className="text-red-500 h-5 w-5" />
                          Scales are Your Vocabulary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-zinc-300">
                          Don't just run scales up and down mechanically. Once you learn a pattern in the <strong>Scales</strong> section, try skipping strings, playing it in a different rhythm, or putting on a backing track and using the scale notes to improvise. The goal is to build vocabulary for solos, not just finger gymnastics.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          <Music2 className="text-pink-500 h-5 w-5" />
                          Secrets of Strumming
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-zinc-300">
                          Your strumming hand is your engine. Keep it moving continuously in a steady down-up rhythm, even when you aren't actually hitting the strings (like on the "misses" in the universal pattern seen in the <strong>Lessons</strong> tab). Keep your wrist loose—like you're shaking water off your hand. The rhythm comes from the wrist, not the elbow.
                        </p>
                      </CardContent>
                    </Card>


                  </div>
                </div>
              )}

              {activeTab === 'tools' && (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Precision Tuner</h3>
                      <Tuner />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Pro Metronome</h3>
                      <Metronome soundType={metronomeSound} />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Virtual Guitar</h3>
                    <VirtualGuitar />
                  </div>
                </div>
              )}


              {activeTab === 'settings' && (
                <div className="space-y-8">
                  <div className="mb-8">
                    <h2 className="text-3xl font-black flex items-center gap-3">
                      <Settings className="text-orange-500" />
                      Settings
                    </h2>
                    <p className="text-zinc-500">Manage your local app preferences.</p>
                  </div>
                  <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader>
                      <CardTitle>Audio Preferences</CardTitle>
                      <CardDescription className="text-zinc-400">Customize how FretMaster sounds.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold">Master Volume</p>
                            <p className="text-sm text-zinc-500">Adjust the global volume level.</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="rounded-full w-10 h-10 border-zinc-700 bg-zinc-800 text-white"
                            onClick={() => setIsMuted(!isMuted)}
                          >
                            {isMuted || masterVolume === 0 ? <VolumeX className="text-red-500" /> : <Volume2 className="text-orange-500" />}
                          </Button>
                        </div>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={masterVolume}
                            onValueChange={(val: number | number[]) => {
                              const newValue = Array.isArray(val) ? val[0] : val;
                              setMasterVolume(newValue);
                              if (newValue > 0 && isMuted) {
                                setIsMuted(false);
                              }
                            }}
                            max={100}
                            min={0}
                            step={1}
                            className="flex-1"
                          />
                          <span className="w-8 text-right font-mono text-zinc-400">{masterVolume}%</span>
                        </div>
                      </div>
                      <div className="h-[1px] bg-zinc-800 w-full" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold">Metronome Click Sound</p>
                          <p className="text-sm text-zinc-500">Choose the sound for the metronome.</p>
                        </div>
                        <select 
                          className="bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700 outline-none"
                          value={metronomeSound}
                          onChange={(e) => setMetronomeSound(e.target.value as any)}
                        >
                          <option value="Woodblock">Woodblock</option>
                          <option value="Digital Beep">Digital Beep</option>
                          <option value="Drum Stick">Drum Stick</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader>
                      <CardTitle>Privacy & Offline Mode</CardTitle>
                      <CardDescription className="text-zinc-400">FretMaster runs safely and completely on your device.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-green-400">100% Offline Capable & No AI</p>
                          <p className="text-sm text-zinc-500">The entire app runs locally without an internet connection or AI services.</p>
                        </div>
                        <Badge variant="outline" className="border-green-500 text-green-400">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold">Local Storage</p>
                          <p className="text-sm text-zinc-500">Your preferences and practice history are saved securely on this device only.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div className="mb-8">
                    <h2 className="text-3xl font-black flex items-center gap-3">
                      <User className="text-orange-500" />
                      Your Local Profile
                    </h2>
                    <p className="text-zinc-500">View your offline stats and achievements.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-zinc-900 border-zinc-800 text-white col-span-1 flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-24 h-24 rounded-full bg-zinc-800 border-4 border-orange-500 flex items-center justify-center mb-4">
                        <User className="text-zinc-500 h-12 w-12" />
                      </div>
                      <h3 className="text-2xl font-black">Local Player</h3>
                      <p className="text-orange-500 font-bold mb-4">Offline Mode</p>
                      <Badge variant="outline" className="border-zinc-700">Practice Ready</Badge>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800 text-white col-span-2">
                      <CardHeader>
                        <CardTitle>Achievements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <BookOpen className="text-blue-500" />
                            </div>
                            <div>
                              <p className="font-bold">Guitar Explorer</p>
                              <p className="text-xs text-zinc-400">Ready to learn</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <Music2 className="text-purple-500" />
                            </div>
                            <div>
                              <p className="font-bold">Chord Master</p>
                              <p className="text-xs text-zinc-400">Discovering chords</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-3 rounded-xl transition-all group relative",
        active ? "bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]" : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
      )}
    >
      <div className={cn("transition-transform group-hover:scale-110", active && "scale-110")}>
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
      <span className="font-bold hidden md:block">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-active" 
          className="absolute left-0 w-1 h-8 bg-white rounded-r-full hidden md:block" 
        />
      )}
    </button>
  );
}

function ActivityItem({ title, time, onClick }: { title: string, time: string, onClick?: () => void }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-orange-500 group-hover:scale-150 transition-transform" />
        <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{title}</span>
      </div>
      <span className="text-xs text-zinc-600">{time}</span>
    </div>
  );
}

