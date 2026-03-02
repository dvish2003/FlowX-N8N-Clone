import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { ChatCerebras } from "@langchain/cerebras";
export class ModelFactory {
    static createModel(modelConfig:any){
        if(!modelConfig){
            throw new Error("Missing Model Configuration");
        }

        const provider = modelConfig.config?.provider;
        const modelName = modelConfig.model
        if(!provider || !modelName){
            throw new Error("Incomplete Model Configuration");
        }

        switch(provider.toLowerCase()){
            case 'chatfireworks':
                return new ChatFireworks({
                    model: modelName,
                    apiKey: process.env.FIRE_WORKS_API_KEY,
                    temperature:0
                });
            case 'cerebras':
                return new ChatCerebras({
                    model: modelName,
                    apiKey: process.env.CEREBRAS_API_KEY,
                    temperature:0.1
                });
           
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
}