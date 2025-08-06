#!/usr/bin/env node

// Simple local server to simulate Vercel API function
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Helper functions (same as in the Vercel function)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

function performSimpleClustering(lean_codes) {
  return lean_codes.map((code, index) => {
    const codeLength = code.length;
    const hasTheorem = code.includes('theorem');
    const hasDef = code.includes('def');
    const hasLemma = code.includes('lemma');
    const hasBy = code.includes('by');
    
    // Simple rule-based clustering
    if (hasTheorem && codeLength > 100) return 0; // Complex theorems
    if (hasTheorem && hasBy) return 1; // Theorems with proofs
    if (hasDef) return 2; // Definitions
    if (hasLemma) return 3; // Lemmas
    return index % 4; // Fallback: distribute evenly
  });
}

function groupByCluster(positions, clusters) {
  const groups = {};
  positions.forEach((pos, i) => {
    const cluster = clusters[i];
    if (!groups[cluster]) groups[cluster] = [];
    groups[cluster].push(pos);
  });
  return groups;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateSimpleSVGVisualization(informal_statement, lean_codes) {
  const width = 800;
  const height = 600;
  const padding = 80;
  
  // Simple hash-based positioning (deterministic but pseudo-random)
  const positions = lean_codes.map((code, index) => {
    const hash1 = simpleHash(code + index);
    const hash2 = simpleHash(code + index + 'y');
    
    return {
      x: padding + (Math.abs(hash1) % (width - 2 * padding)),
      y: padding + (Math.abs(hash2) % (height - 2 * padding)),
      code: code,
      index: index
    };
  });

  // Simple clustering based on code similarity (length and keywords)
  const clusters = performSimpleClustering(lean_codes);
  const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'];

  let svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .title { font: bold 16px sans-serif; }
        .subtitle { font: 12px sans-serif; }
        .code-text { font: 10px monospace; }
        .cluster-label { font: bold 12px sans-serif; }
      </style>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
      
      <!-- Title -->
      <text x="${width/2}" y="30" text-anchor="middle" class="title">Lean Code Formalization Visualization</text>
      <text x="${width/2}" y="50" text-anchor="middle" class="subtitle">Statement: ${escapeHtml(informal_statement.substring(0, 60))}${informal_statement.length > 60 ? '...' : ''}</text>
      
      <!-- Grid lines -->
      <defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e9ecef" stroke-width="0.5"/>
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grid)" opacity="0.3"/>
  `;

  // Draw points and connections
  positions.forEach((pos, i) => {
    const cluster = clusters[i];
    const color = colors[cluster % colors.length];
    
    // Draw point
    svg += `<circle cx="${pos.x}" cy="${pos.y}" r="8" fill="${color}" stroke="#333" stroke-width="1" opacity="0.8"/>`;
    
    // Add code snippet as text (truncated)
    const truncatedCode = pos.code.length > 40 ? pos.code.substring(0, 37) + '...' : pos.code;
    svg += `<text x="${pos.x + 15}" y="${pos.y + 5}" class="code-text" fill="#333">${escapeHtml(truncatedCode)}</text>`;
    
    // Add index label
    svg += `<text x="${pos.x}" y="${pos.y + 3}" text-anchor="middle" class="code-text" fill="white" font-weight="bold">${i + 1}</text>`;
  });

  // Draw cluster connections
  const clusterGroups = groupByCluster(positions, clusters);
  Object.entries(clusterGroups).forEach(([clusterId, points]) => {
    if (points.length > 1) {
      // Draw connections within cluster
      for (let i = 0; i < points.length - 1; i++) {
        for (let j = i + 1; j < points.length; j++) {
          svg += `<line x1="${points[i].x}" y1="${points[i].y}" x2="${points[j].x}" y2="${points[j].y}" 
                       stroke="${colors[clusterId % colors.length]}" stroke-width="1" opacity="0.3" stroke-dasharray="2,2"/>`;
        }
      }
    }
  });

  // Add legend
  const legendY = height - 100;
  svg += `<text x="20" y="${legendY}" class="cluster-label">Clusters:</text>`;
  
  const uniqueClusters = [...new Set(clusters)];
  uniqueClusters.forEach((cluster, i) => {
    const count = clusters.filter(c => c === cluster).length;
    svg += `<circle cx="30" cy="${legendY + 20 + i * 20}" r="6" fill="${colors[cluster % colors.length]}"/>`;
    svg += `<text x="45" y="${legendY + 25 + i * 20}" class="subtitle">Cluster ${cluster + 1} (${count} items)</text>`;
  });

  // Add statistics
  svg += `<text x="${width - 20}" y="${height - 60}" text-anchor="end" class="subtitle">Total Formalizations: ${lean_codes.length}</text>`;
  svg += `<text x="${width - 20}" y="${height - 40}" text-anchor="end" class="subtitle">Clusters: ${uniqueClusters.length}</text>`;
  svg += `<text x="${width - 20}" y="${height - 20}" text-anchor="end" class="subtitle">Generated: ${new Date().toLocaleString()}</text>`;

  svg += '</svg>';
  
  return svg;
}

// API endpoint
app.post('/api/visualize', (req, res) => {
  try {
    const { informal_statement, lean_codes } = req.body;

    if (!informal_statement || !lean_codes || !Array.isArray(lean_codes)) {
      return res.status(400).json({ 
        error: 'Invalid input. Expected informal_statement and lean_codes array.' 
      });
    }

    if (lean_codes.length === 0) {
      return res.status(400).json({ 
        error: 'No Lean codes provided.' 
      });
    }

    // Generate SVG visualization
    const svgVisualization = generateSimpleSVGVisualization(informal_statement, lean_codes);
    
    // Convert SVG to base64
    const svgBase64 = Buffer.from(svgVisualization).toString('base64');
    
    return res.status(200).json({
      plot: svgBase64,
      format: 'svg',
      message: `Generated visualization for ${lean_codes.length} formalizations`
    });

  } catch (error) {
    console.error('Visualization error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate visualization',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📊 Visualization endpoint: http://localhost:${PORT}/api/visualize`);
});
