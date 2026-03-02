import { NextResponse } from "next/server";
import { UserService } from "@/services/user/UserService";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { message: "Email and code are required" },
        { status: 400 }
      );
    }

    const userService = UserService.getInstance();
    await userService.verifyUser(email, code);

    return NextResponse.json(
      { message: "Account verified successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
