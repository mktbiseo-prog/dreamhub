import OpenAI from "openai";

/**
 * Generate a 1536-dimension embedding for the given text.
 * Falls back to a deterministic pseudo-embedding when no API key is configured.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return getMockEmbedding(text);
  }

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("[Embed] OpenAI call failed, falling back to mock:", error);
    return getMockEmbedding(text);
  }
}

/**
 * Cosine similarity between two vectors. Returns value in [-1, 1].
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Deterministic pseudo-embedding from text hash.
 * Produces a normalized unit vector of 1536 dimensions.
 */
function getMockEmbedding(text: string): number[] {
  const dimensions = 1536;
  const raw = new Array(dimensions);

  // Simple hash-based seed
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }

  // Seeded pseudo-random generator (xorshift32)
  let state = hash || 1;
  for (let i = 0; i < dimensions; i++) {
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    raw[i] = (state >>> 0) / 4294967296 - 0.5; // [-0.5, 0.5]
  }

  // Normalize to unit vector
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += raw[i] * raw[i];
  }
  norm = Math.sqrt(norm);

  return raw.map((v: number) => v / norm);
}
