// Import ChatCerebras model from LangChain (used to talk to Cerebras LLM)
import { ChatCerebras } from "@langchain/cerebras";

// Message types (not directly used here, but useful for chat-based prompts)
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";

// Load environment variables from .env file
import dotenv from "dotenv";

// Zod is used to define and validate structured JSON output
import z from "zod";

// Tools support (not used directly here)
import { tool } from "@langchain/core/tools";

// Prompt templates to structure how we talk to the LLM
import { PromptTemplate, ChatPromptTemplate } from "@langchain/core/prompts";

// Load environment variables (like API keys)
dotenv.config();


// Create a Cerebras LLM instance
const llm = new ChatCerebras({
    model: "llama-3.3-70b",        // Large language model
    temperature: 0,               // 0 = deterministic (same output every time)
    maxTokens: undefined,         // Let model decide token limit
    maxRetries: 2,                // Retry twice if request fails
    apiKey: process.env.CEREBRAS_API_KEY, // API key from .env
});


// Create a chat prompt template
const prompot = ChatPromptTemplate.fromMessages([

    // SYSTEM MESSAGE → defines model behavior
    [
        "system",
        `
        you are professional maths Expert.
        your job is to solve user question.
        think step by step through your reasoning and explain your thought

        Instructions:
        - return only the value of x
        `,
    ],

    // USER MESSAGE → actual question comes here
    ["user", "here's user question {input}"],
]);


// Define the expected JSON output format using Zod
const jsonOutputSchema = z.object({
    value_of_x: z.number().describe("the value of x"),
}).describe("output schema for value of x");


// Tell the LLM to ALWAYS respond in this structured JSON format
const structuredPrompt = llm.withStructuredOutput(jsonOutputSchema);


// Connect prompt → model → structured output
const chain = prompot.pipe(structuredPrompt);


// Call the chain with a math equation
const result = await chain.invoke({
    input: "2x + 3 = 7"
});


// Print the final result
console.log("✅ result ::", result);
