// ---------------------------------------------------------------------------
// Dream Brain — Topic Clustering
//
// Client-side TF-IDF + agglomerative clustering.
// Groups thoughts into topic clusters without external API calls.
// ---------------------------------------------------------------------------

export interface TopicCluster {
  id: string;
  label: string;
  keywords: string[];
  thoughtIds: string[];
  centroid: Record<string, number>;
  coherence: number; // 0-1
}

interface ThoughtInput {
  id: string;
  text: string;
  tags: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// Text Processing
// ═══════════════════════════════════════════════════════════════════════════

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "is", "are", "was", "were",
  "be", "been", "being", "have", "has", "had", "do", "does", "did",
  "will", "would", "could", "should", "may", "might", "must", "shall",
  "can", "need", "dare", "ought", "used", "to", "of", "in", "for",
  "on", "with", "at", "by", "from", "as", "into", "through", "during",
  "before", "after", "above", "below", "between", "out", "off", "over",
  "under", "again", "further", "then", "once", "here", "there", "when",
  "where", "why", "how", "all", "each", "every", "both", "few", "more",
  "most", "other", "some", "such", "no", "not", "only", "own", "same",
  "so", "than", "too", "very", "just", "because", "if", "about", "up",
  "it", "its", "i", "me", "my", "we", "our", "you", "your", "he",
  "him", "his", "she", "her", "they", "them", "their", "this", "that",
  "these", "those", "what", "which", "who", "whom", "also", "like",
  "get", "got", "make", "made", "think", "go", "going", "went", "really",
  "much", "many", "well", "even", "still", "already", "yet", "though",
]);

/**
 * Tokenize text into lowercase words, filtering stop words and short words.
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Compute Term Frequency for a document (array of tokens).
 */
export function computeTF(tokens: string[]): Record<string, number> {
  const tf: Record<string, number> = {};
  const total = tokens.length;
  if (total === 0) return tf;

  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }

  for (const key of Object.keys(tf)) {
    tf[key] = tf[key] / total;
  }
  return tf;
}

/**
 * Compute Inverse Document Frequency across all documents.
 */
export function computeIDF(documents: string[][]): Record<string, number> {
  const idf: Record<string, number> = {};
  const totalDocs = documents.length;

  // Count document frequency for each term
  const docFreq: Record<string, number> = {};
  for (const doc of documents) {
    const seen = new Set(doc);
    for (const word of seen) {
      docFreq[word] = (docFreq[word] || 0) + 1;
    }
  }

  for (const [term, freq] of Object.entries(docFreq)) {
    idf[term] = Math.log((totalDocs + 1) / (freq + 1)) + 1;
  }

  return idf;
}

/**
 * Compute TF-IDF vector for a single document.
 */
export function computeTFIDF(
  tf: Record<string, number>,
  idf: Record<string, number>
): Record<string, number> {
  const tfidf: Record<string, number> = {};
  for (const [term, tfVal] of Object.entries(tf)) {
    tfidf[term] = tfVal * (idf[term] || 1);
  }
  return tfidf;
}

// ═══════════════════════════════════════════════════════════════════════════
// Similarity
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compute cosine similarity between two TF-IDF vectors.
 */
export function cosineSimilarity(
  vecA: Record<string, number>,
  vecB: Record<string, number>
): number {
  const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (const key of allKeys) {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    dotProduct += a * b;
    magnitudeA += a * a;
    magnitudeB += b * b;
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

// ═══════════════════════════════════════════════════════════════════════════
// Clustering
// ═══════════════════════════════════════════════════════════════════════════

function computeCentroid(
  vectors: Record<string, number>[]
): Record<string, number> {
  if (vectors.length === 0) return {};

  const centroid: Record<string, number> = {};
  const allKeys = new Set(vectors.flatMap((v) => Object.keys(v)));

  for (const key of allKeys) {
    let sum = 0;
    for (const vec of vectors) {
      sum += vec[key] || 0;
    }
    centroid[key] = sum / vectors.length;
  }

  return centroid;
}

function computeClusterCoherence(
  vectors: Record<string, number>[],
  centroid: Record<string, number>
): number {
  if (vectors.length <= 1) return 1;

  let totalSim = 0;
  for (const vec of vectors) {
    totalSim += cosineSimilarity(vec, centroid);
  }
  return totalSim / vectors.length;
}

function extractTopKeywords(
  centroid: Record<string, number>,
  count: number
): string[] {
  return Object.entries(centroid)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([term]) => term);
}

/**
 * Cluster thoughts using agglomerative (hierarchical) clustering.
 *
 * Algorithm:
 * 1. Start with each thought as its own cluster
 * 2. Find the two most similar clusters
 * 3. Merge them if similarity > threshold
 * 4. Repeat until no more merges can be made
 */
export function clusterTopics(
  thoughts: ThoughtInput[],
  minClusterSize = 2
): TopicCluster[] {
  if (thoughts.length === 0) return [];

  // Tokenize all documents (combine text with tags for richer representation)
  const documents = thoughts.map((t) => [
    ...tokenize(t.text),
    ...t.tags.flatMap((tag) => tag.toLowerCase().split("-")),
  ]);

  // Compute IDF across all documents
  const idf = computeIDF(documents);

  // Compute TF-IDF for each document
  const tfidfVectors = documents.map((doc) => {
    const tf = computeTF(doc);
    return computeTFIDF(tf, idf);
  });

  // Initialize: each thought is its own cluster
  const SIMILARITY_THRESHOLD = 0.15;
  let clusters: {
    thoughtIndices: number[];
    vectors: Record<string, number>[];
  }[] = tfidfVectors.map((vec, i) => ({
    thoughtIndices: [i],
    vectors: [vec],
  }));

  // Agglomerative merging
  let merged = true;
  while (merged && clusters.length > 1) {
    merged = false;
    let bestSim = -1;
    let bestI = -1;
    let bestJ = -1;

    // Find most similar pair
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const centroidA = computeCentroid(clusters[i].vectors);
        const centroidB = computeCentroid(clusters[j].vectors);
        const sim = cosineSimilarity(centroidA, centroidB);

        if (sim > bestSim) {
          bestSim = sim;
          bestI = i;
          bestJ = j;
        }
      }
    }

    // Merge if above threshold
    if (bestSim > SIMILARITY_THRESHOLD && bestI >= 0 && bestJ >= 0) {
      const mergedCluster = {
        thoughtIndices: [
          ...clusters[bestI].thoughtIndices,
          ...clusters[bestJ].thoughtIndices,
        ],
        vectors: [...clusters[bestI].vectors, ...clusters[bestJ].vectors],
      };

      clusters = clusters.filter((_, idx) => idx !== bestI && idx !== bestJ);
      clusters.push(mergedCluster);
      merged = true;
    }
  }

  // Convert to TopicCluster format
  const topicClusters: TopicCluster[] = clusters
    .filter((c) => c.thoughtIndices.length >= minClusterSize)
    .map((cluster, idx) => {
      const centroid = computeCentroid(cluster.vectors);
      const coherence = computeClusterCoherence(cluster.vectors, centroid);
      const keywords = extractTopKeywords(centroid, 5);
      const thoughtIds = cluster.thoughtIndices.map((i) => thoughts[i].id);

      // Generate a human-readable label from top keywords
      const label = keywords
        .slice(0, 3)
        .map((k) => k.charAt(0).toUpperCase() + k.slice(1))
        .join(" & ");

      return {
        id: `cluster-${idx}`,
        label,
        keywords,
        thoughtIds,
        centroid,
        coherence,
      };
    })
    .sort((a, b) => b.thoughtIds.length - a.thoughtIds.length);

  return topicClusters;
}
