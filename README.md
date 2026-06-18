# FretMaster — Interactive Guitar Coach

A fully offline, browser-based guitar coach with 18 instrument profiles, 4 audio effects, a virtual fretboard, sequence recorder, and audio export (WAV/MP3).

## Features

- **Virtual Fretboard** — Click any string/fret to hear real sampled instruments
- **18 Instruments** — Acoustic & electric guitars, piano, organ, strings, brass, and more
- **4 Effects** — Clean, Ambient, Overdrive, Heavy — applied in real time
- **Music Maker** — Build note sequences by tapping the fretboard, arrange into groups, and play back as chords or arpeggios
- **Audio Export** — Record your sequence or live play and download as WAV or MP3
- **Fully Offline** — All 120 audio samples bundled locally, no internet required after download
- **Metronome, Chord Diagrams, Circle of Fifths, Tuner** — Built-in practice tools

## Download

### Windows (EXE Launcher)

Download [FretMaster-App.zip](./FretMaster-App.zip), extract, and run `FretMaster-Setup.bat` or launch `FretMaster.exe` directly.

Requirements:
- **Node.js v24+** installed on your system

The EXE launches a local Node.js server on port 3000 and opens the app in your default browser.

### Anyone (No install)

The app is a static web app. You can serve it with any HTTP server:

```bash
npx serve .
```

Then open `http://localhost:3000` in your browser.

## Building from Source

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Package for Windows (EXE + web assets)
npm run package:windows
```

The built output goes to `installer/output/`.

## Tech Stack

- **Frontend:** React 19, Vite 6, Tailwind CSS 4
- **Audio:** Tone.js 15, Web Audio API, MediaRecorder
- **Samples:** FluidR3_GM soundfonts + Salamander Grand Piano
- **Desktop:** .NET EXE launcher (C#)
- **Export:** WAV (native) / MP3 (lamejs)
