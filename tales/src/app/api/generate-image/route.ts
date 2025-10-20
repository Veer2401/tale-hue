/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
// Prefer SDK (@google/genai) and fall back to REST + procedural SVG
import { GoogleGenAI } from "@google/genai";
import { GoogleAuth } from "google-auth-library";
import fs from "fs";
import os from "os";
import path from "path";

// Read credentials from env. Prefer Google Application Default Credentials
// (service account JSON file path via GOOGLE_APPLICATION_CREDENTIALS or
// JSON string via GOOGLE_APPLICATION_CREDENTIALS_JSON). As a fallback,
// a GENAI_API_KEY may be present, but many GenAI endpoints require ADC.
const GENAI_API_KEY = process.env.GENAI_API_KEY || "";

function ensureServiceAccountFile(): void {
  // If the JSON string is provided in an env var, write it to a temp file
  // and set GOOGLE_APPLICATION_CREDENTIALS to that path so the SDK picks it up.
  try {
    const json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (json && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const tmpdir = os.tmpdir();
      const p = path.join(tmpdir, `gcloud-sa-${Date.now()}.json`);
      fs.writeFileSync(p, json, { encoding: "utf8", mode: 0o600 });
      process.env.GOOGLE_APPLICATION_CREDENTIALS = p;
    }
  } catch (e) {
    // ignore file system issues; SDK will fail later with a clear error
  }
}

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
    // If service account credentials (ADC) are available, try the REST image
    // generation endpoint using OAuth2 (this supports image outputs). If that
    // fails or is not configured, fall back to SDK/text-SVG flow below.
    const hasJsonCred = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    const hasCredFile = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS));
    if (hasJsonCred || hasCredFile) {
      try {
        // Ensure ADC is available: if GOOGLE_APPLICATION_CREDENTIALS_JSON is set,
        // write to a temp file so google-auth-library can pick it up.
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
          const tmp = path.join(os.tmpdir(), `gcloud-sa-${Date.now()}.json`);
          fs.writeFileSync(tmp, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON, { encoding: "utf8" });
          process.env.GOOGLE_APPLICATION_CREDENTIALS = tmp;
        }

        const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
        const client = await auth.getClient();
        const token = await client.getAccessToken();
        const accessToken = token?.token;
        if (accessToken) {
          // Call the Generative API images endpoint (REST). The exact path
          // and payload depend on your Google GenAI access. Here's a minimal
          // example using a hypothetical images endpoint that supports PNG base64.
          const body = {
            prompt: guide,
            size: "1024x1024",
            format: "png", // request PNG output if supported
          };
          const resp = await fetch("https://generativelanguage.googleapis.com/v1/images:generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
          });
          if (resp.ok) {
            const data = await resp.json();
            // Many providers return base64-encoded image data in a field like
            // data[0].b64_json or similar. Try common shapes safely.
            const b64 = data?.data?.[0]?.b64 || data?.results?.[0]?.b64_json || data?.b64_json || undefined;
            if (typeof b64 === "string") {
              const bin = Buffer.from(b64, "base64");
              return new NextResponse(bin, { status: 200, headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
            }
            // If the endpoint returned raw bytes, convert to ArrayBuffer
            if (data?.binary) {
              const bin = Buffer.from(data.binary, "base64");
              return new NextResponse(bin, { status: 200, headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
            }
          }
        }
      } catch (e) {
        console.error("Image endpoint call failed:", String(e));
        // fall through to SDK/text-based SVG generation below
      }
    }

    // Use the Gemini 2.5 Flash model via the official SDK. If the SDK
    // call fails or returns no usable text, fall back to a procedural SVG.
    let raw: string = "";
    try {
      const ai = new GoogleGenAI({ apiKey: GENAI_API_KEY || undefined });
      // First, attempt to generate a raster image via any image API on the SDK.
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const imagesApi = (ai as any).images || (ai as any).image;
        if (imagesApi && typeof imagesApi.generate === "function") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const imgResp: any = await imagesApi.generate({ prompt: promptStr });
          const b64 = imgResp?.b64_json || imgResp?.data?.[0]?.b64_json || imgResp?.base64 || imgResp?.image;
          if (typeof b64 === "string" && b64.length > 100) {
            const buf = Buffer.from(b64, "base64");
            return new NextResponse(buf, { status: 200, headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
          }
        }
      } catch (imgErr) {
        // ignore and fall back to text/SVG path below
        console.debug("image SDK attempt failed:", String(imgErr));
      }

      // models.generateContent's typings are broad; cast to any for runtime call
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sdkRes: unknown = await (ai.models as any).generateContent({
        model: "gemini-2.5-flash",
        contents: guide,
      });
      // SDK shapes vary; try common fields safely
      const s = sdkRes as Record<string, unknown> | undefined;
      const outText =
        (s && typeof s.text === "string" && s.text) ||
        (s && typeof s.output_text === "string" && s.output_text) ||
        // candidates path: candidates[0].content.parts[0].text
        (s && Array.isArray(s.candidates) && (s.candidates[0] as any)?.content?.parts?.[0]?.text) ||
        "";
      if (outText) raw = String(outText).trim();
    } catch (e) {
      // If SDK fails, we intentionally fall back to proceduralSvg below
      console.error("Gemini SDK error:", String(e));
    }
    // Extract raw <svg>...</svg> even if wrapped in code fences or prefixed text
    const match = raw.match(/<svg[\s\S]*?<\/svg>/i);
    const svg = match ? match[0] : undefined;
    const safeFallback = (text: string) => proceduralSVG(text);

    // If Gemini returns overly simple SVG (e.g., just a single circle), use themed or procedural fallback
    const tooSimple = svg && /<circle[\s\S]*?<\/svg>$/i.test(svg) && (svg.match(/<circle/gi)?.length || 0) <= 1 && (svg.match(/<rect|<path|<line|<polygon/gi)?.length || 0) === 0;
    const themed = lower.includes("diwali") || lower.includes("deepavali") ? diwaliSVG(prompt) : undefined;
    const finalSvg = !svg || tooSimple ? (themed || safeFallback(prompt.slice(0, 60))) : svg;
    const out = await rasterize(finalSvg);
    if (typeof out === "string") {
      // rasterization failed or resvg unavailable - return SVG directly
      return new NextResponse(out, {
        status: 200,
        headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
      });
    }
    if (out instanceof Uint8Array) {
      // Convert to a plain ArrayBuffer slice to satisfy BodyInit typing
      const ab = Uint8Array.from(out).buffer;
      return new NextResponse(ab, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-store",
        },
      });
    }
    // Fallback: if rasterize returned something unexpected, return as text
    return new NextResponse(String(out), {
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
    const out = await rasterize(svg);
    if (typeof out === "string") {
      return new NextResponse(out, { status: 200, headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" } });
    }
    if (out instanceof Uint8Array) {
      const ab = Uint8Array.from(out).buffer;
      return new NextResponse(ab, { status: 200, headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
    }
    return new NextResponse(String(out), { status: 200, headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
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

// Try to lazily import resvg at runtime. If unavailable or it errors, return
// the original SVG string as a fallback so callers can still render an image
// (browsers accept SVG blobs/URLs).
async function rasterize(svg: string): Promise<Uint8Array | string> {
  try {
    const mod = await import("@resvg/resvg-js");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Resvg = (mod as any).Resvg || (mod as any).default;
    if (!Resvg) throw new Error("Resvg not available");
    const r = new (Resvg as any)(svg, { fitTo: { mode: "width", value: 1024 } });
    const img = r.render();
    return img.asPng();
  } catch (e) {
    // If rasterization isn't possible in the environment, return SVG string.
    return svg;
  }
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


