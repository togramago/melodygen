// Musical constants
const DURATION_VALUES = {
  '1': 4,      // Whole note
  '1/2': 2,    // Half note
  '1/4': 1,    // Quarter note
  '1/8': 0.5,  // Eighth note
  '1/16': 0.25, // Sixteenth note
  '1/32': 0.125 // Thirty-second note
};

// Duration to VexFlow format mapping
const DURATION_TO_VEXFLOW = {
  '1': 'w',      // whole note
  '1/2': 'h',    // half note
  '1/4': 'q',    // quarter note
  '1/8': '8',    // eighth note
  '1/16': '16',  // sixteenth note
  '1/32': '32'   // thirty-second note
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
  
  return scaleNotes;
}

function createBar(barDuration, possibleDurations, scale, startOctave, isBassline, currentTime) {
  const barNotes = []; // Notes for this specific bar
  let currentBarDuration = 0;
  let time = currentTime;

  // Sort durations from longest to shortest for better filling
  const sortedDurations = [...possibleDurations].sort((a, b) => DURATION_VALUES[b] - DURATION_VALUES[a]);

  while (currentBarDuration < barDuration) {
    // Try to find a duration that fits
    let durationStr = null;
    let durationVal = 0;
    
    // First try the longest possible duration that fits
    for (const dur of sortedDurations) {
      const durVal = DURATION_VALUES[dur];
      if (currentBarDuration + durVal <= barDuration) {
        durationStr = dur;
        durationVal = durVal;
        break;
      }
    }
    
    // If no duration fits, try the shortest duration
    if (!durationStr) {
      durationStr = sortedDurations[sortedDurations.length - 1];
      durationVal = DURATION_VALUES[durationStr];
    }

    // Check if this would exceed the bar
    if (currentBarDuration + durationVal > barDuration) {
      // Find a duration that fits exactly
      const remainingDuration = barDuration - currentBarDuration;
      
      const fittingDuration = Object.entries(DURATION_VALUES).find(
        ([, val]) => Math.abs(val - remainingDuration) < 0.001
      );
      
      if (fittingDuration) {
        durationStr = fittingDuration[0];
        durationVal = fittingDuration[1];
      } else {
        // If no exact fit, use the largest duration that fits
        const largestFitting = sortedDurations.find(dur => DURATION_VALUES[dur] <= remainingDuration);
        if (largestFitting) {
          durationStr = largestFitting;
          durationVal = DURATION_VALUES[durationStr];
        } else {
          break;
        }
      }
    }

    const noteIndex = scale[Math.floor(Math.random() * scale.length)];
    const octave = startOctave + (isBassline ? 0 : Math.floor(Math.random() * 2));
    const pitch = NOTES[noteIndex] + octave;

    const note = { time: time, pitch, duration: durationStr };
    barNotes.push(note);
    
    currentBarDuration += durationVal;
    time += durationVal;
    
    // Safety check to prevent infinite loops
    if (barNotes.length > 20) {
      break;
    }
  }
  
  return barNotes;
}

function flattenBarsToNotes(bars) {
  const allNotes = [];
  
  for (const bar of bars) {
    for (const note of bar) {
      allNotes.push(note);
    }
  }
  
  return allNotes;
}

function generateNoteSequence(
  numBars,
  timeSignature,
  scale,
  startOctave,
  shortestNote,
  isBassline = false,
) {
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
  const bars = []; // Array to hold bars
  let currentTime = 0;

  console.log('📊 Calculated values:', { beatsPerBar, beatUnit, barDuration });
  console.log('📊 Bar duration in whole notes:', barDuration);
  console.log('📊 Bar duration check - 4/4 should be 4, 3/4 should be 3, 2/4 should be 2');

  // Test createBar function with simple inputs
  console.log('🧪 Testing createBar function...');
  const testBar = createBar(4, ['1/4', '1/2'], scale, 4, false, 0);
  console.log('🧪 Test bar result:', testBar);
  console.log('🧪 Test bar duration:', testBar.reduce((sum, note) => sum + DURATION_VALUES[note.duration], 0));

  const possibleDurations = Object.keys(DURATION_VALUES).filter(
    (d) => DURATION_VALUES[d] <= DURATION_VALUES[shortestNote],
  );

  console.log('⏱️ Possible durations:', possibleDurations);
  console.log('⏱️ Shortest note setting:', shortestNote);
  console.log('⏱️ Shortest note value:', DURATION_VALUES[shortestNote]);
  
  // Check if we have enough possible durations
  if (possibleDurations.length === 0) {
    console.error('❌ No possible durations found! This will cause empty bars.');
    return [];
  }
  
  if (possibleDurations.length === 1) {
    console.warn('⚠️ Only one possible duration available:', possibleDurations[0]);
  }

  for (let i = 0; i < numBars; i++) {
    console.log(`🎼 Generating bar ${i + 1}/${numBars}`);
    const barNotes = createBar(barDuration, possibleDurations, scale, startOctave, isBassline, currentTime);
    
    // Verify the bar was filled properly
    const totalBarDuration = barNotes.reduce((sum, note) => sum + DURATION_VALUES[note.duration], 0);
    console.log(`📊 Bar ${i + 1} duration check: ${totalBarDuration}/${barDuration} (${Math.round(totalBarDuration/barDuration*100)}%)`);
    console.log(`📊 Bar ${i + 1} notes:`, barNotes);
    
    if (barNotes.length === 0) {
      console.warn(`⚠️ Bar ${i + 1} has no notes!`);
    } else if (barNotes.length < 2) {
      console.warn(`⚠️ Bar ${i + 1} has only ${barNotes.length} note(s)`);
    }
    
    // Add this bar to the bars array
    bars.push({
      barNumber: i + 1,
      notes: barNotes,
      duration: barDuration,
      timeSignature: timeSignature
    });
    
    currentTime += barDuration;
  }
  
  console.log('✅ Generated bars:', bars);
  console.log('📊 Total notes across all bars:', bars.reduce((sum, bar) => sum + bar.notes.length, 0));
  console.log('📊 Number of bars generated:', bars.length);
  console.log('📊 Expected number of bars:', numBars);
  
  if (bars.length !== numBars) {
    console.error(`❌ Expected ${numBars} bars but generated ${bars.length} bars!`);
  }
  
  return bars;
}

function drawMelody(melody, timeSignature, numVoices) {
  if (!melody || !melody.bars) {
    console.error('❌ Invalid melody object for drawing');
    return;
  }
  
  const display = document.getElementById('melody-display');
  display.innerHTML = '';
  
  // Check if VexFlow is available
  if (typeof Vex === 'undefined') {
    console.error('❌ VexFlow not loaded');
    display.innerHTML = '<p>Error: VexFlow not loaded</p>';
    return;
  }
  
  try {
    // Create renderer
    const renderer = new Vex.Flow.Renderer(display, Vex.Flow.Renderer.Backends.SVG);
    renderer.resize(800, 200);
    const context = renderer.getContext();
    context.scale(0.8, 0.8);
    
    // Parse time signature
    const [beatsPerBar, beatValue] = timeSignature.split('/').map(Number);
    
    // Flatten bars to notes
    const allNotes = flattenBarsToNotes(melody.bars);
    
    // Create staves and add notes
    let currentX = 10;
    let currentY = 10;
    const staveWidth = 150;
    const staveHeight = 100;
    let notesPerStave = 8;
    let staveIndex = 0;
    
    while (allNotes.length > 0) {
      // Create stave
      const stave = new Vex.Flow.Stave(currentX, currentY, staveWidth);
      stave.addClef('treble').addTimeSignature(timeSignature);
      stave.setContext(context).draw();
      
      // Take notes for this stave
      const staveNotes = allNotes.splice(0, notesPerStave);
      
      // Create notes
      const notes = staveNotes.map(note => {
        const noteKey = note.pitch.replace('#', '/');
        return new Vex.Flow.StaveNote({
          clef: 'treble',
          keys: [noteKey],
          duration: note.duration
        });
      });
      
      // Create voice and add notes
      const voice = new Vex.Flow.Voice({ time: { num_beats: beatsPerBar, beat_value: beatValue } });
      voice.addTickables(notes);
      
      // Format and draw
      new Vex.Flow.Formatter().joinVoices([voice]).format([voice], staveWidth - 20);
      voice.draw(context, stave);
      
      // Add bar line
      const barNote = new Vex.Flow.BarNote();
      barNote.setContext(context);
      barNote.draw();
      
      // Move to next stave
      currentX += staveWidth + 10;
      if (currentX + staveWidth > 750) {
        currentX = 10;
        currentY += staveHeight + 20;
      }
      
      staveIndex++;
    }
    
  } catch (error) {
    console.error('❌ Error drawing melody:', error);
    display.innerHTML = `<p>Error drawing melody: ${error.message}</p>`;
  }
}

function generateMelodyFromParams(bars, voices, instrument, shortestNote, timeSignature, rootNote, scaleType, syncopated, tempo) {
  // Parse time signature
  const [beatsPerBar, beatValue] = timeSignature.split('/').map(Number);
  const barDuration = beatsPerBar / beatValue * 4; // Convert to quarter note units
  
  // Generate scale
  const scale = generateScale(rootNote, scaleType);
  if (scale.length === 0) {
    console.error('❌ Failed to generate scale');
    return null;
  }
  
  // Determine possible note durations based on shortest note
  const shortestIndex = DURATION_STRINGS.indexOf(shortestNote);
  const possibleDurations = DURATION_STRINGS.slice(shortestIndex);
  
  // Generate bars
  const melodyBars = [];
  let currentTime = 0;
  
  for (let i = 0; i < bars; i++) {
    const barNotes = createBar(barDuration, possibleDurations, scale, 4, false, currentTime);
    melodyBars.push(barNotes);
    currentTime += barDuration;
  }
  
  // Create melody object
  const melody = {
    bars: melodyBars,
    instrument,
    tempo,
    timeSignature,
    rootNote,
    scaleType,
    syncopated
  };
  
  return melody;
}

// Simple test function to check if VexFlow is working
function testVexFlow() {
  const display = document.getElementById('melody-display');
  display.innerHTML = '';
  
  if (typeof Vex === 'undefined') {
    console.error('❌ VexFlow not loaded');
    display.innerHTML = '<p>Error: VexFlow not loaded</p>';
    return;
  }
  
  try {
    const renderer = new Vex.Flow.Renderer(display, Vex.Flow.Renderer.Backends.SVG);
    renderer.resize(400, 150);
    const context = renderer.getContext();
    
    const stave = new Vex.Flow.Stave(10, 10, 300);
    stave.addClef('treble').addTimeSignature('4/4');
    stave.setContext(context).draw();
    
    const notes = [
      new Vex.Flow.StaveNote({ clef: 'treble', keys: ['c/4'], duration: 'q' }),
      new Vex.Flow.StaveNote({ clef: 'treble', keys: ['d/4'], duration: 'q' }),
      new Vex.Flow.StaveNote({ clef: 'treble', keys: ['e/4'], duration: 'q' }),
      new Vex.Flow.StaveNote({ clef: 'treble', keys: ['f/4'], duration: 'q' })
    ];
    
    const voice = new Vex.Flow.Voice({ time: { num_beats: 4, beat_value: 4 } });
    voice.addTickables(notes);
    
    new Vex.Flow.Formatter().joinVoices([voice]).format([voice], 250);
    voice.draw(context, stave);
    
    console.log('✅ VexFlow test completed successfully');
    
  } catch (error) {
    console.error('❌ VexFlow test failed:', error);
    display.innerHTML = `<p>VexFlow test failed: ${error.message}</p>`;
  }
}

// Function to generate melody from UI controls
function generateMelody() {
  // Get values from UI controls
  const numBars = parseInt(document.getElementById('bars-slider').value);
  const numVoices = parseInt(document.getElementById('voices-selector').value);
  const instrument = document.getElementById('instrument-dropdown').value;
  const shortestNote = document.getElementById('shortest-note-dropdown').value;
  const tempo = parseInt(document.getElementById('tempo-slider').value);
  const timeSignature = document.getElementById('time-signature-dropdown').value;
  const rootNote = document.getElementById('root-note-dropdown').value;
  const scaleType = document.getElementById('scale-type-dropdown').value;
  const syncopated = document.getElementById('syncopated-rhythm-toggle').checked;
  
  // Generate melody
  const melody = generateMelodyFromParams(numBars, numVoices, instrument, shortestNote, timeSignature, rootNote, scaleType, syncopated, tempo);
  
  if (melody) {
    // Draw the melody
    drawMelody(melody, timeSignature, numVoices);
    
    // Update musical key display
    document.getElementById('musical-key-display').textContent = `${rootNote} ${scaleType.charAt(0).toUpperCase() + scaleType.slice(1)}`;
  }
} 