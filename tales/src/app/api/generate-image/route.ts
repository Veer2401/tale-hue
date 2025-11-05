import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log('Generating image description for:', prompt);

    // Use Gemini 2.0 Flash Experimental (proven to work with current SDK)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 1.2,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 500,
      }
    });

    // Generate an ultra-detailed, creative image prompt
    const result = await model.generateContent([
      {
        text: `You are a world-class creative director and visual artist with expertise in cinematic photography, digital art, and modern aesthetic trends.

User's Story: "${prompt}"

Create an EXTREMELY DETAILED, visually rich image generation prompt (4-5 sentences) that will produce a stunning, professional-quality image.

REQUIREMENTS:
1. VISUAL STYLE - Pick ONE specific style that matches the story's mood:
   • Cinematic photography (film grain, bokeh, shallow depth of field)
   • Dreamy soft aesthetic (pastel colors, ethereal glow, soft focus)
   • Cyberpunk/neon noir (vibrant neon, rain-slicked streets, dramatic lighting)
   • Hyper-realistic 3D render (perfect lighting, ray tracing, photorealistic)
   • Watercolor illustration (flowing colors, artistic, hand-painted feel)
   • Anime/manga style (bold outlines, vibrant colors, expressive)
   • Minimalist modern (clean lines, negative space, bold single colors)
   • Vintage/retro aesthetic (film photography, warm tones, nostalgic)
   • Fantasy art (magical, glowing elements, otherworldly)
   • Street photography (candid, authentic, urban)

2. COMPOSITION & FRAMING:
   • Specify camera angle, perspective, focal point
   • Describe foreground, midground, background elements
   • Rule of thirds, leading lines, or golden ratio

3. COLOR GRADING:
   • Exact color palette (not just "vibrant" - specify hues)
   • Color temperature (warm/cool)
   • Saturation and contrast levels

4. LIGHTING:
   • Type: golden hour, blue hour, harsh midday, soft diffused, neon, rim lighting, etc.
   • Direction and intensity
   • Atmospheric effects: god rays, lens flares, shadows

5. MOOD & ATMOSPHERE:
   • Weather conditions, time of day, season
   • Emotional tone and energy
   • Environmental details (fog, rain, dust particles, sparkles)

6. TECHNICAL QUALITY:
   • Resolution/detail level
   • Photography specs (if photo-realistic): lens type, aperture, film stock
   • Art medium specifics (if illustrated): brush strokes, texture, style

Output ONLY the ultra-detailed image prompt. No preamble, no explanations. Make it so vivid and specific that the AI can perfectly visualize every element.`
      }
    ]);

    const response = result.response;
    const imageDescription = response.text();

    console.log('Generated description:', imageDescription);

    return NextResponse.json({ 
      success: true, 
      imageDescription: imageDescription.trim(),
      originalPrompt: prompt
    });

  } catch (error: any) {
    console.error('Error generating image description:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate image description', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
