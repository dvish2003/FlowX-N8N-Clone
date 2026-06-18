import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb/mongodb";
import { User } from "@/models/userSchema";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, code, password } = await req.json();

    if (!email || !code || !password) {
      return NextResponse.json(
        { message: "Email, code, and new password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.resetPasswordCode || user.resetPasswordCode !== code) {
      return NextResponse.json(
        { message: "Invalid reset code" },
        { status: 400 }
      );
    }

    if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
      return NextResponse.json(
        { message: "Reset code has expired" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    
    // Clear reset fields
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    
    // Auto-verify if they were somehow unverified
    user.isVerified = true;
    
    await user.save();

    return NextResponse.json(
      { message: "Password reset successfully. You can now login." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
