import { NotionService } from "@/lib/notion/NotionService";
import { NextResponse } from "next/server";


type Action = 
    | {action : 'createPage', databaseId: string, title: string, properties?: Record<string, any>}
    | {action : 'getDatabaseItems', databaseId: string}
    | {action : 'listPages', databaseId: string}
    | {action : 'getdbs'; };


export async function POST(request: Request) {
    try {
        const body = (await request.json()) as Action;

        const notion = new NotionService();

        switch (body.action) {
            case 'createPage': {
                const res = await notion.createPage(
                    body.databaseId,
                    body.title,
                    'Hello from n8n, this is a page created via Notion API',
                    body.properties || {},
                );
                return NextResponse.json({
                    ok: true,
                    data: res,
                    message: 'Page created successfully',
                });
            }
            case 'getDatabaseItems':{
                const items =  await notion.getDatabaseItems( body.databaseId);
                return NextResponse.json({
                    ok: true,
                    data: items,
                    message: 'Database items retrieved successfully',
                });
            }
            case 'listPages':{
                const pages = await notion.listPages(body.databaseId);
                return NextResponse.json({
                    ok: true,
                    data: pages,
                    message: 'Pages retrieved successfully',
                });
            }
            case 'getdbs':{
                const dbs = await notion.listDatabases();
                return NextResponse.json({
                    ok: true,
                    data: dbs,
                    message: 'Databases retrieved successfully',
                });
            }
            default:
                return NextResponse.json({
                    ok: false,
                    message: 'Invalid action',
                }, { status: 400 });
        }
    } catch (error) {
        console.log("❌ Error:", error);
        return NextResponse.json(
            {
                ok: false,
                error: (error as Error).message,
            },
            {
                status: 500,
            },
        );
        
    }
}