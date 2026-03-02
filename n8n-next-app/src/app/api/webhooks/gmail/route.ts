import { processPubSubEvents } from "@/lib/gmail/processPubSubEvents";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const message = await request.json();

    const pubsubMessage = message.message;

    if (!pubsubMessage) {
      return NextResponse.json({ ok: false, error: "Invalid PubSub format" });
    }

    const decoded = JSON.parse(
      Buffer.from(pubsubMessage.data, "base64").toString("utf-8")
    );
    console.log("📨 Decoded Pub/Sub message:", decoded);

    const result = await processPubSubEvents(decoded);

    console.log("✅ Processed Pub/Sub message result:", result);
    console.log("📊 gmail received count:", result.received.length);
    console.log("📊 gmail sent count:", result.sent.length);

    if (result.sent.length > 0) {
      console.log("📤 gmail sent ids:", result.sent);
    }
    if (result.received.length > 0) {
      console.log("📥 gmail received ids:", result.received);
    }

    return NextResponse.json({
      ok: true,
      received: decoded,
      processed: result,
    });
  } catch (error) {
    console.error("Error processing Pub/Sub message:", error);
    return NextResponse.json(
      { ok: false, message: "Error processing Pub/Sub message" },
      { status: 500 }
    );
  }
}
