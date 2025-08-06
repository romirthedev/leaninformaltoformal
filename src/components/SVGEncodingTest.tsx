import React, { useState } from 'react';
import { generateFrontendVisualization } from '../lib/visualization';

// Simple test component to debug SVG encoding issues
export const SVGEncodingTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const runTest = () => {
    setError('');
    setTestResult('');
    
    try {
      console.log('Starting SVG encoding test...');
      
      // Simple test case
      const informalStatement = "Test statement";
      const leanCodes = ["theorem test : True := by trivial"];
      
      console.log('Generating visualization...');
      const result = generateFrontendVisualization(informalStatement, leanCodes);
      
      console.log('SVG generated, length:', result.svg.length);
      console.log('SVG preview:', result.svg.substring(0, 200) + '...');
      
      // Test encoding
      console.log('Testing encoding...');
      const encoded = btoa(unescape(encodeURIComponent(result.svg)));
      console.log('Encoded successfully, length:', encoded.length);
      
      // Test decoding
      console.log('Testing decoding...');
      const decoded = decodeURIComponent(escape(atob(encoded)));
      console.log('Decoded successfully, length:', decoded.length);
      
      // Verify round-trip
      if (decoded === result.svg) {
        setTestResult('✅ All tests passed! SVG encoding/decoding works correctly.');
      } else {
        setTestResult('⚠️ Round-trip test failed - decoded content differs from original');
      }
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Test failed:', err);
      setError(`❌ Test failed: ${errorMsg}`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', borderRadius: '5px' }}>
      <h3>SVG Encoding Test</h3>
      <button onClick={runTest} style={{ padding: '10px 20px', marginBottom: '10px' }}>
        Run Test
      </button>
      
      {testResult && (
        <div style={{ padding: '10px', backgroundColor: '#e8f5e8', marginBottom: '10px' }}>
          {testResult}
        </div>
      )}
      
      {error && (
        <div style={{ padding: '10px', backgroundColor: '#ffebee', color: 'red' }}>
          {error}
        </div>
      )}
      
      <p style={{ fontSize: '12px', color: '#666' }}>
        This component tests the SVG generation and encoding/decoding process
        to identify any character encoding issues.
      </p>
    </div>
  );
};

export default SVGEncodingTest;
