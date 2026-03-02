import { ChatCerebras } from "@langchain/cerebras";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import z from "zod";
import { tool } from "@langchain/core/tools";
import { PromptTemplate, ChatPromptTemplate } from "@langchain/core/prompts";

dotenv.config();


// Create a Cerebras LLM instance
const llm = new ChatCerebras({
    model: "llama-3.3-70b",        // Large language model
    temperature: 0,               // 0 = deterministic (same output every time)
    maxTokens: undefined,         // Let model decide token limit
    maxRetries: 2,                // Retry twice if request fails
    apiKey: process.env.CEREBRAS_API_KEY, // API key from .env
});

const generate_question_prompt = ChatPromptTemplate.fromMessages([
  ["system", `You are an AI search assistant.

The user asked: {question}

Step back and consider this question more broadly:
 1. Reframe it in general terms.
 2. Identify the main themes or dimensions involved.
 3. Generate 5 diverse search queries that cover these dimensions,
    ensuring each query explores a different perspective or phrasing.`]
])

const jsonOutputSchema = z.object({
    question : z.array(z.string()).describe("array of questions"),
}).describe("return an array of questions");


const structuredPrompt = llm.withStructuredOutput(jsonOutputSchema);

const chain = generate_question_prompt.pipe(structuredPrompt);

const result = await chain.invoke({
    question: "How can I improve my website's SEO ranking?",
});

console.log("✅ Result:", result);