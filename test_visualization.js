// Test script to validate SVG encoding/decoding without errors
// This can be run in Node.js to test the visualization logic

const { generateFrontendVisualization } = require('./dist/assets/index-BSrtEJ2U.js');

// Test cases that might cause encoding issues
const testCases = [
  {
    informal: "Prove that ∀ x ∈ ℝ, x² ≥ 0",
    leanCodes: [
      "theorem nonneg_square (x : ℝ) : x^2 ≥ 0 := by sorry",
      "lemma square_nonneg (x : ℝ) : 0 ≤ x^2 := by exact sq_nonneg x",
      "def square_is_nonneg : ∀ x : ℝ, x^2 ≥ 0 := fun x => sq_nonneg x"
    ]
  },
  {
    informal: "Simple test with unicode: α + β = γ",
    leanCodes: [
      "theorem test_unicode (α β γ : ℕ) : α + β = γ := by sorry",
      "-- Comment with unicode: ∀∃∈∉⊆⊇∪∩"
    ]
  },
  {
    informal: "Test with special characters: \"quotes\" and 'apostrophes' & <tags>",
    leanCodes: [
      "theorem test_special : True := by trivial",
      "-- \"quoted text\" and <xml> tags & ampersands"
    ]
  }
];

function testEncoding(svgString) {
  try {
    // Test the encoding process
    const encoded = Buffer.from(unescape(encodeURIComponent(svgString))).toString('base64');
    console.log("✅ Encoding successful");
    
    // Test the decoding process
    const decoded = decodeURIComponent(escape(Buffer.from(encoded, 'base64').toString()));
    console.log("✅ Decoding successful");
    
    // Verify they match
    if (decoded === svgString) {
      console.log("✅ Round-trip successful");
      return true;
    } else {
      console.log("❌ Round-trip failed");
      return false;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

console.log("Testing SVG Encoding/Decoding...\n");

testCases.forEach((testCase, index) => {
  console.log(`Test Case ${index + 1}: ${testCase.informal}`);
  
  try {
    const result = generateFrontendVisualization(testCase.informal, testCase.leanCodes);
    console.log(`Generated SVG length: ${result.svg.length} characters`);
    const success = testEncoding(result.svg);
    console.log(`Status: ${success ? '✅ PASS' : '❌ FAIL'}\n`);
  } catch (error) {
    console.log(`❌ Generation Error: ${error.message}\n`);
  }
});
