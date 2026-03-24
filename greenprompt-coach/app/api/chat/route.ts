import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export const runtime = "nodejs";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: messages, // 👈 use frontend messages
    });

    return NextResponse.json({
      reply: {
        role: "assistant",
        content: response.choices[0].message.content,
      },
    });

  } catch (error: any) {
    console.error("FULL GROQ ERROR:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}