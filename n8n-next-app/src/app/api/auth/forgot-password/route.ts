import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb/mongodb";
import { User } from "@/models/userSchema";
import { sendResetPasswordEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email: rawEmail } = await req.json();

    if (!rawEmail) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const email = rawEmail.toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "No user found with this email address" },
        { status: 404 }
      );
    }

    // Generate a 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = expires;
    await user.save();

    await sendResetPasswordEmail(email, resetCode);

    return NextResponse.json(
      { message: "Password reset code sent to email" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
