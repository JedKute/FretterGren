# FretterGren — Interactive Guitar Coach

A fully offline, browser-based guitar coach with 18 instrument profiles, 4 audio effects, a virtual fretboard, sequence recorder, and audio export (WAV/MP3).

## Features

- **Virtual Fretboard** — Click any string/fret to hear real sampled instruments
- **18 Instruments** — Acoustic & electric guitars, piano, organ, strings, brass, and more
- **4 Effects** — Clean, Ambient, Overdrive, Heavy — applied in real time
- **Music Maker** — Build note sequences by tapping the fretboard, arrange into groups, and play back as chords or arpeggios
- **Audio Export** — Record your sequence or live play and download as WAV or MP3
- **Fully Offline** — All 120+ audio samples bundled locally, no internet required after download
- **Metronome, Chord Diagrams, Circle of Fifths, Tuner** — Built-in practice tools

## Download

Download the latest `FretterGren-App.zip` from the [Releases page](https://github.com/JedKute/FretterGren/releases). Extract and run `FretMaster.exe`.

**Requirements:** Node.js v24+

The EXE launches a local Node.js server and opens the app in your default browser.

### Build from Source

```bash
npm install
npm run dev      # development server
npm run build    # production build to dist/
```

See `installer/Build-Installer.ps1` for packaging the production build with the .NET EXE launcher.

## Tech Stack

- **Frontend:** React 19, Vite 6, Tailwind CSS 4
- **Audio:** Tone.js 15, Web Audio API, MediaRecorder
- **Samples:** FluidR3_GM soundfonts + Salamander Grand Piano
- **Desktop:** .NET EXE launcher (C#)
- **Export:** WAV (native) / MP3 (lamejs)
