import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Circle, Square, Loader2 } from 'lucide-react';
import { audioEngine } from '../lib/audio';
import { downloadBlob, formatDuration, humanFileSize } from '../lib/export';

export const ExportPanel: React.FC = () => {
  const [format, setFormat] = React.useState<'wav' | 'mp3'>('wav');
  const [isRecording, setIsRecording] = React.useState(false);
  const [isConverting, setIsConverting] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [result, setResult] = React.useState<{ size: string; duration: string } | null>(null);
  const recordingStartRef = useRef(0);

  const handleRecordLive = async () => {
    if (isRecording) {
      setIsConverting(true);
      try {
        setStatus('Processing recording...');
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
        setStatus('Saved!');
        setResult({
          size: humanFileSize(finalBlob.size),
          duration: formatDuration(elapsed),
        });
      } catch (e) {
        setStatus('Recording failed: ' + (e instanceof Error ? e.message : 'unknown error'));
        setIsRecording(false);
      } finally {
        setIsConverting(false);
      }
    } else {
      recordingStartRef.current = Date.now();
      setResult(null);
      try {
        await audioEngine.init();
        audioEngine.startRecording();
        setIsRecording(true);
        setStatus('');
      } catch (e) {
        setStatus('Failed to start recording: ' + (e instanceof Error ? e.message : 'unknown error'));
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

      <Button
        variant={isRecording ? 'destructive' : 'outline'}
        onClick={handleRecordLive}
        disabled={isConverting}
        className="w-full"
      >
        {isConverting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Converting...
          </>
        ) : isRecording ? (
          <>
            <Square className="h-4 w-4 mr-2 fill-current" /> Stop Recording
          </>
        ) : (
          <>
            <Circle className="h-4 w-4 mr-2 text-red-500" /> Record Live
          </>
        )}
      </Button>

      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          Recording... (play your guitar)
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
