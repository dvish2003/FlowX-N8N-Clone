import { GoogleCalenderService } from "@/lib/calender/GoogleCalenderservice";
import { NextResponse } from "next/server";




export async function GET(){
    try {
        const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
        const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

        if (!accessToken || !refreshToken) {
            return NextResponse.json({ error: "Missing Google Calendar credentials." }, { status: 500 });
        }

        const calender = new GoogleCalenderService(accessToken, refreshToken);
        const res = await calender.watchCalendar();


        console.log("📅 Calendar Watch Response:", res);



        return NextResponse.json({ ok: true,watch:res });
    } catch (error) {
        console.error("❌ Failed to watch calendar:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}