import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

interface ContactMessage {
  readonly name: string;
  readonly email: string;
  readonly message: string;
  readonly timestamp: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body as {
      name: string;
      email: string;
      message: string;
    };

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } },
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message too long (max 2000 characters)" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } },
      );
    }

    const entry: ContactMessage = {
      name,
      email,
      message,
      timestamp: new Date().toISOString(),
    };

    await kv.lpush("contact:messages", JSON.stringify(entry));

    return NextResponse.json(
      { success: true },
      { headers: { "Access-Control-Allow-Origin": "*" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } },
    );
  }
}

export async function GET() {
  // Retrieve messages (for your own use)
  try {
    const messages = await kv.lrange("contact:messages", 0, -1);
    return NextResponse.json({ messages, count: messages.length });
  } catch {
    return NextResponse.json({ messages: [], count: 0 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
