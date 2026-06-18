import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public', 'samples');

const FLUID = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/';
const SALAMANDER = 'https://tonejs.github.io/audio/salamander/';

const fluidDirs = {
  'acoustic_bass-mp3': ['E1.mp3', 'A1.mp3', 'D2.mp3', 'G2.mp3'],
  'acoustic_guitar_nylon-mp3': ['E2.mp3', 'A2.mp3', 'D3.mp3', 'G3.mp3', 'B3.mp3', 'E4.mp3'],
  'acoustic_guitar_steel-mp3': ['E2.mp3', 'A2.mp3', 'D3.mp3', 'G3.mp3', 'B3.mp3', 'E4.mp3'],
  'cello-mp3': ['C2.mp3', 'G2.mp3', 'D3.mp3', 'A3.mp3'],
  'church_organ-mp3': ['C3.mp3', 'E3.mp3', 'G3.mp3', 'C4.mp3', 'E4.mp3', 'G4.mp3', 'C5.mp3', 'E5.mp3', 'G5.mp3'],
  'clavinet-mp3': ['C3.mp3', 'E3.mp3', 'G3.mp3', 'C4.mp3', 'E4.mp3', 'G4.mp3', 'C5.mp3', 'E5.mp3', 'G5.mp3'],
  'contrabass-mp3': ['E1.mp3', 'A1.mp3', 'D2.mp3', 'G2.mp3'],
  'electric_bass_finger-mp3': ['E1.mp3', 'A1.mp3', 'D2.mp3', 'G2.mp3'],
  'electric_guitar_clean-mp3': ['E2.mp3', 'A2.mp3', 'D3.mp3', 'G3.mp3', 'B3.mp3', 'E4.mp3'],
  'electric_piano_1-mp3': ['C3.mp3', 'E3.mp3', 'G3.mp3', 'C4.mp3', 'E4.mp3', 'G4.mp3', 'C5.mp3', 'E5.mp3', 'G5.mp3'],
  'harpsichord-mp3': ['C3.mp3', 'E3.mp3', 'G3.mp3', 'C4.mp3', 'E4.mp3', 'G4.mp3', 'C5.mp3', 'E5.mp3', 'G5.mp3'],
  'pad_2_warm-mp3': ['C3.mp3', 'G3.mp3', 'C4.mp3', 'G4.mp3', 'C5.mp3', 'G5.mp3'],
  'pizzicato_strings-mp3': ['G3.mp3', 'C4.mp3', 'D4.mp3', 'E4.mp3', 'A4.mp3', 'E5.mp3'],
  'viola-mp3': ['C3.mp3', 'G3.mp3', 'D4.mp3', 'A4.mp3'],
  'violin-mp3': ['G3.mp3', 'D4.mp3', 'A4.mp3', 'E5.mp3'],
};

const salamanderNotes = [
  'A0.mp3', 'C1.mp3', 'Ds1.mp3', 'Fs1.mp3',
  'A1.mp3', 'C2.mp3', 'Ds2.mp3', 'Fs2.mp3',
  'A2.mp3', 'C3.mp3', 'Ds3.mp3', 'Fs3.mp3',
  'A3.mp3', 'C4.mp3', 'Ds4.mp3', 'Fs4.mp3',
  'A4.mp3', 'C5.mp3', 'Ds5.mp3', 'Fs5.mp3',
  'A5.mp3', 'C6.mp3', 'Ds6.mp3', 'Fs6.mp3',
  'A6.mp3', 'C7.mp3', 'Ds7.mp3', 'Fs7.mp3',
  'A7.mp3', 'C8.mp3',
];

let downloaded = 0;
let failed = 0;
let skipped = 0;

function log(msg) {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`);
}

async function downloadFile(url, dest) {
  const dir = path.dirname(dest);
  fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    skipped++;
    return;
  }

  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${url}`);
  }
  const buf = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(dest, buf);
  downloaded++;
}

async function downloadAll() {
  log('Starting sample download...\n');

  // FluidR3_GM samples
  const fluidDir = path.join(outDir, 'FluidR3_GM');
  for (const [dirName, notes] of Object.entries(fluidDirs)) {
    const destDir = path.join(fluidDir, dirName);
    for (const note of notes) {
      const url = `${FLUID}${dirName}/${note}`;
      const dest = path.join(destDir, note);
      try {
        await downloadFile(url, dest);
        process.stdout.write('.');
      } catch (err) {
        process.stdout.write('x');
        failed++;
        log(`FAILED: ${url} - ${err.message}`);
      }
    }
  }

  // Salamander piano samples
  const salDir = path.join(outDir, 'salamander');
  for (const note of salamanderNotes) {
    const url = `${SALAMANDER}${note}`;
    const dest = path.join(salDir, note);
    try {
      await downloadFile(url, dest);
      process.stdout.write('.');
    } catch (err) {
      process.stdout.write('x');
      failed++;
      log(`FAILED: ${url} - ${err.message}`);
    }
  }

  console.log('\n');
  log(`Done. Downloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

downloadAll();
