import { withErrorHandler } from "@/lib/mongodb/withErrorHandler";
import { UserService } from "@/services/user/UserService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export const GET = withErrorHandler(async (req) => {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ connected: false });
  }

  const userService = UserService.getInstance();
  const dbUser = await userService.findUserByEmail(session.user.email);

  // Check if we have valid tokens
  const isConnected = !!(dbUser && dbUser.googleAccessToken && dbUser.googleRefreshToken);

  return NextResponse.json({ 
      connected: isConnected,
      email: dbUser?.email || session.user.email
  });
});
