import { withErrorHandler } from "@/lib/mongodb/withErrorHandler";
import { UserService } from "@/services/user/UserService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { google } from "googleapis";

export const GET = withErrorHandler(async (req: any) => {
  const session = await getServerSession(authOptions);
  const user = session?.user as any; 

  if (!session || !user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const spreadsheetId = searchParams.get("spreadsheetId");

  if (!spreadsheetId) {
      return NextResponse.json({ error: "Spreadsheet ID is required" }, { status: 400 });
  }

  const userService = UserService.getInstance();
  const dbUser = await userService.findUserByEmail(user.email);

  if (!dbUser || !dbUser.googleAccessToken) {
     return NextResponse.json({ error: "Google account not connected" }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
      access_token: dbUser.googleAccessToken,
      refresh_token: dbUser.googleRefreshToken
  });

  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  
  const res = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets(properties(title))"
  });

  const sheetNames = (res.data.sheets || [])
     .map(s => s.properties?.title)
     .filter(Boolean);

  return NextResponse.json({ sheets: sheetNames });
});
