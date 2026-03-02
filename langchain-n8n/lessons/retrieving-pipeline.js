// Text → Vector (embedding) convert කරන්න Cohere embeddings use කරනවා
// User query + documents embeddings generate කරන්න
import { CohereEmbeddings } from "@langchain/cohere";

// LangChain Pinecone wrapper
// Pinecone vector DB එක easy way එකෙන් use කරන්න
import { PineconeStore } from "@langchain/pinecone";

// Pinecone official client
// Actual Pinecone service එක connect කරන්න
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

import dotenv from "dotenv";
dotenv.config();

// Vector DB query කරන function එක
// queary = user question (text)
export async function queryVectorDB(queary) {
  // 1️⃣ Embedding model initialize කරනවා
  // User question + stored chunks embeddings same model එකෙන් generate වෙන්න ඕන
  const embeddings = new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY, // Cohere API key
    model: "embed-english-v3.0", // Embedding model
  });

  // 2️⃣ Pinecone client create කරනවා
  // Pinecone service එකට connect වෙන step එක
  const pinecone = new PineconeClient({
    apiKey: process.env.PINECONE_API_KEY,
  });

  // 3️⃣ Existing Pinecone index select කරනවා
  // (මේ index එක embedding step එකේ use කරපු එකම)
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

  // 4️⃣ Vector store create කරනවා (existing index use කරලා)
  // New documents add කරන එක නෙමෙයි – already stored vectors query කරනවා
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 5, // parallel request limit
  });

  // 5️⃣ Similarity search run කරනවා
  // queary → embedding → Pinecone similarity search
  // 5 = top 5 most relevant chunks
  const results = await vectorStore.similaritySearch(queary, 5);

  // 6️⃣ Relevant documents return කරනවා
  return results;
}
