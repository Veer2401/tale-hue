import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function GET() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Explain how AI works in a few words",
    });
    const resp = response as unknown;
    let text = "";
    try {
      const maybe = resp as Record<string, unknown>;
      if (typeof maybe.text === "string") text = maybe.text;
      else if (typeof maybe.output_text === "string") text = maybe.output_text;
      else if (Array.isArray(maybe.candidates)) text = JSON.stringify(maybe.candidates);
      else text = JSON.stringify(resp);
    } catch {
      text = JSON.stringify(resp);
    }
    return NextResponse.json({ ok: true, text });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}


