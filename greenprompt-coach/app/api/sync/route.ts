import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/* =========================================
   POST → Save Chat From Extension
========================================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { platform, title, messages, sourceUrl } = body;

    // Basic validation
    if (!platform || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("chats")
      .insert([
        {
          platform,
          title: title || "Untitled Chat",
          messages, // JSONB column
          source_url: sourceUrl || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase Insert Error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("POST API Error:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 500 }
    );
  }
}

/* =========================================
   GET → Fetch All Chats
========================================= */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Fetch Error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("GET API Error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}