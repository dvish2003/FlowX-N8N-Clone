import { Client } from '@notionhq/client';
import { url } from 'inspector';

export class NotionService {
    private notion:Client

    constructor() {
        this.notion = new Client({ auth: process.env.NOTION_API_KEY });
    }

    async createPage(databaseId: string, title: string, description: string,extraProperties: Record<string, any>={}) {
        try {
            const response = await this.notion.pages.create({
                parent: { 
                    type: 'database_id',
                    database_id: databaseId
                 },
                properties: {
                   "Task Name": {
                        title: [
                            {
                                text: {
                                    content: title,
                                }
                            }
                        ]
                   }
                   ,
                     "Description": {
                        rich_text: [
                            {
                                text: {
                                    content: description,
                                }
                            }
                        ]
                     },
                        ...extraProperties
                },
            });
            return response;
        } catch (error) {
            throw error;
        }
    }

    async getDatabaseItems(databaseId: string) {
        try {
              const response = await this.notion.databases.query({
                database_id: databaseId,
              });
              return response.results;
        } catch (error) {
            throw error;
            
        }
    }


    async listPages(database_id: string) {
        try {
            const response = await this.notion.databases.query({
                database_id,
            });
            const pages = response.results.map((r:any) =>({
                id: r.id,
                title: r.properties?.Name?.title[0]?.plain_text || 'No Title',
            }))
            return pages
        } catch (error) {
            throw error;
        }
    }

    async listDatabases() {
        try {
            const response = await this.notion.search({
                filter: {
                    property: 'object',
                    value: 'database',
                }
            })


            const databases = response.results.map((db:any) => ({
                id: db.id,
                title: db.title?.[0]?.plain_text || 'No Title',
                url: db.url,
            }))
             
            return databases;
        } catch (error) {
            throw error;
        }
    }
}