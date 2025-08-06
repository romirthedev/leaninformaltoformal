// Frontend-only visualization utilities
// Generates simple SVG visualizations without backend dependencies

export interface VisualizationData {
  svg: string;
  message: string;
}

// Simple hash function for deterministic positioning
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

// Rule-based clustering without ML dependencies
function performSimpleClustering(leanCodes: string[]): number[] {
  return leanCodes.map((code, index) => {
    const codeLength = code.length;
    const hasTheorem = code.includes('theorem');
    const hasDef = code.includes('def');
    const hasLemma = code.includes('lemma');
    const hasBy = code.includes('by');
    const hasSorry = code.includes('sorry');
    const hasProof = code.includes(':=') && !hasSorry;
    
    // Enhanced rule-based clustering
    if (hasTheorem && hasProof && codeLength > 100) return 0; // Complex proven theorems
    if (hasTheorem && hasBy && !hasSorry) return 1; // Theorems with tactics
    if (hasTheorem && hasSorry) return 2; // Theorem stubs
    if (hasLemma) return 3; // Lemmas
    if (hasDef) return 4; // Definitions
    return index % 5; // Fallback: distribute evenly
  });
}

function groupByCluster(positions: Array<{x: number, y: number, code: string, index: number}>, clusters: number[]) {
  const groups: Record<number, typeof positions> = {};
  positions.forEach((pos, i) => {
    const cluster = clusters[i];
    if (!groups[cluster]) groups[cluster] = [];
    groups[cluster].push(pos);
  });
  return groups;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getClusterInfo(clusterNum: number): { name: string, color: string, description: string } {
  const clusterTypes = [
    { name: "Complex Proofs", color: "#1f77b4", description: "Proven theorems with complex logic" },
    { name: "Tactic Proofs", color: "#ff7f0e", description: "Theorems using proof tactics" },
    { name: "Theorem Stubs", color: "#2ca02c", description: "Theorem statements with sorry" },
    { name: "Lemmas", color: "#d62728", description: "Supporting lemmas" },
    { name: "Definitions", color: "#9467bd", description: "Type and function definitions" },
    { name: "Mixed", color: "#8c564b", description: "Mixed formalization approaches" }
  ];
  
  return clusterTypes[clusterNum] || clusterTypes[5];
}

export function generateFrontendVisualization(
  informalStatement: string,
  leanCodes: string[]
): VisualizationData {
  const width = 900;
  const height = 700;
  const padding = 80;
  
  if (!leanCodes || leanCodes.length === 0) {
    return {
      svg: `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="#f8f9fa"/>
        <text x="${width/2}" y="${height/2}" text-anchor="middle" font-size="16" fill="#666">
          No Lean code to visualize
        </text>
      </svg>`,
      message: "No formalizations provided"
    };
  }

  // Generate deterministic but varied positions
  const positions = leanCodes.map((code, index) => {
    const hash1 = simpleHash(code + index + informalStatement);
    const hash2 = simpleHash(code + index + informalStatement + 'y');
    
    return {
      x: padding + (Math.abs(hash1) % (width - 2 * padding)),
      y: padding + (Math.abs(hash2) % (height - 2 * padding)),
      code: code,
      index: index
    };
  });

  // Perform clustering
  const clusters = performSimpleClustering(leanCodes);
  const uniqueClusters = [...new Set(clusters)];

  let svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .title { font: bold 18px sans-serif; fill: #2c3e50; }
        .subtitle { font: 14px sans-serif; fill: #34495e; }
        .code-text { font: 11px monospace; fill: #2c3e50; }
        .cluster-label { font: bold 13px sans-serif; fill: #2c3e50; }
        .legend-text { font: 12px sans-serif; fill: #2c3e50; }
        .stats-text { font: 11px sans-serif; fill: #7f8c8d; }
      </style>
      
      <!-- Background with subtle gradient -->
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e9ecef;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#00000020"/>
        </filter>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bgGradient)" stroke="#dee2e6" stroke-width="2" rx="10"/>
      
      <!-- Title -->
      <text x="${width/2}" y="35" text-anchor="middle" class="title">
        Lean Code Formalization Analysis
      </text>
      <text x="${width/2}" y="58" text-anchor="middle" class="subtitle">
        Statement: ${escapeHtml(informalStatement.substring(0, 70))}${informalStatement.length > 70 ? '...' : ''}
      </text>
  `;

  // Draw cluster connections first (behind points)
  const clusterGroups = groupByCluster(positions, clusters);
  Object.entries(clusterGroups).forEach(([clusterId, points]) => {
    const cluster = parseInt(clusterId);
    const clusterInfo = getClusterInfo(cluster);
    
    if (points.length > 1) {
      // Draw connections within cluster with subtle lines
      for (let i = 0; i < points.length - 1; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const distance = Math.sqrt(
            Math.pow(points[i].x - points[j].x, 2) + 
            Math.pow(points[i].y - points[j].y, 2)
          );
          
          // Only connect nearby points to avoid clutter
          if (distance < 200) {
            svg += `<line x1="${points[i].x}" y1="${points[i].y}" 
                         x2="${points[j].x}" y2="${points[j].y}" 
                         stroke="${clusterInfo.color}" stroke-width="2" 
                         opacity="0.3" stroke-dasharray="5,5"/>`;
          }
        }
      }
    }
  });

  // Draw points and labels
  positions.forEach((pos, i) => {
    const cluster = clusters[i];
    const clusterInfo = getClusterInfo(cluster);
    
    // Draw point with shadow
    svg += `<circle cx="${pos.x}" cy="${pos.y}" r="12" 
                   fill="${clusterInfo.color}" stroke="#fff" stroke-width="3" 
                   opacity="0.9" filter="url(#shadow)"/>`;
    
    // Add formalization number
    svg += `<text x="${pos.x}" y="${pos.y + 5}" text-anchor="middle" 
                 font-family="sans-serif" font-size="12" font-weight="bold" fill="white">
             ${i + 1}
            </text>`;
    
    // Add truncated code snippet with background
    const truncatedCode = pos.code.length > 45 ? pos.code.substring(0, 42) + '...' : pos.code;
    const textX = pos.x + 20;
    const textY = pos.y - 5;
    
    // Background rectangle for text readability
    svg += `<rect x="${textX - 5}" y="${textY - 15}" width="${Math.min(truncatedCode.length * 6.5, 300)}" 
                 height="20" fill="white" opacity="0.8" rx="3" stroke="#ddd"/>`;
    
    svg += `<text x="${textX}" y="${textY}" class="code-text">${escapeHtml(truncatedCode)}</text>`;
  });

  // Add enhanced legend
  const legendStartY = height - 160;
  svg += `<rect x="15" y="${legendStartY - 25}" width="250" height="${uniqueClusters.length * 25 + 40}" 
               fill="white" opacity="0.9" rx="8" stroke="#ddd" stroke-width="1"/>`;
  svg += `<text x="25" y="${legendStartY - 5}" class="cluster-label">Formalization Clusters:</text>`;
  
  uniqueClusters.forEach((cluster, i) => {
    const clusterInfo = getClusterInfo(cluster);
    const count = clusters.filter(c => c === cluster).length;
    const y = legendStartY + 20 + i * 25;
    
    svg += `<circle cx="35" cy="${y}" r="8" fill="${clusterInfo.color}"/>`;
    svg += `<text x="50" y="${y + 5}" class="legend-text">
             ${clusterInfo.name} (${count})
            </text>`;
  });

  // Add statistics panel
  const statsY = height - 80;
  svg += `<rect x="${width - 280}" y="${statsY - 25}" width="260" height="60" 
               fill="white" opacity="0.9" rx="8" stroke="#ddd" stroke-width="1"/>`;
  svg += `<text x="${width - 270}" y="${statsY - 5}" class="cluster-label">Statistics:</text>`;
  svg += `<text x="${width - 270}" y="${statsY + 15}" class="stats-text">
           Total Formalizations: ${leanCodes.length}
          </text>`;
  svg += `<text x="${width - 270}" y="${statsY + 35}" class="stats-text">
           Unique Approaches: ${uniqueClusters.length}
          </text>`;

  // Add timestamp
  svg += `<text x="${width - 15}" y="${height - 15}" text-anchor="end" class="stats-text">
           Generated: ${new Date().toLocaleTimeString()}
          </text>`;

  svg += '</svg>';

  return {
    svg,
    message: `Generated visualization for ${leanCodes.length} formalizations with ${uniqueClusters.length} different approaches`
  };
}
