import { GoogleGmailService } from "@/lib/gmail/gmailService";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Action =
  | {
      action: "sendEmail";
      accessToken: string;
      refreshToken: string;
      to: string;
      subject: string;
      message: string;
    }
  | {
      action: "listMessages";
      accessToken: string;
      refreshToken: string;
      maxResult?: number;
      query?: string;
    }
  | {
      action: "getMessage ";
      accessToken: string;
      refreshToken: string;
      messageId: string;
    }
  | {
      action: "deleteMessage";
      accessToken: string;
      refreshToken: string;
      messageId: string;
    }
  | {
      action: "listHistory";
      accessToken: string;
      refreshToken: string;
      messageId: string;
    };

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Action;
    const gmail = new GoogleGmailService(body.accessToken, body.refreshToken);

    switch (body.action) {
      case "sendEmail": {
        await gmail.sendEmail({
          to: "vishanchathuranga81@gmail.com",
          subject: "Testing n8n gmail",
          message: "Hello Vishan I am testing from n8n gmail integration!",
        });
        return NextResponse.json({
          ok: true,
          message: "Email Sent Successfully",
        });
      }

      case "listMessages": {
        const messages = await gmail.listMessages(body.maxResult ?? 10, body.query);
        return NextResponse.json({ ok: true, messages });
      }
        case "getMessage ": {
        const message = await gmail.getMessage(body.messageId);
        return NextResponse.json({ ok: true, message });
      }

      case "listHistory": {
        const history = await gmail.listHistory(body.messageId);
        return NextResponse.json({ ok: true, history });
      }
    }
  } catch (error: unknown) {
    console.error("Error in Gmail admin route:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
