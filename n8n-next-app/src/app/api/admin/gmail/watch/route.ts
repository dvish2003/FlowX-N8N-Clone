import { GoogleGmailService } from "@/lib/gmail/gmailService";
import { NextResponse } from "next/server"; 


export async function GET(){
    try {
        const gmail = new GoogleGmailService(
            process.env.GOOGLE_ACCESS_TOKEN as string,
            process.env.GOOGLE_REFRESH_TOKEN as string
        );

        const watchRes = await gmail.startWatch();

        console.log("✅📧 Gmail Watch Response:", watchRes);

        return NextResponse.json({ 
            ok: true,
            message: 'watch gmailbox',
            data: watchRes
        });
    } catch (error) {
        console.error("Error watching Gmail inbox:", error);
        return NextResponse.json({ 
            ok: false,
            message: 'Failed to watch gmailbox',
            error: (error as Error).message
        }, { status: 500 });
        
    }
}