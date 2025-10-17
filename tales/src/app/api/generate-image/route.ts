import { NextRequest, NextResponse } from "next/server";
// Prefer SDK (@google/genai) and fall back to REST + procedural SVG
import { GoogleGenAI } from "@google/genai";
import { Resvg } from "@resvg/resvg-js";

const GEMINI_API_KEY = "AQ.Ab8RN6JzU3ZMV_KAY2ThfUJZcf5-ISt_7wN0P4qWHnjIt3RlPQ";

export async function POST(req: NextRequest) {
  let lower = "";
  let promptStr = "";
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }
    promptStr = prompt;
    lower = prompt.toLowerCase();

    const clamped = prompt.slice(0, 150);
    const guide = `You are an SVG illustrator. Output ONLY raw <svg>...</svg> (no markdown fences). Create a detailed square poster (1024x1024) for: "${clamped}".
Must include:
- Recognizable themed elements (avoid purely abstract)
- Layered gradient background, subtle glow/grain filters
- Accents using #7c3aed and #22d3ee
- Short caption (<=5 words) at bottom
- No external images or <image> tags`;
    // 1) Try the new SDK first (gemini-2.5-flash)
    let raw: string = "";
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const sdkRes = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: guide,
      } as any);
      const outText: string = (sdkRes as any)?.text || (sdkRes as any)?.output_text || "";
      if (outText) {
        raw = outText.trim();
      }
    } catch {}

    // 2) If no result, try v1 REST models cascade
    const modelCandidates = [
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b-latest",
      "gemini-1.5-flash-8b",
      "gemini-1.5-pro-latest",
      "gemini-1.5-pro",
    ];
    for (const modelName of modelCandidates) {
      try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: guide }] }] }),
        });
        if (!resp.ok) {
          continue;
        }
        const data: any = await resp.json();
        raw = raw || (data?.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
        if (raw) break;
      } catch {}
    }
    // Extract raw <svg>...</svg> even if wrapped in code fences or prefixed text
    const match = raw.match(/<svg[\s\S]*?<\/svg>/i);
    const svg = match ? match[0] : undefined;
    const safeFallback = (text: string) => proceduralSVG(text);

    // If Gemini returns overly simple SVG (e.g., just a single circle), use themed or procedural fallback
    const tooSimple = svg && /<circle[\s\S]*?<\/svg>$/i.test(svg) && (svg.match(/<circle/gi)?.length || 0) <= 1 && (svg.match(/<rect|<path|<line|<polygon/gi)?.length || 0) === 0;
    const themed = lower.includes("diwali") || lower.includes("deepavali") ? diwaliSVG(prompt) : undefined;
    const finalSvg = !svg || tooSimple ? (themed || safeFallback(prompt.slice(0, 60))) : svg;
    const png = rasterize(finalSvg);
    return new NextResponse(png as any, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    // As a last resort, return a generated fallback SVG instead of 500 to avoid UI error
    const msg = typeof err?.message === "string" ? err.message : "";
    const svg = (lower.includes("diwali") || lower.includes("deepavali")) ? diwaliSVG(promptStr) : proceduralSVG(msg || "Tale Hue");
    const png = rasterize(svg);
    return new NextResponse(png as any, { status: 200, headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
  }
}

// Simple prompt-hashed procedural SVG generator to ensure variety and richness
function proceduralSVG(text: string): string {
  const seed = hashString(text);
  const rand = mulberry32(seed);
  const w = 1024, h = 1024;
  const p1 = pick(rand, ["#0b0b0f", "#0d0d14", "#0e0e12"]);
  const p2 = pick(rand, ["#141421", "#121227", "#10101f"]);
  const accent1 = pick(rand, ["#7c3aed", "#a78bfa", "#8b5cf6"]);
  const accent2 = pick(rand, ["#22d3ee", "#67e8f9", "#06b6d4"]);
  const shapes = generateShapes(rand, accent1, accent2, 4 + Math.floor(rand() * 3));
  const caption = text.split(/\s+/).slice(0, 5).join(" ");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p1}"/>
      <stop offset="100%" stop-color="${p2}"/>
    </linearGradient>
    <filter id="noise" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" in2="n" mode="soft-light"/>
    </filter>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  ${shapes}
  <text x="50%" y="960" text-anchor="middle" fill="#e7e7ea" font-family="system-ui, -apple-system, sans-serif" font-size="32" opacity="0.85">${escapeXml(caption)}</text>
</svg>`;
}

// Handcrafted Diwali-themed SVG with diyas, rangoli, and fireworks accents
function diwaliSVG(text: string): string {
  const title = escapeXml(text.split(/\s+/).slice(0, 3).join(" "));
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="night" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#121221"/>
      <stop offset="100%" stop-color="#0b0b0f"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#night)"/>
  <!-- Rangoli -->
  <g transform="translate(512,620)">
    <circle r="130" fill="none" stroke="#22d3ee" stroke-width="2" opacity="0.6" />
    <circle r="90" fill="none" stroke="#7c3aed" stroke-width="2" opacity="0.6" />
    <g fill="none" stroke="#a78bfa" opacity="0.8">
      ${Array.from({length:12}).map((_,i)=>`<path d="M0,-90 C20,-70 20,-40 0,-20 C-20,-40 -20,-70 0,-90" transform="rotate(${i*30})"/>`).join('')}
    </g>
  </g>
  <!-- Diyas -->
  ${[360, 512, 664].map((x,i)=>`
    <g transform="translate(${x},760)">
      <ellipse rx="70" ry="26" fill="#2b2b3a" />
      <path d="M -70 0 Q 0 -40 70 0 Q 0 40 -70 0 Z" fill="#3b3b4f" />
      <g filter="url(#glow)">
        <path d="M0 -18 C 8 -30 16 -42 0 -60 C -16 -42 -8 -30 0 -18" fill="#ffcc66"/>
        <circle cx="0" cy="-24" r="6" fill="#ffeeaa"/>
      </g>
    </g>
  `).join('')}
  <!-- Fireworks -->
  ${[ [180,220],[820,180],[700,320] ].map(([x,y])=>`
    <g transform="translate(${x},${y})" stroke="#22d3ee" stroke-width="2" opacity="0.9" filter="url(#glow)">
      ${Array.from({length:10}).map((_,i)=>`<line x1="0" y1="0" x2="0" y2="-40" transform="rotate(${i*36})"/>`).join('')}
    </g>
  `).join('')}
  <text x="50%" y="940" text-anchor="middle" fill="#e7e7ea" font-family="system-ui, -apple-system, sans-serif" font-size="34" opacity="0.95">${title}</text>
</svg>`;
}

function rasterize(svg: string): Uint8Array {
  const r = new Resvg(svg, { fitTo: { mode: "width", value: 1024 } });
  const img = r.render();
  return img.asPng();
}

function generateShapes(rand: () => number, a1: string, a2: string, count: number): string {
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const t = rand();
    if (t < 0.33) {
      const cx = 150 + rand() * 724;
      const cy = 180 + rand() * 600;
      const r = 40 + rand() * 200;
      const c = i % 2 === 0 ? a1 : a2;
      parts.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${c}" opacity="0.22" filter="url(#glow)"/>`);
    } else if (t < 0.66) {
      const x = 80 + rand() * 760;
      const y = 120 + rand() * 560;
      const w = 80 + rand() * 300;
      const h = 60 + rand() * 260;
      const c = i % 2 === 0 ? a2 : a1;
      const rx = 12 + rand() * 40;
      parts.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${rx.toFixed(1)}" fill="${c}" opacity="0.16" filter="url(#glow)"/>`);
    } else {
      const x1 = 100 + rand() * 700;
      const y1 = 160 + rand() * 500;
      const x2 = x1 + (-150 + rand() * 300);
      const y2 = y1 + (-150 + rand() * 300);
      const c = i % 2 === 0 ? a1 : a2;
      parts.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c}" stroke-width="${(2 + rand() * 6).toFixed(1)}" opacity="0.5" filter="url(#glow)"/>`);
    }
  }
  return parts.join("\n  ");
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] as string));
}


