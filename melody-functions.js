// Musical constants
const DURATION_VALUES = {
  '1': 4,      // Whole note
  '1/2': 2,    // Half note
  '1/4': 1,    // Quarter note
  '1/8': 0.5,  // Eighth note
  '1/16': 0.25, // Sixteenth note
  '1/32': 0.125 // Thirty-second note
};

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Scale patterns (intervals from root note)
const SCALE_PATTERNS = {
  major: [0, 2, 4, 5, 7, 9, 11],        // C major: C, D, E, F, G, A, B
  minor: [0, 2, 3, 5, 7, 8, 10],        // C minor: C, D, Eb, F, G, Ab, Bb
  pentatonic: [0, 2, 4, 7, 9]           // C pentatonic: C, D, E, G, A
};

// Time signatures with both beats per bar and beat unit
const TIME_SIGNATURES = {
  '2/4': { beatsPerBar: 2, beatUnit: 4, name: '2/4' },
  '3/4': { beatsPerBar: 3, beatUnit: 4, name: '3/4' },
  '4/4': { beatsPerBar: 4, beatUnit: 4, name: '4/4' }
};

// Function to generate scale notes array
function generateScale(rootNote, scaleType) {
  console.log(`🎼 Generating ${scaleType} scale starting from ${rootNote}`);
  
  // Find the root note index
  const rootIndex = NOTES.indexOf(rootNote);
  if (rootIndex === -1) {
    console.error('❌ Invalid root note:', rootNote);
    return [];
  }
  
  // Get the pattern for the scale type
  const pattern = SCALE_PATTERNS[scaleType];
  if (!pattern) {
    console.error('❌ Invalid scale type:', scaleType);
    return [];
  }
  
  // Generate scale notes by applying pattern to root
  const scaleNotes = pattern.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return noteIndex;
  });
  
  console.log(`✅ Generated ${scaleType} scale for ${rootNote}:`, scaleNotes);
  return scaleNotes;
}

function generateNoteSequence(
  numBars,
  timeSignature,
  scale,
  startOctave,
  shortestNote,
  isBassline = false,
) {
  debugger; // This will pause execution when DevTools is open
  console.log('🎵 generateNoteSequence called with:', {
    numBars,
    timeSignature,
    scale,
    startOctave,
    shortestNote,
    isBassline
  });
  
  // Use the TIME_SIGNATURES object instead of parsing
  const timeSig = TIME_SIGNATURES[timeSignature];
  if (!timeSig) {
    console.error('❌ Invalid time signature:', timeSignature);
    return [];
  }
  
  const { beatsPerBar, beatUnit } = timeSig;
  const barDuration = (4 / beatUnit) * beatsPerBar; // In whole notes
  const notes = [];
  let currentTime = 0;

  console.log('📊 Calculated values:', { beatsPerBar, beatUnit, barDuration });

  const possibleDurations = Object.keys(DURATION_VALUES).filter(
    (d) => DURATION_VALUES[d] <= DURATION_VALUES[shortestNote],
  );

  console.log('⏱️ Possible durations:', possibleDurations);

  for (let i = 0; i < numBars; i++) {
    console.log(`🎼 Generating bar ${i + 1}/${numBars}`);
    let currentBarDuration = 0;
    while (currentBarDuration < barDuration) {
      let durationStr =
        possibleDurations[
          Math.floor(Math.random() * possibleDurations.length)
        ];
      let durationVal = DURATION_VALUES[durationStr];

      if (currentBarDuration + durationVal > barDuration) {
        // Find a duration that fits perfectly
        const remainingDuration = barDuration - currentBarDuration;
        const fittingDuration = Object.entries(DURATION_VALUES).find(
          ([, val]) => Math.abs(val - remainingDuration) < 0.001,
        );
        if (fittingDuration) {
          durationStr = fittingDuration[0];
          durationVal = fittingDuration[1];
        } else {
          // Should not happen often with small subdivisions
          break;
        }
      }

      const noteIndex = scale[Math.floor(Math.random() * scale.length)];
      const octave =
        startOctave + (isBassline ? 0 : Math.floor(Math.random() * 2));
      const pitch = NOTES[noteIndex] + octave;

      notes.push({ time: currentTime, pitch, duration: durationStr });
      currentBarDuration += durationVal;
      currentTime += durationVal;
    }
  }
  
  console.log('✅ Generated notes:', notes);
  return notes;
}

function drawMelody(melody, timeSignature, numVoices) {
  console.log('🎨 drawMelody called with:', { melody, timeSignature, numVoices });
  
  const displayDiv = document.getElementById("melody-display");
  console.log('📱 Display div found:', displayDiv);
  
  displayDiv.innerHTML = "";
  const renderer = new Vex.Flow.Renderer(
    displayDiv,
    Vex.Flow.Renderer.Backends.SVG,
  );
  renderer.resize(800, numVoices === 2 ? 250 : 150);
  const context = renderer.getContext();

  console.log('🎼 Creating treble stave...');
  const stave1 = new Vex.Flow.Stave(10, 20, 780)
    .addClef("treble")
    .addTimeSignature(timeSignature);
  stave1.setContext(context).draw();
  
  console.log('🎵 Processing voice 1 notes:', melody.voice1);
  const vexNotes1 = melody.voice1.map((note) => {
    const pitch = note.pitch.slice(0, -1);
    const octave = note.pitch.slice(-1);
    const key = `${pitch}/${octave}`;
    const staveNote = new Vex.Flow.StaveNote({
      keys: [key],
      duration: note.duration.replace("n", ""),
    });
    if (pitch.includes("#")) {
      staveNote.addModifier(new Vex.Flow.Accidental("#"));
    }
    return staveNote;
  });
  if (vexNotes1.length > 0) {
    Vex.Flow.Formatter.FormatAndDraw(context, stave1, vexNotes1);
    console.log('✅ Voice 1 drawn successfully');
  }

  if (numVoices === 2 && melody.voice2.length > 0) {
    console.log('🎼 Creating bass stave...');
    const stave2 = new Vex.Flow.Stave(10, 130, 780)
      .addClef("bass")
      .addTimeSignature(timeSignature);
    stave2.setContext(context).draw();
    
    console.log('🎵 Processing voice 2 notes:', melody.voice2);
    const vexNotes2 = melody.voice2.map((note) => {
      const pitch = note.pitch.slice(0, -1);
      const octave = note.pitch.slice(-1);
      const key = `${pitch}/${octave}`;
      const staveNote = new Vex.Flow.StaveNote({
        keys: [key],
        duration: note.duration.replace("n", ""),
      });
      if (pitch.includes("#")) {
        staveNote.addModifier(new Vex.Flow.Accidental("#"));
      }
      return staveNote;
    });
    if (vexNotes2.length > 0) {
      Vex.Flow.Formatter.FormatAndDraw(context, stave2, vexNotes2);
      console.log('✅ Voice 2 drawn successfully');
    }
  }
  
  console.log('🎉 drawMelody completed successfully');
}

function generateMelody() {
  console.log('🎼 Starting melody generation...');
  
  // Get values from UI controls
  const numBars = parseInt(document.getElementById('bars-slider').value);
  const numVoices = parseInt(document.getElementById('voices-selector').value);
  const shortestNote = document.getElementById('shortest-note-dropdown').value;
  const tempo = parseInt(document.getElementById('tempo-slider').value);
  const timeSignature = document.getElementById('time-signature-dropdown').value;
  const rootNote = document.getElementById('root-note-dropdown').value;
  const scaleType = document.getElementById('scale-type-dropdown').value;
  
  console.log('📊 UI Values:', { numBars, numVoices, shortestNote, tempo, timeSignature, rootNote, scaleType });
  
  // Generate scale based on user selection
  const scale = generateScale(rootNote, scaleType);
  if (scale.length === 0) {
    console.error('❌ Failed to generate scale');
    return;
  }
  
  const startOctave = Math.floor(Math.random() * 3) + 3; // Random octave between 3-5
  
  // Generate notes for voice 1 (melody)
  const voice1Notes = generateNoteSequence(numBars, timeSignature, scale, startOctave, shortestNote, false);
  
  // Generate notes for voice 2 (bass) if needed
  let voice2Notes = [];
  if (numVoices === 2) {
    voice2Notes = generateNoteSequence(numBars, timeSignature, scale, startOctave - 1, shortestNote, true);
  }
  
  const melody = {
    voice1: voice1Notes,
    voice2: voice2Notes
  };
  
  console.log('🎵 Generated melody:', melody);
  
  // Draw the melody
  drawMelody(melody, timeSignature, numVoices);
  
  // Update musical key display
  document.getElementById('musical-key-display').textContent = `${rootNote} ${scaleType.charAt(0).toUpperCase() + scaleType.slice(1)}`;
} 