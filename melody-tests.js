// Test suite for melody generation functions
function runTests() {
  console.log('🧪 Starting test suite...');
  
  let passedTests = 0;
  let totalTests = 0;
  
  function test(description, testFunction) {
    totalTests++;
    try {
      const result = testFunction();
      if (result) {
        console.log(`✅ PASS: ${description}`);
        passedTests++;
      } else {
        console.log(`❌ FAIL: ${description}`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${description} - ${error.message}`);
    }
  }
  
  // Test 1: Scale generation
  test('Generate C Major scale', () => {
    const scale = generateScale('C', 'major');
    return JSON.stringify(scale) === JSON.stringify([0, 2, 4, 5, 7, 9, 11]);
  });
  
  test('Generate F Minor scale', () => {
    const scale = generateScale('F', 'minor');
    return JSON.stringify(scale) === JSON.stringify([5, 7, 8, 10, 0, 1, 3]);
  });
  
  test('Generate G Pentatonic scale', () => {
    const scale = generateScale('G', 'pentatonic');
    return JSON.stringify(scale) === JSON.stringify([7, 9, 11, 2, 4]);
  });
  
  test('Invalid root note returns empty array', () => {
    const scale = generateScale('X', 'major');
    return scale.length === 0;
  });
  
  test('Invalid scale type returns empty array', () => {
    const scale = generateScale('C', 'invalid');
    return scale.length === 0;
  });
  
  // Test 2: Time signature parsing
  test('4/4 time signature parsing', () => {
    const timeSig = TIME_SIGNATURES['4/4'];
    return timeSig.beatsPerBar === 4 && timeSig.beatUnit === 4;
  });
  
  test('3/4 time signature parsing', () => {
    const timeSig = TIME_SIGNATURES['3/4'];
    return timeSig.beatsPerBar === 3 && timeSig.beatUnit === 4;
  });
  
  // Test 3: Note sequence generation
  test('Generate 1 bar melody in 4/4', () => {
    const scale = [0, 2, 4, 5, 7, 9, 11]; // C major
    const notes = generateNoteSequence(1, '4/4', scale, 4, '1/4', false);
    return notes.length > 0 && notes.every(note => note.time >= 0);
  });
  
  test('Generate 2 bar melody in 3/4', () => {
    const scale = [0, 2, 4, 5, 7, 9, 11]; // C major
    const notes = generateNoteSequence(2, '3/4', scale, 4, '1/8', false);
    return notes.length > 0 && notes.every(note => note.time >= 0);
  });
  
  test('Invalid time signature returns empty array', () => {
    const scale = [0, 2, 4, 5, 7, 9, 11];
    const notes = generateNoteSequence(1, 'invalid', scale, 4, '1/4', false);
    return notes.length === 0;
  });
  
  // Test 4: Duration values
  test('Duration values are correct', () => {
    return DURATION_VALUES['1'] === 4 &&
           DURATION_VALUES['1/2'] === 2 &&
           DURATION_VALUES['1/4'] === 1 &&
           DURATION_VALUES['1/8'] === 0.5;
  });
  
  // Test 5: Notes array
  test('Notes array contains all chromatic notes', () => {
    return NOTES.length === 12 &&
           NOTES[0] === 'C' &&
           NOTES[11] === 'B';
  });
  
  // Test 6: Scale patterns
  test('Major scale pattern is correct', () => {
    return JSON.stringify(SCALE_PATTERNS.major) === JSON.stringify([0, 2, 4, 5, 7, 9, 11]);
  });
  
  test('Minor scale pattern is correct', () => {
    return JSON.stringify(SCALE_PATTERNS.minor) === JSON.stringify([0, 2, 3, 5, 7, 8, 10]);
  });
  
  test('Pentatonic scale pattern is correct', () => {
    return JSON.stringify(SCALE_PATTERNS.pentatonic) === JSON.stringify([0, 2, 4, 7, 9]);
  });
  
  // Test 7: UI element existence
  test('All UI elements exist', () => {
    return document.getElementById('bars-slider') &&
           document.getElementById('voices-selector') &&
           document.getElementById('time-signature-dropdown') &&
           document.getElementById('root-note-dropdown') &&
           document.getElementById('scale-type-dropdown');
  });
  
  // Test 8: Melody generation integration
  test('Full melody generation works', () => {
    // Mock UI values
    document.getElementById('bars-slider').value = '2';
    document.getElementById('voices-selector').value = '1';
    document.getElementById('time-signature-dropdown').value = '4/4';
    document.getElementById('root-note-dropdown').value = 'C';
    document.getElementById('scale-type-dropdown').value = 'major';
    
    try {
      generateMelody();
      return true; // If no error, test passes
    } catch (error) {
      return false;
    }
  });
  
  // Test 9: Bar flattening function
  test('Flatten bars to notes with valid bars', () => {
    const mockBars = [
      {
        barNumber: 1,
        notes: [{time: 0, pitch: "C4", duration: "1/4"}, {time: 1, pitch: "D4", duration: "1/4"}],
        duration: 4,
        timeSignature: "4/4"
      },
      {
        barNumber: 2,
        notes: [{time: 4, pitch: "E4", duration: "1/4"}, {time: 5, pitch: "F4", duration: "1/4"}],
        duration: 4,
        timeSignature: "4/4"
      }
    ];
    
    const flattenedNotes = flattenBarsToNotes(mockBars);
    return flattenedNotes.length === 4 && 
           flattenedNotes[0].pitch === "C4" &&
           flattenedNotes[3].pitch === "F4";
  });

  test('Flatten bars to notes with empty array', () => {
    const flattenedNotes = flattenBarsToNotes([]);
    return flattenedNotes.length === 0;
  });

  test('Flatten bars to notes with null input', () => {
    const flattenedNotes = flattenBarsToNotes(null);
    return flattenedNotes.length === 0;
  });

  test('Flatten bars to notes with empty bars', () => {
    const mockBars = [
      {
        barNumber: 1,
        notes: [],
        duration: 4,
        timeSignature: "4/4"
      }
    ];
    
    const flattenedNotes = flattenBarsToNotes(mockBars);
    return flattenedNotes.length === 0;
  });

  test('Flatten bars to notes preserves note structure', () => {
    const mockBars = [
      {
        barNumber: 1,
        notes: [{time: 0, pitch: "C4", duration: "1/4"}],
        duration: 4,
        timeSignature: "4/4"
      }
    ];
    
    const flattenedNotes = flattenBarsToNotes(mockBars);
    return flattenedNotes.length === 1 &&
           flattenedNotes[0].time === 0 &&
           flattenedNotes[0].pitch === "C4" &&
           flattenedNotes[0].duration === "1/4";
  });
  
  // Test 10: Create bar function tests
  test('4/4 bar duration never exceeds 4 whole notes', () => {
    const scale = [0, 2, 4, 5, 7, 9, 11]; // C major
    const possibleDurations = ['1/4', '1/2', '1'];
    const barDuration = 4; // 4/4 time signature
    
    // Test multiple times to ensure consistency
    for (let i = 0; i < 10; i++) {
      const barNotes = createBar(barDuration, possibleDurations, scale, 4, false, 0);
      const totalDuration = barNotes.reduce((sum, note) => sum + DURATION_VALUES[note.duration], 0);
      
      if (totalDuration > 4) {
        console.log('❌ Bar duration exceeded 4:', totalDuration, barNotes);
        return false;
      }
    }
    return true;
  });

  test('3/4 bar duration never exceeds 3 whole notes', () => {
    const scale = [0, 2, 4, 5, 7, 9, 11]; // C major
    const possibleDurations = ['1/4', '1/2', '1'];
    const barDuration = 3; // 3/4 time signature
    
    // Test multiple times to ensure consistency
    for (let i = 0; i < 10; i++) {
      const barNotes = createBar(barDuration, possibleDurations, scale, 4, false, 0);
      const totalDuration = barNotes.reduce((sum, note) => sum + DURATION_VALUES[note.duration], 0);
      
      if (totalDuration > 3) {
        console.log('❌ Bar duration exceeded 3:', totalDuration, barNotes);
        return false;
      }
    }
    return true;
  });

  test('2/4 bar duration never exceeds 2 whole notes', () => {
    const scale = [0, 2, 4, 5, 7, 9, 11]; // C major
    const possibleDurations = ['1/4', '1/2', '1'];
    const barDuration = 2; // 2/4 time signature
    
    // Test multiple times to ensure consistency
    for (let i = 0; i < 10; i++) {
      const barNotes = createBar(barDuration, possibleDurations, scale, 4, false, 0);
      const totalDuration = barNotes.reduce((sum, note) => sum + DURATION_VALUES[note.duration], 0);
      
      if (totalDuration > 2) {
        console.log('❌ Bar duration exceeded 2:', totalDuration, barNotes);
        return false;
      }
    }
    return true;
  });

  test('4/4 bar with shortest note 1 has exactly one note', () => {
    const scale = [0, 2, 4, 5, 7, 9, 11]; // C major
    const possibleDurations = ['1']; // Only whole notes
    const barDuration = 4; // 4/4 time signature
    
    const barNotes = createBar(barDuration, possibleDurations, scale, 4, false, 0);
    return barNotes.length === 1 && barNotes[0].duration === '1';
  });

  test('3/4 bar with shortest note 1 should have error (impossible to fill)', () => {
    const scale = [0, 2, 4, 5, 7, 9, 11]; // C major
    const possibleDurations = ['1']; // Only whole notes
    const barDuration = 3; // 3/4 time signature
    
    const barNotes = createBar(barDuration, possibleDurations, scale, 4, false, 0);
    // Should return empty array or incomplete bar since 3/4 can't be filled with whole notes
    return barNotes.length === 0 || barNotes.length === 1;
  });

  test('2/4 bar with shortest note 1 should have error (impossible to fill)', () => {
    const scale = [0, 2, 4, 5, 7, 9, 11]; // C major
    const possibleDurations = ['1']; // Only whole notes
    const barDuration = 2; // 2/4 time signature
    
    const barNotes = createBar(barDuration, possibleDurations, scale, 4, false, 0);
    // Should return empty array or incomplete bar since 2/4 can't be filled with whole notes
    return barNotes.length === 0 || barNotes.length === 1;
  });

  test('2/4 bar with shortest note 1/2 has exactly one note of 1/2', () => {
    const scale = [0, 2, 4, 5, 7, 9, 11]; // C major
    const possibleDurations = ['1/2']; // Only half notes
    const barDuration = 2; // 2/4 time signature
    
    const barNotes = createBar(barDuration, possibleDurations, scale, 4, false, 0);
    return barNotes.length === 1 && barNotes[0].duration === '1/2';
  });
  
  // Test 11: Comprehensive bar duration tests for all time signatures
  test('4/4 time signature bar durations are correct (20 runs)', () => {
    const scale = [0, 2, 4, 5, 7, 9, 11]; // C major
    const possibleDurations = ['1/4', '1/2', '1/8', '1/16'];
    const barDuration = 4; // 4/4 time signature
    const targetDuration = 4;
    
    console.log('🧪 Testing 4/4 time signature bar durations...');
    
    for (let run = 1; run <= 20; run++) {
      const barNotes = createBar(barDuration, possibleDurations, scale, 4, false, 0);
      const totalDuration = barNotes.reduce((sum, note) => sum + DURATION_VALUES[note.duration], 0);
      
      // Check if duration is within acceptable range (99-101% of target)
      const percentage = (totalDuration / targetDuration) * 100;
      if (percentage < 99 || percentage > 101) {
        console.log(`❌ Run ${run}: Duration ${totalDuration}/${targetDuration} (${percentage.toFixed(1)}%)`);
        console.log(`   Notes:`, barNotes);
        return false;
      }
      
      if (run % 5 === 0) {
        console.log(`✅ Run ${run}: Duration ${totalDuration}/${targetDuration} (${percentage.toFixed(1)}%)`);
      }
    }
    
    console.log('✅ All 20 runs of 4/4 passed!');
    return true;
  });

  test('3/4 time signature bar durations are correct (20 runs)', () => {
    const scale = [0, 2, 4, 5, 7, 9, 11]; // C major
    const possibleDurations = ['1/4', '1/2', '1/8', '1/16'];
    const barDuration = 3; // 3/4 time signature
    const targetDuration = 3;
    
    console.log('🧪 Testing 3/4 time signature bar durations...');
    
    for (let run = 1; run <= 20; run++) {
      const barNotes = createBar(barDuration, possibleDurations, scale, 4, false, 0);
      const totalDuration = barNotes.reduce((sum, note) => sum + DURATION_VALUES[note.duration], 0);
      
      // Check if duration is within acceptable range (99-101% of target)
      const percentage = (totalDuration / targetDuration) * 100;
      if (percentage < 99 || percentage > 101) {
        console.log(`❌ Run ${run}: Duration ${totalDuration}/${targetDuration} (${percentage.toFixed(1)}%)`);
        console.log(`   Notes:`, barNotes);
        return false;
      }
      
      if (run % 5 === 0) {
        console.log(`✅ Run ${run}: Duration ${totalDuration}/${targetDuration} (${percentage.toFixed(1)}%)`);
      }
    }
    
    console.log('✅ All 20 runs of 3/4 passed!');
    return true;
  });

  test('2/4 time signature bar durations are correct (20 runs)', () => {
    const scale = [0, 2, 4, 5, 7, 9, 11]; // C major
    const possibleDurations = ['1/4', '1/2', '1/8', '1/16'];
    const barDuration = 2; // 2/4 time signature
    const targetDuration = 2;
    
    console.log('🧪 Testing 2/4 time signature bar durations...');
    
    for (let run = 1; run <= 20; run++) {
      const barNotes = createBar(barDuration, possibleDurations, scale, 4, false, 0);
      const totalDuration = barNotes.reduce((sum, note) => sum + DURATION_VALUES[note.duration], 0);
      
      // Check if duration is within acceptable range (99-101% of target)
      const percentage = (totalDuration / targetDuration) * 100;
      if (percentage < 99 || percentage > 101) {
        console.log(`❌ Run ${run}: Duration ${totalDuration}/${targetDuration} (${percentage.toFixed(1)}%)`);
        console.log(`   Notes:`, barNotes);
        return false;
      }
      
      if (run % 5 === 0) {
        console.log(`✅ Run ${run}: Duration ${totalDuration}/${targetDuration} (${percentage.toFixed(1)}%)`);
      }
    }
    
    console.log('✅ All 20 runs of 2/4 passed!');
    return true;
  });

  // Test 12: Full melody generation duration tests
  test('Full melody generation maintains correct bar durations', () => {
    const timeSignatures = ['4/4', '3/4', '2/4'];
    const scale = [0, 2, 4, 5, 7, 9, 11]; // C major
    
    console.log('🧪 Testing full melody generation with different time signatures...');
    
    for (const timeSignature of timeSignatures) {
      console.log(`🎼 Testing ${timeSignature}...`);
      
      // Generate a 2-bar melody
      const bars = generateNoteSequence(2, timeSignature, scale, 4, '1/8', false);
      
      if (bars.length !== 2) {
        console.log(`❌ ${timeSignature}: Expected 2 bars, got ${bars.length}`);
        return false;
      }
      
      // Check each bar
      for (let i = 0; i < bars.length; i++) {
        const bar = bars[i];
        const totalDuration = bar.notes.reduce((sum, note) => sum + DURATION_VALUES[note.duration], 0);
        const expectedDuration = TIME_SIGNATURES[timeSignature].beatsPerBar;
        
        const percentage = (totalDuration / expectedDuration) * 100;
        if (percentage < 99 || percentage > 101) {
          console.log(`❌ ${timeSignature} Bar ${i+1}: Duration ${totalDuration}/${expectedDuration} (${percentage.toFixed(1)}%)`);
          console.log(`   Notes:`, bar.notes);
          return false;
        }
        
        console.log(`✅ ${timeSignature} Bar ${i+1}: Duration ${totalDuration}/${expectedDuration} (${percentage.toFixed(1)}%)`);
      }
    }
    
    console.log('✅ All time signatures passed!');
    return true;
  });
  
  // Test results
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above.');
  }
  
  return passedTests === totalTests;
} 