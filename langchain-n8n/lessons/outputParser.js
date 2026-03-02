import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const llm = new ChatFireworks({
  model: "accounts/fireworks/models/deepseek-r1-0528",
  temperature: 0.7,
  apiKey: process.env.FIRE_WORKS_API_KEY,
});

const jsonOutput = z.object({
  topics: z.array(z.string()).describe("array of topics"),
});

const structuredLlm = llm.withStructuredOutput(jsonOutput);

async function main() {
  const result = await structuredLlm.invoke([
    new SystemMessage(`You are a helpful assistant respond only in English.
RULES:
- If the user input is not English, say:
"Sorry, I can only understand and respond in English. Please provide your message in English."`),

    new HumanMessage(
      "Generate an array of 3 JavaScript topics"
    ),
  ]);

  console.log("✅ result ::", result);
}

main();
