import {createAgent} from "langchain";
import { ChatCerebras } from "@langchain/cerebras";
import dotenv from "dotenv";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";

dotenv.config();

const model = new ChatCerebras({
    model: "llama-3.3-70b",
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2,
    apiKey: process.env.CEREBRAS_API_KEY,
});

const agent = createAgent({
    model,
    systemPrompt: 'You are a helpful AI assistant chat the with User In English.but User request in English you reply in Sinhala.',
})


const agentOutput = await agent.invoke({
    messages: [new HumanMessage({content: "Hello, how are you?"})]
});

const aiResponse = agentOutput.messages[agentOutput.messages.length -1].content;

console.log("🤖 AI Response:", aiResponse);

