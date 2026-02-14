import type { DreamStory } from "./types";

// ─── Types ───────────────────────────────────────────────────

export interface ScoredStory {
  story: DreamStory;
  score: number;
  highlights: string[];
}

// ─── Tokenization & Helpers ──────────────────────────────────

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "it", "as", "was", "are", "be",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "shall", "can", "need",
  "dare", "this", "that", "these", "those", "i", "me", "my", "we",
  "our", "you", "your", "he", "him", "his", "she", "her", "they",
  "them", "their", "what", "which", "who", "when", "where", "why",
  "how", "all", "each", "every", "both", "few", "more", "most",
  "other", "some", "such", "no", "not", "only", "own", "same", "so",
  "than", "too", "very", "just", "about", "also", "into", "over",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

// ─── TF-IDF Engine ───────────────────────────────────────────

interface DocumentEntry {
  id: string;
  tokens: string[];
  rawText: string;
  story: DreamStory;
}

function computeTermFrequency(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }
  // Normalize by document length
  const maxFreq = Math.max(...freq.values(), 1);
  for (const [term, count] of freq) {
    freq.set(term, count / maxFreq);
  }
  return freq;
}

function computeIdf(
  documents: DocumentEntry[],
  vocabulary: Set<string>
): Map<string, number> {
  const idf = new Map<string, number>();
  const N = documents.length;

  for (const term of vocabulary) {
    const docsContaining = documents.filter((d) =>
      d.tokens.includes(term)
    ).length;
    // Smoothed IDF: log(N / (1 + df)) + 1
    idf.set(term, Math.log(N / (1 + docsContaining)) + 1);
  }

  return idf;
}

function cosineSimilarity(
  vecA: Map<string, number>,
  vecB: Map<string, number>
): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  const allKeys = new Set([...vecA.keys(), ...vecB.keys()]);

  for (const key of allKeys) {
    const a = vecA.get(key) || 0;
    const b = vecB.get(key) || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

// ─── Document Text Extraction ────────────────────────────────

function storyToText(story: DreamStory): string {
  const parts = [
    story.title,
    story.statement,
    story.originStory,
    story.impactStatement,
    story.category,
    story.creatorName,
    story.creatorBio,
    ...story.products.map(
      (p) => `${p.title} ${p.description} ${p.whyIMadeThis}`
    ),
  ];
  return parts.filter(Boolean).join(" ");
}

// ─── Highlight Extraction ────────────────────────────────────

function findHighlights(
  queryTokens: string[],
  story: DreamStory
): string[] {
  const highlights: string[] = [];
  const sentences = [
    story.statement,
    story.originStory,
    story.impactStatement,
    ...story.products.map((p) => p.description),
    ...story.products.map((p) => p.whyIMadeThis),
  ]
    .filter(Boolean)
    .flatMap((text) => text.split(/[.!?]+/).map((s) => s.trim()))
    .filter((s) => s.length > 10);

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    const matchCount = queryTokens.filter((qt) => lower.includes(qt)).length;
    if (matchCount > 0) {
      highlights.push(sentence);
    }
    if (highlights.length >= 3) break;
  }

  return highlights;
}

// ─── Key Phrase Extraction ───────────────────────────────────

export function extractKeyPhrases(text: string): string[] {
  const tokens = tokenize(text);
  const freq = new Map<string, number>();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }

  // Sort by frequency, take top phrases
  const sorted = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([term]) => term);

  // Also extract bigrams
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    const bigram = `${tokens[i]} ${tokens[i + 1]}`;
    bigrams.push(bigram);
  }

  const bigramFreq = new Map<string, number>();
  for (const bg of bigrams) {
    bigramFreq.set(bg, (bigramFreq.get(bg) || 0) + 1);
  }

  const topBigrams = [...bigramFreq.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([phrase]) => phrase);

  return [...topBigrams, ...sorted].slice(0, 10);
}

// ─── Main Vector Search ──────────────────────────────────────

export function vectorSearch(
  query: string,
  stories: DreamStory[],
  topK = 10
): ScoredStory[] {
  if (!query.trim() || stories.length === 0) return [];

  // Build document entries
  const documents: DocumentEntry[] = stories.map((story) => {
    const rawText = storyToText(story);
    return {
      id: story.id,
      tokens: tokenize(rawText),
      rawText,
      story,
    };
  });

  // Build vocabulary from all documents + query
  const queryTokens = tokenize(query);
  const vocabulary = new Set<string>();
  for (const token of queryTokens) vocabulary.add(token);
  for (const doc of documents) {
    for (const token of doc.tokens) vocabulary.add(token);
  }

  // Compute IDF across corpus
  const idf = computeIdf(documents, vocabulary);

  // Build query TF-IDF vector
  const queryTf = computeTermFrequency(queryTokens);
  const queryVector = new Map<string, number>();
  for (const [term, tf] of queryTf) {
    const idfVal = idf.get(term) || 0;
    queryVector.set(term, tf * idfVal);
  }

  // Score each document
  const scored: ScoredStory[] = documents.map((doc) => {
    const docTf = computeTermFrequency(doc.tokens);
    const docVector = new Map<string, number>();
    for (const [term, tf] of docTf) {
      const idfVal = idf.get(term) || 0;
      docVector.set(term, tf * idfVal);
    }

    const score = cosineSimilarity(queryVector, docVector);

    // Boost for exact title/category match
    let boostedScore = score;
    const lowerQuery = query.toLowerCase();
    if (doc.story.title.toLowerCase().includes(lowerQuery)) {
      boostedScore += 0.3;
    }
    if (doc.story.category.toLowerCase().includes(lowerQuery)) {
      boostedScore += 0.15;
    }

    const highlights = findHighlights(queryTokens, doc.story);

    return {
      story: doc.story,
      score: Math.min(boostedScore, 1), // Cap at 1.0
      highlights,
    };
  });

  // Sort by score and filter out zero scores
  return scored
    .filter((s) => s.score > 0.01)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
