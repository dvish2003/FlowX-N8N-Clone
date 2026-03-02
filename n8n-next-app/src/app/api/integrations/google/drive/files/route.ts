import { withErrorHandler } from "@/lib/mongodb/withErrorHandler";
import { UserService } from "@/services/user/UserService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { google } from "googleapis";

export const GET = withErrorHandler(async (req) => {
  const session = await getServerSession(authOptions);
  
  // Need to cast session as any because default type doesn't have user.id often
  const user = session?.user as any; 

  if (!session || !user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  
  // Search for Google Sheets
  console.log(`🔍 Searching for sheets for user: ${user.email}`);
  
  try {
    const res = await drive.files.list({
        // Filter for Google Sheets (mimetype) and not trashed
        q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
        // Return ID and Name
        fields: 'files(id, name)',
        // Order by most recently modified
        orderBy: 'modifiedTime desc',
        pageSize: 100
    });

    console.log(`✅ Found ${res.data.files?.length || 0} sheets`);
    return NextResponse.json({ files: res.data.files || [] });
  } catch (error: any) {
    console.error("❌ Drive List Error:", error?.response?.data || error);
    return NextResponse.json({ error: error.message, details: error?.response?.data }, { status: 500 });
  }
});
