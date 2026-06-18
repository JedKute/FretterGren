# Sound Profiles & Audio Export Design

## Overview
Add 20 instrument types with 4 effect chains each (80 combinations) and audio export functionality to the Virtual Guitar component.

## Instrument Types (20)

### Guitars (8)
1. **Acoustic** - Steel-string acoustic (existing)
2. **Electric** - Clean electric (existing)
3. **12-String** - 12-string acoustic
4. **Nylon** - Classical/nylon-string
5. **Resonator** - Dobro-style resonator
6. **Bass** - Acoustic bass
7. **Electric Bass** - Electric bass guitar
8. **Baritone** - Baritone guitar (lower tuning)

### Keys (6)
9. **Piano** - Grand piano (existing)
10. **Electric Piano** - Rhodes/Wurlitzer style
11. **Synth Pad** - Atmospheric synthesizer
12. **Organ** - Hammond-style organ
13. **Harpsichord** - Baroque harpsichord
14. **Clavinet** - Funk clavinet

### Strings (4)
15. **Violin** - Classical violin (existing)
16. **Cello** - Deep cello
17. **Viola** - Mid-range viola
18. **Double Bass** - Upright bass

### Other (2)
19. **Ukulele** - Soprano ukulele
20. **Mandolin** - Mandolin

## Effect Chains (4 per instrument = 80 total)

| Effect | Description | Tone.js Chain |
|--------|-------------|---------------|
| **Clean** | Dry, no effects | `Sampler → Destination` |
| **Ambient** | Lush, spacious | `Sampler → Chorus → Reverb → Destination` |
| **Overdrive** | Gritty, warm | `Sampler → Distortion → EQ → Destination` |
| **Heavy** | High gain, spacious | `Sampler → Distortion → Delay → Reverb → Destination` |

## UI Changes

### Instrument Selector (VirtualGuitar.tsx)
- Replace current 4-button instrument selector
- New dropdown/combo: **Instrument Category** → **Instrument** → **Effect Chain**
- Visual: Category tabs (Guitars/Keys/Strings/Other) with instrument grid
- Effect selector: 4 buttons (Clean/Ambient/Overdrive/Heavy)

### Export Panel (New Component: ExportPanel.tsx)
Location: Below Sequencer section in VirtualGuitar

**Features:**
- **Export Sequence** - Renders entire recorded sequence to audio file
- **Export Live Recording** - Records live playing + sequence playback
- **Format Selector**: WAV / MP3 radio buttons
- **Progress Bar** with percentage and cancel button
- **Download** - Triggers browser download when complete

## Technical Implementation

### AudioEngine (audio.ts) Changes
1. **Add 16 new samplers** with appropriate soundfont URLs
2. **Create EffectChain class** to manage 4 effect configurations
3. **Add `exportSequence()` method** - uses Tone.Offline for offline rendering
4. **Add `startRecording()` / `stopRecording()`** - uses Tone.Recorder or MediaRecorder API
5. **Add `exportToWAV()` / `exportToMP3()`** - WAV via Tone.Offline, MP3 via lamejs or MediaRecorder

### VirtualGuitar.tsx Changes
1. **Instrument/Effect State**: Add `selectedInstrument`, `selectedEffect` state
2. **Instrument Selector UI**: Category tabs + instrument grid + effect buttons
3. **ExportPanel Component**: New component imported and rendered below sequencer
4. **Recording Integration**: Hook up export buttons to AudioEngine methods

### New Files
- `src/components/ExportPanel.tsx` - Export UI component
- `src/lib/effects.ts` - Effect chain definitions
- `src/lib/export.ts` - Export utilities (WAV/MP3 encoding)

### Dependencies
- `lamejs` - MP3 encoding (npm install lamejs)
- Tone.js already has OfflineContext for WAV export

## Data Flow

```
User selects Instrument + Effect
    ↓
AudioEngine loads Sampler + builds EffectChain
    ↓
User plays/plays sequence
    ↓
User clicks "Export Sequence" or "Export Live"
    ↓
AudioEngine.exportSequence() / startRecording()
    ↓
Tone.Offline renders to AudioBuffer
    ↓
Encode to WAV (native) or MP3 (lamejs)
    ↓
Blob → URL.createObjectURL → <a download> click
```

## Error Handling
- Loading states for instrument/effect switching
- Export progress with cancel option
- Format fallback (MP3 fails → offer WAV)
- Memory limits for long recordings
- AudioContext suspension handling

## Testing
- Verify all 20 instruments load correctly
- Test all 4 effect chains per instrument
- Export WAV/MP3 for various sequence lengths
- Test live recording export
- Cancel during export
- Memory cleanup after export