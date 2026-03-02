import {CheerioWebBaseLoader} from '@langchain/community/document_loaders/web/cheerio';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const webScrapperTool = tool(
    async({webLink}) => {
        const loader = new CheerioWebBaseLoader(webLink);
        const docs = await loader.load();
        const serializeData = JSON.stringify(docs)

        return serializeData;
    },
    {
        name: 'webscapper',
        description: 'Scrapes content from a web page given its URL',
        schema: z.object({
            webLink: z.string().url().describe('The URL of the web page to scrape'),
        }),

    }
)