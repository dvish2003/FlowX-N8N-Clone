import { GoogleDriveService } from "@/lib/drive/GoogleDriveService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const service = new GoogleDriveService();

    const watchRes = await service.startWatch();

    console.log("📂 Drive Watch Response:", watchRes);

    return NextResponse.json({
      ok: true,
      message: "watch drivebox",
      data: watchRes,
    });
  } catch (error) {
    console.error("Error watching Drive inbox:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to watch drivebox",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
