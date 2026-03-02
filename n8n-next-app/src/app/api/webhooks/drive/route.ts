import { GoogleDriveService } from "@/lib/drive/GoogleDriveService";
import { dbConnect } from "@/lib/mongodb/mongodb";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const DriveTokenStore = {
  async get() {
    await dbConnect();
    const col = mongoose.connection.db?.collection<{ _id: string; value: string }>("kv");
    const doc = await col?.findOne({
      _id: "google-drive:lastPageToken",
    });
    return doc?.value as string | null;
  },
  async set(token: string) {
    console.log("💾 Store token:", token);
    await dbConnect();
    const col = mongoose.connection.db?.collection<{ _id: string; value: string }>("kv");
    await col?.updateOne(
      { _id: "google-drive:lastPageToken" },
      { $set: { value: token } },
      { upsert: true }
    );
  },
};

export async function POST(req: Request) {
  const headers = Object.fromEntries(req.headers);

  const resourceState = headers["x-goog-resource-state"];
  const resourceId = headers["x-goog-resource-id"];

  console.log("🔔 Resource state:", resourceState);
  console.log("🆔 Resource id:", resourceId);
  try {
    const service = new GoogleDriveService();

    let pageToken = await DriveTokenStore.get();

    if (!pageToken) {
      console.log("🧭 No page token found, fetching initial token...");
      pageToken = await service.getStartPageToken();
      if (!pageToken) {
        throw new Error("Failed to fetch initial page token.");
      }
      await DriveTokenStore.set(pageToken);
      console.log("✅ Initial page token set:", pageToken);
    }
    const data = await service.getChanges(pageToken);

    if (data.newStartPageToken) {
      await DriveTokenStore.set(data.newStartPageToken);
    }
    for (const change of data.changes ?? []) {
      if (!change.file) {
        console.log("🗑️ File deleted or not accessible:", {
          fileId: change.fileId,
        });
      } else if (change.file.trashed) {
        console.log("🧺 File trashed:", {
          fileId: change.fileId,
          fileName: change.file.name,
        });
      } else {
        console.log("📝 File created/updated:", {
          fileId: change.fileId,
          fileName: change.file.name,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Error handling Drive webhook:", error);
    return NextResponse.json({ ok: false, error: (error as Error).message });
  }
}
