import { CohereEmbeddings } from "@langchain/cohere";

import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { tool } from '@langchain/core/tools';
import { z } from 'zod';



export const retrievedDocs = tool(
    async({query}) => {
        const retrievedDocs = await queryVectorDB(query);
        const serialized = retrievedDocs.map(
            (doc) =>`
               Source: ${doc.metadata.source}
               Content: ${doc.pageContent}
            `
        ).join('\n');

        return serialized;
    },
    {
        name: 'retrieve',
        description: "Retrieves relevant documents from the vector database based on the input query.",
        schema: z.object({
            query: z.string().describe('The input query to retrieve relevant documents.'),
        }),
    }
        )
    

        export async function queryVectorDB(query: string) {
             const embeddings = new CohereEmbeddings({
                  model: "embed-english-v3.0",
                  apiKey: process.env.COHERE_API_KEY
             })

                const pinecone = new PineconeClient({
                    apiKey : process.env.PINECONE_API_KEY  as string,
                }
                );

                const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX as string);

                const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
                    pineconeIndex,
                    textKey: "text",
                });

                const results = await vectorStore.similaritySearch(query, 5);

                return results;
        }
