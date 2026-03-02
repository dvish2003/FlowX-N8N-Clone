import { NextResponse } from "next/server";
import { dbConnect } from "./mongodb";


export function withErrorHandler<T extends (...args: unknown[]) => Promise<unknown>>(fn: T): T {
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        try {
            await dbConnect();
            return await fn(...args) as ReturnType<T>;
        } catch (error) {
            console.error("Database operation failed:", error);
           const message = (error instanceof Error ? error.message : String(error)) || "An unexpected error occurred";
      
       return NextResponse.json({ error: message }, { status: 500 }) as ReturnType<T>;
        }
    }) as T;
}

