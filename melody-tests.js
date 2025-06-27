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
  
  test('6/8 time signature parsing', () => {
    const timeSig = TIME_SIGNATURES['6/8'];
    return timeSig.beatsPerBar === 6 && timeSig.beatUnit === 8;
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
  
  // Test results
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above.');
  }
  
  return passedTests === totalTests;
} 