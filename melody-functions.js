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
  
  const possibleDurations = Object.keys(DURATION_VALUES).filter(
    (d) => DURATION_VALUES[d] <= DURATION_VALUES[shortestNote],
  );
  
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
  if (!melody?.bars?.length) {
    console.error('❌ Invalid melody object for drawing');
    return;
  }
  
  const display = document.getElementById('melody-display');
  display.innerHTML = '';
  
  if (typeof Vex === 'undefined') {
    console.error('❌ VexFlow not loaded');
    display.innerHTML = '<p>Error: VexFlow not loaded</p>';
    return;
  }
  
  try {
    const renderer = new Vex.Flow.Renderer(display, Vex.Flow.Renderer.Backends.SVG);
    const context = renderer.getContext();
    
    const [beatsPerBar, beatValue] = timeSignature.split('/').map(Number);
    const staveWidth = 120; // Reduced individual stave width
    const staveHeight = 100;
    const maxWidth = 800; // Use a reasonable default width
    const barSpacing = 15; // Reduced spacing between bars
    const clefSpace = 60; // Space for clef and time signature
    
    // Calculate total notes across all bars
    const totalNotes = melody.bars.reduce((sum, bar) => sum + bar.length, 0);
    
    // Determine layout based on number of bars and total notes
    let barsPerRow;
    if (melody.bars.length < 4 && totalNotes < 32) {
      barsPerRow = melody.bars.length; // All bars in one stave
    } else if (melody.bars.length === 4) {
      barsPerRow = 2; // 2 bars per stave
    } else if (melody.bars.length === 6) {
      barsPerRow = 3; // 3 bars per stave
    } else if (melody.bars.length === 8) {
      // For 8 bars: if dense notes, use 4 lines of 2 bars; if sparse, use 3 lines of 3,3,2
      const avgNotesPerBar = totalNotes / melody.bars.length;
      if (avgNotesPerBar > 4) {
        barsPerRow = 2; // 4 lines of 2 bars each
      } else {
        barsPerRow = 3; // 3 lines: 3, 3, 2 bars
      }
    } else {
      // Default fallback
      barsPerRow = Math.floor((maxWidth - clefSpace) / (staveWidth + barSpacing));
    }
    
    console.log('📊 Layout info:', { 
      maxWidth, 
      staveWidth, 
      barSpacing, 
      clefSpace, 
      barsPerRow, 
      totalBars: melody.bars.length,
      totalNotes,
      avgNotesPerBar: totalNotes / melody.bars.length
    });
    
    let currentY = 10;
    
    // Process bars in rows
    for (let rowStart = 0; rowStart < melody.bars.length; rowStart += barsPerRow) {
      let barsInRow = Math.min(barsPerRow, melody.bars.length - rowStart);
      
      // Special handling for 8 bars with 3 bars per row: last row should have 2 bars
      if (melody.bars.length === 8 && barsPerRow === 3 && rowStart === 6) {
        barsInRow = 2; // Last row gets 2 bars
      }
      
      const rowWidth = barsInRow * staveWidth + (barsInRow - 1) * barSpacing + clefSpace; // Use consistent spacing
      
      // Center the stave within the available width
      const staveX = (maxWidth - rowWidth) / 2;
      
      // Create main stave for this row with fuchsia background
      const stave = new Vex.Flow.Stave(staveX, currentY, rowWidth);
      stave.addClef('treble').addTimeSignature(timeSignature);
      stave.setContext(context);
      
      // Add fuchsia background
      context.save();
      context.setFillStyle('fuchsia');
      context.setStrokeStyle('fuchsia');
      context.fillRect(staveX - 5, currentY - 5, rowWidth + 10, staveHeight + 10);
      context.restore();
      
      stave.draw();
      
      // Draw each bar in the row
      for (let i = 0; i < barsInRow; i++) {
        const bar = melody.bars[rowStart + i];
        const barX = staveX + (i === 0 ? clefSpace : clefSpace + i * (staveWidth + barSpacing)); // Use consistent spacing
        
        // Create notes for this bar
        const notes = bar.map(note => {
          const noteKey = convertNoteToVexFlow(note.pitch);
          const duration = DURATION_TO_VEXFLOW[note.duration] || 'q';
          return new Vex.Flow.StaveNote({
            clef: 'treble',
            keys: [noteKey],
            duration: duration
          });
        });
        
        // Create voice with notes and bar line
        const voice = new Vex.Flow.Voice({ time: { num_beats: beatsPerBar, beat_value: beatValue } });
        voice.addTickables(notes);
        voice.addTickable(new Vex.Flow.BarNote());
        
        // Draw the bar
        const tempStave = new Vex.Flow.Stave(barX, currentY, staveWidth);
        tempStave.setContext(context);
        
        const formatWidth = i === 0 ? staveWidth - clefSpace : staveWidth - 20;
        new Vex.Flow.Formatter().joinVoices([voice]).format([voice], formatWidth);
        voice.draw(context, tempStave);
      }
      
      currentY += staveHeight + 30; // Increased row spacing
    }
    
  } catch (error) {
    console.error('❌ Error drawing melody:', error);
    display.innerHTML = `<p>Error drawing melody: ${error.message}</p>`;
  }
}

// Helper function to convert note format
function convertNoteToVexFlow(pitch) {
  const match = pitch.match(/^([A-G]#?)(\d+)$/);
  if (match) {
    const noteName = match[1].toLowerCase();
    const octave = match[2];
    return `${noteName}/${octave}`;
  }
  return pitch; // Fallback
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
  const durationStrings = Object.keys(DURATION_VALUES);
  const shortestIndex = durationStrings.indexOf(shortestNote);
  const possibleDurations = durationStrings.slice(shortestIndex);
  
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