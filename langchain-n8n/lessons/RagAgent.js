import { createAgent } from "langchain";
import { ChatCerebras } from "@langchain/cerebras";
import dotenv from "dotenv";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { queryVectorDB } from "./retrieving-pipeline.js";
import { tool } from "langchain";
import z from "zod";

dotenv.config();

const model = new ChatCerebras({
  model: "llama-3.3-70b",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
  apiKey: process.env.CEREBRAS_API_KEY,
});

const retriverTool = tool(
  async ({ query }) => {
    const retrievedDocs = await queryVectorDB(query);
    const serialized = retrievedDocs
      .map(
        (doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`
      )
      .join("\n");
    return serialized || "No relevant documents found.";
  },
  {
    name: "retrieve",
    description:
      "Retrieve relevant documents from the vector database based on the user query.",
    schema: z.object({
      query: z
        .string()
        .describe("The user query to search for relevant documents."),
    }),
  }
);

const agent = createAgent({
  model,
  tools: [retriverTool],
  systemPrompt: `
     you have access to a tool that retrieves context from a blog post.
     Use the tool to help answer the user's queries.
    `,
});

const agentOutput = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: `
        Different types od prompt Engineering`,
      },
    ],
  },
  {
    streamMode: "values",
  }
);

const aiResponse =
  agentOutput.messages[agentOutput.messages.length - 1].content;

console.log("🤖 AI Response:", aiResponse);
