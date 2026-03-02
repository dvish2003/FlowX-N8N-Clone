import { dbConnect } from "./mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export function withAuth<T extends (...args: any[]) => Promise<Response>>(fn: T): T {
  const wrapped = (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      await dbConnect();

      const session = await getServerSession(authOptions);

      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) as ReturnType<T>;
      }

      return (await fn(...args)) as ReturnType<T>;
    } catch (error: any) {
      console.error("Authentication failed:", error);

      const message = error?.message || "An unexpected error occurred during authentication";
      return NextResponse.json({ error: message }, { status: 500 }) as ReturnType<T>;
    }
  });

  return wrapped as unknown as T;
}