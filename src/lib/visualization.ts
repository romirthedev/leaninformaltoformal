// Frontend-only visualization utilities
// Replicates Python matplotlib/sklearn visualization with t-SNE and K-means clustering

export interface VisualizationData {
  svg: string;
  message: string;
}

export interface Formalization {
  lean_code: string;
  embedding: number[];
  informal: string;
}

const PERPLEXITY = 30;

// Extract just the statement part from Lean code (before := or by)
function extractStatement(leanCode: string): string {
  if (!leanCode) return "";
  
  // Find the statement part (before := or by)
  const lines = leanCode.split('\n');
  let statement = "";
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('--')) continue; // Skip comments
    
    statement += line + '\n';
    
    // Stop at proof markers
    if (line.includes(':=') || line.includes(' by ') || line.includes('\nby ')) {
      // Include the line with := or by, but clean it up
      statement = statement.replace(/\s*:=.*$/gm, '').replace(/\s*by.*$/gm, '');
      break;
    }
  }
  
  return statement.trim() || leanCode;
}

// Simple K-means implementation
class SimpleKMeans {
  private k: number;
  private maxIterations: number;
  private centroids: number[][];
  private labels: number[];

  constructor(k: number, maxIterations: number = 100) {
    this.k = k;
    this.maxIterations = maxIterations;
    this.centroids = [];
    this.labels = [];
  }

  fit(data: number[][]): { centroids: number[][], labels: number[] } {
    const n = data.length;
    const dims = data[0].length;

    // Initialize centroids randomly
    this.centroids = [];
    for (let i = 0; i < this.k; i++) {
      const centroid = [];
      for (let j = 0; j < dims; j++) {
        // Initialize with random data point values
        const randomIdx = Math.floor(Math.random() * n);
        centroid.push(data[randomIdx][j] + (Math.random() - 0.5) * 0.1);
      }
      this.centroids.push(centroid);
    }

    // K-means iterations
    for (let iter = 0; iter < this.maxIterations; iter++) {
      // Assign points to clusters
      this.labels = data.map(point => this.assignToCluster(point));

      // Update centroids
      const newCentroids = this.updateCentroids(data);
      
      // Check for convergence
      if (this.centroidsEqual(this.centroids, newCentroids)) {
        break;
      }
      
      this.centroids = newCentroids;
    }

    return { centroids: this.centroids, labels: this.labels };
  }

  private assignToCluster(point: number[]): number {
    let minDistance = Infinity;
    let closestCluster = 0;

    for (let i = 0; i < this.k; i++) {
      const distance = this.euclideanDistance(point, this.centroids[i]);
      if (distance < minDistance) {
        minDistance = distance;
        closestCluster = i;
      }
    }

    return closestCluster;
  }

  private updateCentroids(data: number[][]): number[][] {
    const newCentroids: number[][] = [];
    const dims = data[0].length;

    for (let i = 0; i < this.k; i++) {
      const clusterPoints = data.filter((_, idx) => this.labels[idx] === i);
      
      if (clusterPoints.length === 0) {
        // Keep old centroid if no points assigned
        newCentroids.push([...this.centroids[i]]);
      } else {
        const centroid = new Array(dims).fill(0);
        for (const point of clusterPoints) {
          for (let j = 0; j < dims; j++) {
            centroid[j] += point[j];
          }
        }
        for (let j = 0; j < dims; j++) {
          centroid[j] /= clusterPoints.length;
        }
        newCentroids.push(centroid);
      }
    }

    return newCentroids;
  }

  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
  }

  private centroidsEqual(a: number[][], b: number[][]): boolean {
    const threshold = 1e-6;
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < a[i].length; j++) {
        if (Math.abs(a[i][j] - b[i][j]) > threshold) {
          return false;
        }
      }
    }
    return true;
  }
}

// Simple t-SNE implementation for 2D visualization
class SimpleTSNE {
  private perplexity: number;
  private learningRate: number;
  private maxIter: number;

  constructor(perplexity = 30, learningRate = 200, maxIter = 300) {
    this.perplexity = Math.min(perplexity, 30); // Cap perplexity
    this.learningRate = learningRate;
    this.maxIter = maxIter;
  }

  fit(data: number[][]): number[][] {
    const n = data.length;
    if (n < 4) {
      // For very small datasets, use PCA-like projection
      return this.simplePCA(data);
    }

    // Initialize with random positions
    const Y = Array(n).fill(0).map(() => [
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    ]);

    // Simplified t-SNE: just use euclidean distances and basic gradient descent
    for (let iter = 0; iter < Math.min(this.maxIter, 100); iter++) {
      this.updatePositions(data, Y);
    }

    return Y;
  }

  private simplePCA(data: number[][]): number[][] {
    if (data.length === 0) return [];
    
    // Simple 2D projection based on variance
    const dims = data[0].length;
    const result: number[][] = [];
    
    for (let i = 0; i < data.length; i++) {
      const x = data[i].reduce((sum, val, idx) => sum + val * (idx % 2 === 0 ? 1 : -1), 0) / dims;
      const y = data[i].reduce((sum, val, idx) => sum + val * (idx % 3 === 0 ? 1 : -1), 0) / dims;
      result.push([x * 10, y * 10]);
    }
    return result;
  }

  private updatePositions(data: number[][], Y: number[][]): void {
    const n = data.length;
    const grad = Array(n).fill(0).map(() => [0, 0]);

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        // Compute high-dimensional distance
        const hdDist = this.euclideanDistance(data[i], data[j]);
        // Compute low-dimensional distance
        const ldDist = this.euclideanDistance(Y[i], Y[j]);
        
        if (ldDist > 0) {
          const force = (hdDist - ldDist) / ldDist;
          const dx = Y[j][0] - Y[i][0];
          const dy = Y[j][1] - Y[i][1];
          
          grad[i][0] += force * dx * 0.1;
          grad[i][1] += force * dy * 0.1;
          grad[j][0] -= force * dx * 0.1;
          grad[j][1] -= force * dy * 0.1;
        }
      }
    }

    // Update positions
    for (let i = 0; i < n; i++) {
      Y[i][0] += grad[i][0] * this.learningRate * 0.01;
      Y[i][1] += grad[i][1] * this.learningRate * 0.01;
    }
  }

  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
  }
}

// Generate simple embeddings for Lean code (mimicking sentence transformers)
function generateEmbeddings(leanCodes: string[]): number[][] {
  const embeddingDim = 384; // Typical sentence transformer dimension
  
  return leanCodes.map(code => {
    const embedding = new Array(embeddingDim).fill(0);
    
    // Simple feature extraction based on code characteristics
    const codeHash = simpleHash(code);
    const words = code.toLowerCase().split(/\s+/);
    
    for (let i = 0; i < embeddingDim; i++) {
      let value = 0;
      
      // Add features based on code structure
      if (code.includes('theorem')) value += 0.5;
      if (code.includes('lemma')) value += 0.3;
      if (code.includes('def')) value += 0.4;
      if (code.includes('by')) value += 0.2;
      if (code.includes('sorry')) value -= 0.3;
      if (code.includes(':=')) value += 0.1;
      
      // Add word-based features
      words.forEach(word => {
        const wordHash = simpleHash(word + i.toString());
        value += (wordHash % 100) / 1000;
      });
      
      // Add position-based variation
      value += Math.sin(i * 0.1 + codeHash * 0.01) * 0.1;
      value += Math.cos(i * 0.05 + code.length * 0.02) * 0.1;
      
      embedding[i] = value;
    }
    
    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / (norm || 1));
  });
}

function simpleHash(str: string): number {
  let hash = 0;
  if (!str) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

// Calculate cluster centers (closest embeddings to cluster centers)
function clusterCenterIdxs(embeddings: number[][], labels: number[]): number[] {
  const nClusters = Math.max(...labels) + 1;
  const closestEmbeddingIdxs: number[] = [];

  for (let i = 0; i < nClusters; i++) {
    const clusterIndices = labels.map((label, idx) => label === i ? idx : -1).filter(idx => idx !== -1);
    
    if (clusterIndices.length === 0) continue;

    // Calculate cluster center (mean of embeddings in cluster)
    const clusterEmbeddings = clusterIndices.map(idx => embeddings[idx]);
    const clusterCenter = new Array(embeddings[0].length).fill(0);
    
    for (const embedding of clusterEmbeddings) {
      for (let j = 0; j < embedding.length; j++) {
        clusterCenter[j] += embedding[j];
      }
    }
    
    for (let j = 0; j < clusterCenter.length; j++) {
      clusterCenter[j] /= clusterEmbeddings.length;
    }

    // Find embedding closest to cluster center
    let minDistance = Infinity;
    let closestIdx = clusterIndices[0];
    
    for (const idx of clusterIndices) {
      const distance = embeddings[idx].reduce((sum, val, j) => 
        sum + (val - clusterCenter[j]) ** 2, 0);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = idx;
      }
    }
    
    closestEmbeddingIdxs.push(closestIdx);
  }

  return closestEmbeddingIdxs;
}

// Fold title into multiple lines
function foldTitle(title: string, width: number = 30): string {
  if (!title || title.length <= width) return title;
  
  let result = '';
  let rest = title;
  while (rest.length > 0) {
    result += rest.substring(0, width) + '\n';
    rest = rest.substring(width);
  }
  return result.trim();
}

// Extract embeddings from formalizations
function extractEmbeddings(formalizations: Formalization[]): number[][] {
  return formalizations.map(f => f.embedding);
}

// Create formalizations with embeddings
function createFormalizationsWithEmbeddings(informalStatement: string, leanCodes: string[]): Formalization[] {
  const embeddings = generateEmbeddings(leanCodes);
  
  return leanCodes.map((leanCode, i) => ({
    lean_code: leanCode,
    embedding: embeddings[i],
    informal: informalStatement
  }));
}

// Safe HTML escaping
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '');
}

// Main visualization function that replicates the Python implementation
export function generateFrontendVisualization(
  informalStatement: string,
  leanCodes: string[]
): VisualizationData {
  const width = 700;
  const height = 400;
  const padding = 50;

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

  // Handle case with too few data points
  if (leanCodes.length < 4) {
    return {
      svg: `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="#f8f9fa"/>
        <text x="${width/2}" y="${height/2}" text-anchor="middle" font-size="16" fill="#666">
          Need at least 4 formalizations for clustering analysis (Currently: ${leanCodes.length})
        </text>
      </svg>`,
      message: `Need at least 4 formalizations for clustering analysis (Currently: ${leanCodes.length})`
    };
  }

  // Create formalizations with embeddings
  const formalizations = createFormalizationsWithEmbeddings(informalStatement, leanCodes);
  const embeddings = extractEmbeddings(formalizations);

  // 2-cluster analysis using SimpleKMeans
  const kmeans2 = new SimpleKMeans(2);
  const kmeans2Result = kmeans2.fit(embeddings);
  const labels2Cluster = kmeans2Result.labels;
  const cluster2CenterIdxs = clusterCenterIdxs(embeddings, labels2Cluster);

  // 4-cluster analysis using SimpleKMeans  
  const kmeans4 = new SimpleKMeans(Math.min(4, embeddings.length));
  const kmeans4Result = kmeans4.fit(embeddings);
  const labels4Cluster = kmeans4Result.labels;
  const cluster4CenterIdxs = clusterCenterIdxs(embeddings, labels4Cluster);

  // t-SNE transformation
  const perplexity = Math.min(PERPLEXITY, embeddings.length - 1);
  const tsne = new SimpleTSNE(perplexity);
  const embeddings2d = tsne.fit(embeddings);

  // Normalize coordinates to fit in SVG
  const minX = Math.min(...embeddings2d.map(p => p[0]));
  const maxX = Math.max(...embeddings2d.map(p => p[0]));
  const minY = Math.min(...embeddings2d.map(p => p[1]));
  const maxY = Math.max(...embeddings2d.map(p => p[1]));

  const normalizedCoords = embeddings2d.map(([x, y]) => [
    padding + ((x - minX) / (maxX - minX || 1)) * (width - 2 * padding),
    padding + ((y - minY) / (maxY - minY || 1)) * ((height - 2 * padding) / 2)
  ]);

  // Colors for clusters - more distinct colors
  const colors2 = ['#3b82f6', '#ef4444']; // Blue, Red
  const colors4 = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b']; // Blue, Red, Green, Orange

  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
    <style>
      .title { font: bold 12px sans-serif; fill: #2c3e50; }
      .code-text { font: 8px monospace; fill: #2c3e50; }
      .cluster-center { stroke: #000; stroke-width: 2; }
      /* Hover popup styles */
      .pt { cursor: pointer; }
      .pt .popup { visibility: hidden; opacity: 0; transition: opacity .15s ease-in-out; }
      .pt:hover .popup { visibility: visible; opacity: 1; }
      .popup rect { fill: #ffffff; stroke: #94a3b8; stroke-width: 1; rx: 6; ry: 6; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.08)); }
      .popup text { font: 10px monospace; fill: #111827; }
    </style>
    
    <rect width="${width}" height="${height}" fill="white" stroke="#dee2e6" stroke-width="1"/>
  `;

  // 2-cluster plot (left side)
  const plot1X = 0;
  const plot1Width = width / 2;
  
  svg += `<text x="${plot1X + plot1Width/2}" y="25" text-anchor="middle" class="title">
    2-cluster: ${escapeHtml(foldTitle(informalStatement, 20))}
  </text>`;

  // Plot 2-cluster points
  normalizedCoords.forEach(([x, y], i) => {
    const adjustedX = plot1X + (x / width) * plot1Width;
    const adjustedY = y + 40;
    const color = colors2[labels2Cluster[i]] || colors2[0];
    const statementOnly = extractStatement(formalizations[i].lean_code);
    const codeTitle = escapeHtml(statementOnly);

    // Build popup content - just the statement
    const popupLines = foldTitle(statementOnly, 40).split('\n').map(escapeHtml);
    const lineHeight = 12;
    const paddingBox = 8;
    const popupWidth = Math.min(280, Math.max(160, Math.max(...popupLines.map(l => l.length)) * 6 + paddingBox * 2));
    const popupHeight = popupLines.length * lineHeight + paddingBox * 2;
    const leanAttr = encodeURIComponent(statementOnly);

    // Dynamic positioning within left plot
    const localX = adjustedX - plot1X;
    const availableRight = plot1Width - localX;
    const showLeft = availableRight < popupWidth + 20;
    const popupOffsetX = showLeft ? -(popupWidth + 10) : 10;

    const topBound = 35; // top of plotting area
    const availableTop = adjustedY - topBound;
    const showBelow = availableTop < popupHeight + 10;
    const popupOffsetY = showBelow ? 10 : -10 - popupHeight;

    svg += `<g class=\"pt\" data-lean=\"${leanAttr}\" transform=\"translate(${adjustedX}, ${adjustedY})\">`+
            `<circle r=\"4\" fill=\"${color}\" opacity=\"0.8\">`+
              `<title>${codeTitle}</title>`+
            `</circle>`+
            `<g class=\"popup\" transform=\"translate(${popupOffsetX}, ${popupOffsetY})\">`+
              `<rect width=\"${popupWidth}\" height=\"${popupHeight}\" rx=\"6\" ry=\"6\" />`+
              popupLines.map((line, idx) => `<text x=\"${paddingBox}\" y=\"${paddingBox + (idx+1)*lineHeight - 3}\">${line}</text>`).join('')+
            `</g>`+
          `</g>`;
  });

  // Plot 2-cluster centers
  cluster2CenterIdxs.forEach(idx => {
    const [x, y] = normalizedCoords[idx];
    const adjustedX = plot1X + (x / width) * plot1Width;
    const adjustedY = y + 40;
    
    svg += `<g transform="translate(${adjustedX}, ${adjustedY})">
              <path d="M-4,-4 L4,4 M-4,4 L4,-4" stroke="red" stroke-width="2" class="cluster-center"/>
            </g>`;
    
    // Add code text for cluster centers
    const code = formalizations[idx].lean_code;
    const shortCode = code.length > 40 ? code.substring(0, 37) + '...' : code;
    const lines = foldTitle(shortCode, 15).split('\n');
    
    lines.forEach((line, lineIdx) => {
      svg += `<text x="${adjustedX}" y="${adjustedY + 12 + lineIdx * 10}" 
                   text-anchor="middle" class="code-text">
                ${escapeHtml(line)}
              </text>`;
    });
  });

  // 4-cluster plot (right side)
  const plot2X = width / 2;
  const plot2Width = width / 2;

  svg += `<text x="${plot2X + plot2Width/2}" y="25" text-anchor="middle" class="title">
    4-cluster
  </text>`;

  // Plot 4-cluster points
  normalizedCoords.forEach(([x, y], i) => {
    const adjustedX = plot2X + (x / width) * plot2Width;
    const adjustedY = y + 40;
    const color = colors4[labels4Cluster[i]] || colors4[0];
    const statementOnly = extractStatement(formalizations[i].lean_code);
    const codeTitle = escapeHtml(statementOnly);

    // Build popup content - just the statement
    const popupLines = foldTitle(statementOnly, 40).split('\n').map(escapeHtml);
    const lineHeight = 12;
    const paddingBox = 8;
    const popupWidth = Math.min(280, Math.max(160, Math.max(...popupLines.map(l => l.length)) * 6 + paddingBox * 2));
    const popupHeight = popupLines.length * lineHeight + paddingBox * 2;
    const leanAttr = encodeURIComponent(statementOnly);

    // Dynamic positioning within right plot
    const localX = adjustedX - plot2X;
    const availableRight = plot2Width - localX;
    const showLeft = availableRight < popupWidth + 20;
    const popupOffsetX = showLeft ? -(popupWidth + 10) : 10;

    const topBound = 35;
    const availableTop = adjustedY - topBound;
    const showBelow = availableTop < popupHeight + 10;
    const popupOffsetY = showBelow ? 10 : -10 - popupHeight;

    svg += `<g class=\"pt\" data-lean=\"${leanAttr}\" transform=\"translate(${adjustedX}, ${adjustedY})\">`+
            `<circle r=\"4\" fill=\"${color}\" opacity=\"0.8\">`+
              `<title>${codeTitle}</title>`+
            `</circle>`+
            `<g class=\"popup\" transform=\"translate(${popupOffsetX}, ${popupOffsetY})\">`+
              `<rect width=\"${popupWidth}\" height=\"${popupHeight}\" rx=\"6\" ry=\"6\" />`+
              popupLines.map((line, idx) => `<text x=\"${paddingBox}\" y=\"${paddingBox + (idx+1)*lineHeight - 3}\">${line}</text>`).join('')+
            `</g>`+
          `</g>`;
  });

  // Plot 4-cluster centers
  cluster4CenterIdxs.forEach(idx => {
    const [x, y] = normalizedCoords[idx];
    const adjustedX = plot2X + (x / width) * plot2Width;
    const adjustedY = y + 40;
    
    svg += `<g transform="translate(${adjustedX}, ${adjustedY})">
              <path d="M-4,-4 L4,4 M-4,4 L4,-4" stroke="red" stroke-width="2" class="cluster-center"/>
            </g>`;
    
    // Add code text for cluster centers
    const code = formalizations[idx].lean_code;
    const shortCode = code.length > 40 ? code.substring(0, 37) + '...' : code;
    const lines = foldTitle(shortCode, 15).split('\n');
    
    lines.forEach((line, lineIdx) => {
      svg += `<text x="${adjustedX}" y="${adjustedY + 12 + lineIdx * 10}" 
                   text-anchor="middle" class="code-text">
                ${escapeHtml(line)}
              </text>`;
    });
  });

  // Add vertical separator line
  svg += `<line x1="${width/2}" y1="35" x2="${width/2}" y2="${height-15}" stroke="#dee2e6" stroke-width="1"/>`;

  svg += '</svg>';

  return {
    svg,
    message: `Generated t-SNE visualization with K-means clustering (2 and 4 clusters) for ${leanCodes.length} formalizations. Points are colored by cluster membership.`
  };
}
