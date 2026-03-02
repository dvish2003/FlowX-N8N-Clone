import { ChatCerebras } from "@langchain/cerebras";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import "dotenv/config";
import { createAgent, HumanMessage, tool } from "langchain";
import { ExaSearchResults } from "@langchain/exa";
import { z } from "zod";

const cerebrasModel = new ChatCerebras({
  model: "llama-3.3-70b",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
  apiKey: process.env.CEREBRAS_API_KEY,
});

const fireworksModel = new ChatFireworks({
  model: "accounts/fireworks/models/deepseek-v3p1",
  temperature: 0.7,
  apiKey: process.env.FIRE_WORKS_API_KEY,
});

const searchTool = new ExaSearchResults({
  apiKey: process.env.EXA_SEARCH_API_KEY,
  numResults: 3,
  type: "keyword",
});

const subagent1 = createAgent({
  model: cerebrasModel,
  tools: [searchTool],
  systemPrompt: `'
      your are a helpfull AI assistant, that interact with other assistants,your job is to find real-time weather information about world cities.
    '`,
});



const subagent2 = createAgent({
  model: cerebrasModel,
  tools: [searchTool],
  systemPrompt: `'
            your are a helpfull AI assistant, that interact with other assistants,your job is to Translate English to Sinhala eg: Hello → හෙලෝ. 
    '`,
});



const callSubagent1 = tool(
  async ({ query }) => {
    console.log("🧩 Calling subagent1...");
    const result = await subagent1.invoke({
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
    });
    return result.messages.at(-1)?.text || "No response from subagent.";
  },
  {
    name: "subagent1",
    description: "Calls subagent1 to handle specific queries.",
    schema: z.object({
      query: z.string().describe("The user query to be handled by subagent1."),
    }),
  }
);


const callSubagent2 = tool(
  async ({ query }) => {
    console.log("🧩 Calling subagent2...");
    const result = await subagent2.invoke({
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
    });
    return result.messages.at(-1)?.text || "No response from subagent.";
  },
  {
    name: "subagent2",
    description: "Translate English to Sinhala.",
    schema: z.object({
      query: z.string().describe("The user query to be handled by subagent2."),
    }),
  }
);


const agent = createAgent({
  model: fireworksModel,
  tools: [callSubagent1,callSubagent2],
  systemPrompt: `
        you are a helpfull AI assistant, that can delegate tasks to subagents.
        You have 2 subagents passed to your as tool,
        - the goal of subagent 1 is to find real-time weather information about world cities.
        - the goal of subagent 2 is to Translate English to Sinhala eg: Hello → හෙලෝ.      
        `, 
        
});
const agentOutput = await agent.invoke({
  messages: [
   new HumanMessage('hello'),
    new HumanMessage('what is the weather in New York City?'),
    new HumanMessage('once you find the weather, translate the weather information to Sinhala'),
  ],
});

const aiResponse =
  agentOutput.messages[agentOutput.messages.length - 1].content;

console.log("🤖 AI Response:", aiResponse);
