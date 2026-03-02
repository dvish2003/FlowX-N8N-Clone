import { NextResponse } from "next/server";
import { UserService } from "@/services/user/UserService";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const userService = UserService.getInstance();
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await userService.registerUser({
      email,
      password,
      name,
      verificationCode,
    });

    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json(
      { message: "Verification code sent to email" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
