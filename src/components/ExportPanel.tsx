import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Circle, Square, Loader2 } from 'lucide-react';
import { audioEngine } from '../lib/audio';
import { downloadBlob, formatDuration, humanFileSize } from '../lib/export';

interface NoteData {
  string: number;
  fret: number;
  fullNote: string;
  noteName: string;
}

interface ExportPanelProps {
  hasSequence: boolean;
  bpm: number;
  sequence: NoteData[][];
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ hasSequence, bpm, sequence }) => {
  const [format, setFormat] = useState<'wav' | 'mp3'>('wav');
  const [isExporting, setIsExporting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<{ size: string; duration: string } | null>(null);
  const recordingStartRef = useRef(0);

  const handleExportSequence = async () => {
    setIsExporting(true);
    setStatus('Preparing export...');
    setResult(null);

    try {
      await audioEngine.init();
      await audioEngine.ensureInstrument(audioEngine.getCurrentInstrument());
      await audioEngine.startRecording();

      const msPerBeat = 60000 / bpm;
      const validSteps = sequence.filter(step => step.length > 0);
      if (validSteps.length === 0) throw new Error('Nothing to export');

      setStatus(`Rendering ${validSteps.length} steps...`);
      for (const step of validSteps) {
        const chordNotes = step.map(n => n.fullNote);
        if (chordNotes.length === 1) {
          audioEngine.playNote(chordNotes[0]);
        } else {
          audioEngine.playChord(chordNotes);
        }
        await new Promise(resolve => setTimeout(resolve, msPerBeat));
      }

      // Let final notes ring out before stopping
      await new Promise(resolve => setTimeout(resolve, msPerBeat));

      const blob = await audioEngine.stopRecording();

      let finalBlob = blob;
      if (format === 'mp3') {
        setStatus('Converting to MP3...');
        finalBlob = await audioEngine.convertToMp3(blob);
      }

      const filename = `fretmaster-sequence-${Date.now()}.${format}`;
      downloadBlob(finalBlob, filename);

      const totalBeats = validSteps.length;
      const totalSecs = (totalBeats * msPerBeat) / 1000;
      setStatus('Downloaded!');
      setResult({
        size: humanFileSize(finalBlob.size),
        duration: formatDuration(totalSecs),
      });
    } catch (e) {
      setStatus('Export failed: ' + (e instanceof Error ? e.message : 'unknown error'));
      try { await audioEngine.cancelRecording(); } catch { /* ignore */ }
    } finally {
      setIsExporting(false);
    }
  };

  const handleRecordLive = async () => {
    if (isRecording) {
      try {
        const blob = await audioEngine.stopRecording();

        let finalBlob = blob;
        if (format === 'mp3') {
          setStatus('Converting to MP3...');
          finalBlob = await audioEngine.convertToMp3(blob);
        }

        const filename = `fretmaster-recording-${Date.now()}.${format}`;
        downloadBlob(finalBlob, filename);

        setIsRecording(false);
        const elapsed = Math.floor((Date.now() - recordingStartRef.current) / 1000);
        setStatus('Recording saved!');
        setResult({
          size: humanFileSize(finalBlob.size),
          duration: formatDuration(elapsed),
        });
      } catch {
        setStatus('Recording failed');
        setIsRecording(false);
      }
    } else {
      recordingStartRef.current = Date.now();
      setResult(null);
      try {
        await audioEngine.init();
        await audioEngine.ensureInstrument(audioEngine.getCurrentInstrument());
        await audioEngine.startRecording();
        setIsRecording(true);
        setStatus('Recording... (play or sing into your microphone)');
      } catch {
        setStatus('Failed to start recording');
      }
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <Download className="h-5 w-5 text-orange-500" />
        Export Audio
      </h3>

      <div className="flex gap-2">
        <button
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
            format === 'wav'
              ? 'bg-orange-500 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
          onClick={() => setFormat('wav')}
        >
          WAV
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
            format === 'mp3'
              ? 'bg-orange-500 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
          onClick={() => setFormat('mp3')}
        >
          MP3
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          disabled={!hasSequence || isExporting || isRecording}
          onClick={handleExportSequence}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export Sequence
        </Button>
        <Button
          variant={isRecording ? 'destructive' : 'outline'}
          onClick={handleRecordLive}
        >
          {isRecording ? (
            <>
              <Square className="h-4 w-4 mr-2 fill-current" /> Stop Recording
            </>
          ) : (
            <>
              <Circle className="h-4 w-4 mr-2 text-red-500" /> Record Live
            </>
          )}
        </Button>
      </div>

      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          Recording...
        </div>
      )}

      {status && (
        <div className="text-sm text-zinc-400 bg-zinc-900/50 px-3 py-2 rounded-lg border border-zinc-800">
          {status}
        </div>
      )}

      {result && (
        <div className="text-xs text-zinc-500 flex gap-4">
          <span>Size: {result.size}</span>
          <span>Duration: {result.duration}</span>
        </div>
      )}
    </div>
  );
};
