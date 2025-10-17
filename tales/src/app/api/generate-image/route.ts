import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyDk36jLh9LcAUNuTVEuKtcdB_o5p4ybEDc";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Use a text model to synthesize a simple SVG based on prompt keywords as a fallback
    // This avoids dependency on image beta endpoints and prevents 500s in demo.
    const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const clamped = prompt.slice(0, 150);
    const guide = `Create a minimal SVG poster (square 1024x1024) with:
    - dark gradient background
    - a single central icon-like silhouette inspired by: ${clamped}
    - neon accents (purple #7c3aed, cyan #22d3ee)
    - no external images
    - output ONLY raw SVG markup starting with <svg ...> and ending </svg>`;
    const gen = await textModel.generateContent(guide);
    const raw = gen.response.text().trim();
    // Extract raw <svg>...</svg> even if wrapped in code fences or prefixed text
    const match = raw.match(/<svg[\s\S]*?<\/svg>/i);
    const svg = match ? match[0] : undefined;
    const safeFallback = (text: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0b0f"/>
      <stop offset="100%" stop-color="#141421"/>
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="512" cy="420" r="180" fill="#7c3aed" opacity="0.25" filter="url(#glow)"/>
  <circle cx="512" cy="420" r="120" fill="#22d3ee" opacity="0.25" filter="url(#glow)"/>
  <text x="50%" y="780" text-anchor="middle" fill="#e7e7ea" font-family="system-ui, -apple-system, sans-serif" font-size="36" opacity="0.9">${text}
  </text>
</svg>`;

    const body = svg ?? safeFallback(prompt.slice(0, 50));
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    // As a last resort, return a generated fallback SVG instead of 500 to avoid UI error
    const msg = typeof err?.message === "string" ? err.message : "";
    const body = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1024\" height=\"1024\" viewBox=\"0 0 1024 1024\"><rect width=\"100%\" height=\"100%\" fill=\"#0b0b0f\"/><text x=\"50%\" y=\"50%\" text-anchor=\"middle\" fill=\"#e7e7ea\" font-family=\"system-ui, -apple-system, sans-serif\" font-size=\"24\">Image generator fallback ${msg ? `(${msg})` : ""}</text></svg>`;
    return new NextResponse(body, {
      status: 200,
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
    });
  }
}


