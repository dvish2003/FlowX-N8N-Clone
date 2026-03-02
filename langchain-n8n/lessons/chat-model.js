import { ChatCerebras } from "@langchain/cerebras";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv";


dotenv.config();

const llm = new ChatCerebras({
    model: "llama-3.3-70b",
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2,
    apiKey: process.env.CEREBRAS_API_KEY,
});

const getChatHistory = () =>{
    return [
        new HumanMessage("hello"),
        new  AIMessage("Hi! How can I assist you today?"),
        new HumanMessage('Do you know what was my previouse message?'),
        new AIMessage('Your previous message was "hello". How can I help you further?'),
        new HumanMessage('I am Vishan'),
        new HumanMessage('Do You Know who am I?'),
    ]
}   


const aiMsg = await llm.invoke([

    // ai prompt 
    new SystemMessage(`You are a helpful assistant respond the user only Engilshh.
        RULES:
        - if the user provide or input a message Which is not in English,   
         say eg: "Sorry, I can only understand and respond in English. Please provide your message in English."
        `),

    ...getChatHistory(),
]);

const storeAIMassage = () => {
      
}

console.log("💬", aiMsg.content);