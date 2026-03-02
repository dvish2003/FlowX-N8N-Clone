import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  if (body.type === "url_verification") {
    console.log("Slack URL verification challenge received");
    return NextResponse.json({ challenge: body.challenge });
  }

  if (body.type === "event_callback") {
    const event = body.event;

    const payload = {
      text: event?.text,
      channel: event?.channel,
      user: event?.user,
    };

    if (event?.type === "message" && !event?.subtype && !event?.bot_id) {
      console.log("New Slack message event received:", payload);
    }

    if (event?.type === "channel_created") {
      console.log("channel created.........");
    }
    if (event?.type === "file_created") {
      console.log("file created.........");
    }

    if (event?.type === "file_deleted") {
      console.log("file deleted.........");
    }
    if (event?.type === "file_shared") {
      console.log("file shared.........", event?.file_id);
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
