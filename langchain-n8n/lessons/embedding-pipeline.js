// Load environment variables from .env file
import "dotenv/config";

// LangChain Document type import කරනවා
// Document object එක text + metadata hold කරන්න use වෙනවා
import { Document } from "@langchain/core/documents";

// Text split කරන්න use කරන Recursive splitter
// Long text → small chunks
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// Text → Vector (embedding) convert කරන්න Cohere embeddings
import { CohereEmbeddings } from "@langchain/cohere";

// Pinecone vector store (LangChain wrapper)
import { PineconeStore } from "@langchain/pinecone";

// Pinecone official client
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

// Web page load කරන්න (HTML → text)
// Cheerio web loader for HTML parsing
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

// Main embedding function
// url එකක් pass කරලා, ඒ page එක vector DB එකට embed කරන function එක
export async function doEmbedding(url) {
  // 1️⃣ Web page loader create කරනවා
  // Given URL එක HTML parse කරලා text extract කරනවා
  const loader = new CheerioWebBaseLoader(url);

  // 2️⃣ Web page load කරනවා
  // Result = array of Document objects
  const parsedDocs = await loader.load();

  // 3️⃣ Metadata add කරනවා
  // Each document එකට source URL එක metadata එකක් විදිහට add කරනවා
  const DocsWithMeta = parsedDocs.map((doc) => {
    doc.metadata.source = url; // source = original URL
    return doc;
  });

  // 4️⃣ Documents flat කරනවා
  // (nested arrays avoid කරන්න)
  const docs = DocsWithMeta.flat();

  // 5️⃣ Text splitter setup
  // chunkSize = 1000 characters
  // chunkOverlap = 200 characters (context miss නොවෙන්න)
  const textsplitters = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  // 6️⃣ Documents → chunks
  // Large text → small chunks (this is where CHUNKING happens)
  const allSplits = await textsplitters.splitDocuments(docs);

  // 7️⃣ Embedding model initialize
  // Cohere API use කරලා text → vector convert කරන්න
  const embedding = new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY, // Cohere API key
    model: "embed-english-v3.0", // Embedding model
  });

  // 8️⃣ Pinecone client initialize
  const pinecone = new PineconeClient({
    apiKey: process.env.PINECONE_API_KEY, // Pinecone API key
  });

  // 9️⃣ Pinecone index select කරනවා
  const pineconeIndex = pinecone.Index(
    process.env.PINECONE_INDEX // index name
  );

  // 🔟 Vector store create කරනවා
  // LangChain + Pinecone connect වෙන main layer එක
  const vectorStore = new PineconeStore(embedding, {
    pineconeIndex,
    maxConcurrency: 5, // parallel embedding requests limit
  });

  // 1️⃣1️⃣ Chunks Pinecone එකට add කරනවා
  // Each chunk → embedding → Pinecone vector
  await vectorStore.addDocuments(allSplits);

  // Success message
  console.log("✅ Document embedded successfully");
}

await doEmbedding(
  "https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/"
);

// https://chatgpt.com/share/6958e5ba-0ec4-8011-bee7-92e99fa2ba1c.   ===>.  real world example include this link
