import { GoogleSheetService } from "@/lib/google-sheet/GoogleSheetService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const body: Partial<{ name: string; email: string; city: string }> = {};

    const sheet = new GoogleSheetService({
      spreadsheetId: "1Gg48mMOhaxVx-_dOfrgxt7UmFHV8lDDSbBbxs_wqciY",
      sheetName: "Sheet1",
      accessToken: process.env.GOOGLE_ACCESS_TOKEN || "",
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN || "",
      columns: ["name", "email", "phone","createdAt"],
    });



    const res = await sheet.insertRow({
      name:body.name || "Vishan chathuranga",
      email:body.email || "vishanchathuranga81@gmail.com",
      city:body.city || "Kalutara",
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      ok: true,
      result: res,
    })
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
