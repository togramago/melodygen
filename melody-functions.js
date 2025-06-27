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

function createBar(barDuration, possibleDurations, scale, startOctave, isBassline, currentTime) {
  const barNotes = []; // Notes for this specific bar
  let currentBarDuration = 0;
  let time = currentTime;

  console.log(`🎼 Creating bar: duration=${barDuration}, possibleDurations=${possibleDurations}`);

  // Sort durations from longest to shortest for better filling
  const sortedDurations = [...possibleDurations].sort((a, b) => DURATION_VALUES[b] - DURATION_VALUES[a]);
  console.log(`🎵 Sorted durations: ${sortedDurations}`);

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
      console.log(`⚠️ No duration fits perfectly, using shortest: ${durationStr}`);
    }

    console.log(`🎵 Selected duration: ${durationStr} (value: ${durationVal}), currentBarDuration: ${currentBarDuration}`);

    // Check if this would exceed the bar
    if (currentBarDuration + durationVal > barDuration) {
      // Find a duration that fits exactly
      const remainingDuration = barDuration - currentBarDuration;
      console.log(`🎵 Remaining duration: ${remainingDuration}`);
      
      const fittingDuration = Object.entries(DURATION_VALUES).find(
        ([, val]) => Math.abs(val - remainingDuration) < 0.001
      );
      
      if (fittingDuration) {
        durationStr = fittingDuration[0];
        durationVal = fittingDuration[1];
        console.log(`🎵 Adjusted to fitting duration: ${durationStr} (value: ${durationVal})`);
      } else {
        // If no exact fit, use the largest duration that fits
        const largestFitting = sortedDurations.find(dur => DURATION_VALUES[dur] <= remainingDuration);
        if (largestFitting) {
          durationStr = largestFitting;
          durationVal = DURATION_VALUES[durationStr];
          console.log(`🎵 Using largest fitting duration: ${durationStr} (value: ${durationVal})`);
        } else {
          console.log(`⚠️ Cannot fill remaining duration: ${remainingDuration}, stopping`);
          break;
        }
      }
    }

    const noteIndex = scale[Math.floor(Math.random() * scale.length)];
    const octave = startOctave + (isBassline ? 0 : Math.floor(Math.random() * 2));
    const pitch = NOTES[noteIndex] + octave;

    const note = { time: time, pitch, duration: durationStr };
    barNotes.push(note);
    console.log(`🎵 Added note: ${pitch} with duration ${durationStr}`);
    
    currentBarDuration += durationVal;
    time += durationVal;
    
    // Safety check to prevent infinite loops
    if (barNotes.length > 20) {
      console.log(`⚠️ Too many notes generated (${barNotes.length}), stopping`);
      break;
    }
  }
  
  console.log(`✅ Bar created with ${barNotes.length} notes, total duration: ${currentBarDuration}/${barDuration}:`, barNotes);
  return barNotes;
}

function flattenBarsToNotes(bars) {
  if (!bars || !Array.isArray(bars)) {
    console.log('⚠️ flattenBarsToNotes: Invalid input:', bars);
    return [];
  }
  
  console.log(`📊 flattenBarsToNotes: Processing ${bars.length} bars`);
  const flattenedNotes = bars.flatMap(bar => {
    console.log(`📊 Bar ${bar.barNumber}: ${bar.notes.length} notes`);
    return bar.notes || [];
  });
  
  console.log(`📊 flattenBarsToNotes: Total notes after flattening: ${flattenedNotes.length}`);
  return flattenedNotes;
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
  console.log('🎨 drawMelody called with:', { melody, timeSignature, numVoices });
  console.log('📊 Melody structure:', {
    totalBars: melody.totalBars,
    voice1Bars: melody.voice1.length,
    voice1Notes: melody.voice1.reduce((sum, bar) => sum + bar.notes.length, 0)
  });
  
  // Check if VexFlow is loaded
  if (typeof VexFlow === 'undefined') {
    console.error('❌ VexFlow is not loaded!');
    return;
  }
  
  console.log('✅ VexFlow is loaded:', VexFlow);
  
  const displayDiv = document.getElementById("melody-display");
  console.log('📱 Display div found:', displayDiv);
  
  if (!displayDiv) {
    console.error('❌ Could not find melody-display div!');
    return;
  }
  
  console.log('🧹 Clearing display div...');
  displayDiv.innerHTML = "";
  
  // Calculate responsive dimensions
  const containerWidth = displayDiv.offsetWidth || 800;
  const maxStaveWidth = containerWidth - 40; // Leave some margin
  const staveHeight = 150; // Single voice height
  const staveSpacing = 20; // Space between staves
  
  console.log(`📏 Container width: ${containerWidth}px, max stave width: ${maxStaveWidth}px`);
  
  // Get bars from melody
  const bars = melody.voice1;
  console.log('🎵 Processing bars:', bars);
  
  if (bars.length === 0) {
    console.warn('⚠️ No bars found for voice 1');
    return;
  }
  
  try {
    // Use VexFlow 4.x Factory API
    const factory = new VexFlow.Factory({
      renderer: { elementId: 'melody-display', width: containerWidth, height: 600 }
    });
    
    console.log('✅ VexFlow Factory created:', factory);
    
    // Process bars one by one
    let currentStaveY = 20;
    let currentStaveX = 10;
    let staveIndex = 0;
    let currentStave = null;
    let currentStaveWidth = 0;
    const clefAndTimeWidth = 80; // Approximate width for clef and time signature
    
    for (let barIndex = 0; barIndex < bars.length; barIndex++) {
      const bar = bars[barIndex];
      console.log(`🎼 Processing bar ${barIndex + 1}/${bars.length}:`, bar);
      
      // Convert bar notes to VexFlow 4.x format
      const vexNotes = [];
      for (let i = 0; i < bar.notes.length; i++) {
        const note = bar.notes[i];
        const pitch = note.pitch.slice(0, -1);
        const octave = note.pitch.slice(-1);
        const key = `${pitch}${octave}`;
        
        // Convert duration format to VexFlow format
        const vexDuration = DURATION_TO_VEXFLOW[note.duration] || note.duration;
        
        console.log(`🎵 Creating VexFlow note ${i+1}: pitch=${pitch}, octave=${octave}, key=${key}, duration=${note.duration} -> ${vexDuration}`);
        
        try {
          // Use VexFlow 4.x note creation
          const staveNote = factory.StaveNote({
            keys: [key],
            duration: vexDuration,
          });
          
          if (pitch.includes("#")) {
            staveNote.addModifier(factory.Accidental({ type: "#" }));
          }
          
          vexNotes.push(staveNote);
          console.log(`✅ VexFlow note ${i+1} created successfully`);
        } catch (noteError) {
          console.error(`❌ Failed to create VexFlow note ${i+1} for ${key}:`, noteError);
        }
      }
      
      console.log(`🎼 Bar ${barIndex + 1} has ${vexNotes.length} VexFlow notes`);
      
      if (vexNotes.length === 0) {
        console.warn(`⚠️ Bar ${barIndex + 1} has no valid notes, skipping`);
        continue;
      }
      
      // Create a voice for this bar using VexFlow 4.x API
      const voice = factory.Voice({time: timeSignature});
      voice.addTickables(vexNotes);
      
      // Check if we need a new stave
      if (currentStave === null) {
        // Create new stave using VexFlow 4.x API
        console.log(`🎼 Creating new stave ${staveIndex + 1} at y=${currentStaveY}`);
        currentStave = factory.Stave({
          x: currentStaveX,
          y: currentStaveY,
          width: maxStaveWidth
        });
        
        currentStave.addClef('treble').addTimeSignature(timeSignature);
        console.log('✅ New stave created');
        currentStaveWidth = clefAndTimeWidth; // Start with clef and time signature width
      }
      
      // Try to add this bar to the current stave
      try {
        // Estimate the width needed for this bar
        const barWidth = vexNotes.length * 30; // Rough estimate: 30px per note
        const totalWidthNeeded = currentStaveWidth + barWidth;
        
        console.log(`📏 Current stave width: ${currentStaveWidth}px, bar width: ${barWidth}px, total needed: ${totalWidthNeeded}px, max: ${maxStaveWidth}px`);
        
        if (totalWidthNeeded > maxStaveWidth - 40) {
          // Not enough space, create new stave
          console.log(`📏 Not enough space, creating new stave`);
          
          // Move to next stave
          staveIndex++;
          currentStaveY += staveHeight + staveSpacing;
          currentStaveX = 10;
          
          // Create new stave
          currentStave = factory.Stave({
            x: currentStaveX,
            y: currentStaveY,
            width: maxStaveWidth
          });
          
          currentStave.addClef('treble').addTimeSignature(timeSignature);
          console.log(`✅ New stave ${staveIndex + 1} created`);
          currentStaveWidth = clefAndTimeWidth;
        }
        
        // Add this bar to the current stave using VexFlow 4.x API
        const system = factory.System();
        system.addStave({
          voices: [voice]
        });
        
        console.log(`✅ Bar ${barIndex + 1} added to stave ${staveIndex + 1}`);
        
        // Update current stave width
        currentStaveWidth += barWidth;
        
      } catch (error) {
        console.error(`❌ Error adding bar ${barIndex + 1} to stave:`, error);
        
        // Try to create a new stave and add just this bar
        console.log(`🔄 Trying to create new stave for bar ${barIndex + 1}`);
        
        staveIndex++;
        currentStaveY += staveHeight + staveSpacing;
        currentStaveX = 10;
        
        currentStave = factory.Stave({
          x: currentStaveX,
          y: currentStaveY,
          width: maxStaveWidth
        });
        
        currentStave.addClef('treble').addTimeSignature(timeSignature);
        
        try {
          const system = factory.System();
          system.addStave({
            voices: [voice]
          });
          
          console.log(`✅ Bar ${barIndex + 1} added to new stave ${staveIndex + 1}`);
          currentStaveWidth = clefAndTimeWidth + barWidth;
        } catch (retryError) {
          console.error(`❌ Failed to add bar ${barIndex + 1} even to new stave:`, retryError);
        }
      }
    }
    
    // Draw everything
    factory.draw();
    console.log(`🎉 drawMelody completed successfully. Processed ${bars.length} bars across ${staveIndex + 1} staves`);
    
  } catch (error) {
    console.error('❌ Error drawing melody:', error);
  }
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
  
  const startOctave = 4;
  
  // Generate bars for voice 1 (melody)
  const voice1Bars = generateNoteSequence(numBars, timeSignature, scale, startOctave, shortestNote, false);
  
  const melody = {
    voice1: voice1Bars,
    totalBars: numBars,
    timeSignature: timeSignature,
    tempo: tempo
  };
  
  console.log('🎵 Generated melody:', melody);
  
  // Draw the melody
  drawMelody(melody, timeSignature, 1);
  
  // Update musical key display
  document.getElementById('musical-key-display').textContent = `${rootNote} ${scaleType.charAt(0).toUpperCase() + scaleType.slice(1)}`;
}

// Simple test function to check if VexFlow is working
function testVexFlow() {
  console.log('🧪 Testing VexFlow...');
  
  // Check for VexFlow
  if (typeof Vex === 'undefined') {
    console.error('❌ VexFlow is not loaded!');
    console.log('Available global objects:', Object.keys(window).filter(key => key.includes('vex') || key.includes('Vex')));
    return false;
  }
  
  console.log('✅ VexFlow found (as Vex):', Vex);
  
  const displayDiv = document.getElementById("melody-display");
  if (!displayDiv) {
    console.error('❌ Could not find melody-display div!');
    return false;
  }
  
  try {
    displayDiv.innerHTML = "";
    
    // Calculate responsive dimensions
    const containerWidth = displayDiv.offsetWidth || 800;
    const staveWidth = Math.min(containerWidth - 20, 600); // Test with reasonable width
    const canvasHeight = 150; // Single voice height
    
    console.log(`📏 Test dimensions: container=${containerWidth}px, stave=${staveWidth}px, height=${canvasHeight}px`);
    
    // Use VexFlow 3.x API
    console.log('🎨 Using VexFlow 3.x API...');
    const renderer = new Vex.Flow.Renderer(displayDiv, Vex.Flow.Renderer.Backends.SVG);
    renderer.resize(staveWidth + 20, canvasHeight);
    const context = renderer.getContext();
    
    const stave = new Vex.Flow.Stave(10, 20, staveWidth)
      .addClef("treble")
      .addTimeSignature("4/4");
    stave.setContext(context).draw();
    
    console.log('✅ VexFlow test successful - stave drawn');
    return true;
    
  } catch (error) {
    console.error('❌ VexFlow test failed:', error);
    return false;
  }
} 