import { ChatCerebras } from "@langchain/cerebras";
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import z from "zod";
import { tool } from "@langchain/core/tools";
import { PromptTemplate, ChatPromptTemplate } from "@langchain/core/prompts";
import { ExaSearchResults } from "@langchain/exa"
import { Runnable, RunnableLambda } from "@langchain/core/runnables";
dotenv.config();


const llm = new ChatCerebras({
    model: "llama-3.3-70b",
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2,
    apiKey: process.env.CEREBRAS_API_KEY,
});

const searchTool = new ExaSearchResults({
    apiKey: process.env.EXA_SEARCH_API_KEY,
    name: "search_web",
    description: "Search the web to find real-time information",
    searchArgs: {
        numResults: 1,
        type: "keyword",
    },
});


const multiply = tool (
    ({a, b})=>{
        return a * b;
    },
    {
        name: "multiply",
        description: "multiply two numbers a and b",
        schema: z.object({
            a: z.number().describe("first number"),
            b: z.number().describe("second number"),
        }),
    }       
)



const chain = await llm.bindTools([searchTool, multiply]);

const toolChain = RunnableLambda.from(async (userInput) =>{
   
    const aiMsg = await chain.invoke([
        {
            role:'user',
            content: userInput,
        }
    ]);

    if(!aiMsg.tool_calls || aiMsg.tool_calls.length === 0){
        return aiMsg;
    }


    const toolExecutionPromises = aiMsg.tool_calls.map(async (toolCall) =>{
         if(toolCall.name === "search_web"){
            const result = await searchTool.invoke(toolCall.args);
            return new ToolMessage({
                content: String(result),
                tool_call_id: toolCall.id,
            });
         }


         if(toolCall.name === "multiply"){
            const result = await multiply.invoke(toolCall.args);
            return new ToolMessage({
                content: String(result),
                tool_call_id: toolCall.id,
            });
         }
        
        
        return null;
        
    }).filter(msg => msg !== null); // filter out null messages

  const toolMessages = await Promise.all(toolExecutionPromises);

  const chainResult = await chain.invoke([
    {
        role: 'user',
        content: userInput,
    },
    aiMsg,
    ...toolMessages
  ])

return chainResult;
}
)


const result = await toolChain.invoke('what is current weather in New York ?');
console.log("🧾 Final Result:", result);