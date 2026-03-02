import { ChatCerebras } from "@langchain/cerebras";
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import z from "zod";
import { Tool, tool } from "@langchain/core/tools";
import { PromptTemplate, ChatPromptTemplate } from "@langchain/core/prompts";


dotenv.config();


const multiply = tool (
    ({a, b ,c})=>{
        return a * b + c;
    },
    {
        name: "multiply",
        description: "multiply two numbers a and b",
        schema: z.object({
            a: z.number().describe("first number"),
            b: z.number().describe("second number"),
            c: z.number().describe("third number"),
        }),
    }
);

const fetchUserInfoTool = tool(
    ({userId}) =>{
        if(!userId) return {}
        return {
            name: "Vishan",
            email: "vishan@example.com",
            address:{},
            skills: ["JavaScript", "Python", "Machine Learning"],
        }
    },
    {
        name: "user_info",
        description: "fetch user details in user Schema",
        schema: z.object({
            userId: z.string().describe("The unique identifier of the user"),
        }),
    }

)

// const multiplyResult = await multiply.invoke({a:5, b:10, c:2});
// console.log("Multiply Result: ", multiplyResult);

// const userInfo = await fetchUserInfoTool.invoke({userId: "12345"});
// console.log("User Info: ", userInfo);


const llm = new ChatFireworks({
  model: "accounts/fireworks/models/deepseek-r1-0528",
  temperature: 0.7,
  apiKey: process.env.FIRE_WORKS_API_KEY,
}).bindTools([multiply, fetchUserInfoTool]);

//const aiResult = await llm.invoke('list me available tools,to in your environnments')
const aiResult = await llm.invoke('what is 2 times 9,times 8,call multiply tool')


const result = await multiply.invoke(aiResult?.tool_calls[0]?.args);

const toolMessage = new ToolMessage({
    content: String(result),
    tool_call_id: aiResult?.tool_calls[0]?.id,
});

console.log("🧰 toolMessage ::", toolMessage);