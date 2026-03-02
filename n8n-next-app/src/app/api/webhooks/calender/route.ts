import {
  CalenderSyncStore,
  GoogleCalenderService,
} from "@/lib/calender/GoogleCalenderservice";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const headers = Object.fromEntries(request.headers);

    const state = headers["x-goog-resource-state"];
    console.log("📅 Google Calender Push", state);

    if (state === "sync") {
      console.log("🔄 Initial sync detected . . . . . . . .");

      const calender = new GoogleCalenderService(
        process.env.GOOGLE_ACCESS_TOKEN || "",
        process.env.GOOGLE_REFRESH_TOKEN || ""
      );

      const syncToken = await calender.initializeSyncToken();
      CalenderSyncStore.set(syncToken || "");

      console.log("🔐 Initialized Sync Token:", syncToken);
      return NextResponse.json({ ok: true, initialSync: true });
    }
    if (state === "exists") {
      const calender = new GoogleCalenderService(
        process.env.GOOGLE_ACCESS_TOKEN || "",
        process.env.GOOGLE_REFRESH_TOKEN || ""
      );
      let syncToken = CalenderSyncStore.get();
      if (!syncToken) {
        console.log("⚠️ No sync token found, initializing . . . . . . . .");
        syncToken = (await calender.initializeSyncToken()) ?? null;
        CalenderSyncStore.set(syncToken || "");
        console.log("🔐 Initialized Sync Token:", syncToken);
        return NextResponse.json({ ok: true });
      }
      const res = await calender.fecthChanges(syncToken);

      if (!res) {
        console.log("⏰ sync token expired, reinitializing . . . . . . . .");

        const newToken = await calender.initializeSyncToken();
        CalenderSyncStore.set(newToken || "");
        console.log("🔁 Reinitialized Sync Token:", newToken);
        return NextResponse.json({ ok: true });
      }
      const { events, nextSyncToken } = res;
      CalenderSyncStore.set(nextSyncToken || "");

      for (const event of events) {
        console.log("🗓️ Event:", event);
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error processing Calendar webhook:", error);
    return NextResponse.json(
      { ok: false, message: "Error processing Calendar webhook" },
      { status: 500 }
    );
  }
}
