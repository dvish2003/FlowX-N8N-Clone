import dotenv from "dotenv";
dotenv.config();

import { createAgent, tool } from "langchain";
import { ChatCerebras } from "@langchain/cerebras";
import { HumanMessage } from "@langchain/core/messages";
import Exa from "exa-js";
import z from "zod";

const model = new ChatCerebras({
  model: "llama-3.3-70b",
  temperature: 0,
  maxTokens: 256,          
  maxRetries: 1,
  apiKey: process.env.CEREBRAS_API_KEY,
});


const exaClient = new Exa(process.env.EXA_SEARCH_API_KEY);


const searchTool = tool(
  async ({ query }) => {
    const result = await exaClient.search(query, {
      numResults: 1,
      type: "keyword",
    });

    return result.results?.[0]?.text || "No results found";
  },
  {
    name: "search_web",
    description: "Search the web once to get latest information",
    schema: z.object({
      query: z.string().describe("Search query"),
    }),
  }
);


const agent = createAgent({
  model,
  tools: [searchTool],
  systemPrompt: `
You are a helpful AI assistant.

Rules:
- Use search_web tool ONLY ONCE if required.
- After getting search results, answer the user and STOP.
- Do NOT repeat tool calls.
- Reply ONLY in Sinhala.
`,
});


async function runAgent() {
  try {
    const response = await agent.invoke(
      {
        messages: [
          new HumanMessage(
            "What is the latest news on AI technology?"
          ),
        ],
      },
      {
        recursionLimit: 5,
      }
    );

    const lastMessage =
      response.messages[response.messages.length - 1];

    console.log("🧠\nAI Response (Sinhala):\n");
    console.log("💬", lastMessage.content);
  } catch (error) {
    if (error.status === 429) {
      console.error("Rate limit hit. Please wait 60 seconds and retry.");
    } else {
      console.error("Error:", error);
    }
  }
}

runAgent();
