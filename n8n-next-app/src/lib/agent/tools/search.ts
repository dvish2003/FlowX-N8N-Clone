import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { Exa } from "exa-js";
import { ExaSearchResults } from "@langchain/exa";


export const searchTool = tool(
    async({query}) => {
        const client = new Exa(process.env.EXA_SEARCH_API_KEY || "");

        const exaTool = new ExaSearchResults({
            client,
            searchArgs: {
                numResults: 1,
                type: 'keyword',
                text: true,
            },
        })

        const result = await exaTool.invoke({query});
        const parseResult = JSON.stringify(result);

        return parseResult;
    },
    {
        name: 'search_tool',
        description: 'A tool for searching the web to find relevant information based on a query.',
        schema: z.object({
            query: z.string().describe('The search query to find relevant information.'),
        }),
    }
)