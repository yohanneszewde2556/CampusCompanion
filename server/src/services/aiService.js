const MATCH_THRESHOLD = 0.65;

const simpleTextSimilarity = (textA, textB) => {
  const tokenize = (text) => text.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  const wordsA = tokenize(textA);
  const wordsB = tokenize(textB);
  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  const setB = new Set(wordsB);
  const overlap = wordsA.filter((w) => setB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return overlap / union;
};

const calculateSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
};

const generateEmbedding = async (text) => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI embedding failed:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('OpenAI embedding error:', error.message);
    return null;
  }
};

const getMatchScore = (textA, textB, embeddingA, embeddingB) => {
  if (embeddingA?.length && embeddingB?.length) {
    return calculateSimilarity(embeddingA, embeddingB);
  }
  return simpleTextSimilarity(textA, textB);
};

module.exports = {
  MATCH_THRESHOLD,
  generateEmbedding,
  calculateSimilarity,
  getMatchScore,
  simpleTextSimilarity,
};
