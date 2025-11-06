import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log('Generating image with OpenRouter for:', prompt);

    // First, enhance the prompt using Gemini
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
        text: `You are a professional image prompt engineer. Create a SHORT, PRECISE prompt for "${prompt}".

RULES:
1. Keep it 1-2 sentences MAX
2. Start with the MAIN SUBJECT clearly
3. ALWAYS include: "ultra sharp, highly detailed, professional photography, 8K, crisp focus"
4. Use simple, direct language
5. Avoid: blur, soft, dreamy, ethereal, bokeh, shallow depth of field
6. Specify exact colors if relevant

Example format: "[Main subject], ultra sharp, highly detailed, professional photography, 8K, crisp focus, [specific lighting], [exact colors], [style]"

Generate ONLY the prompt, nothing else:`
      }
    ]);

    const response = result.response;
    const enhancedPrompt = response.text().trim();

    console.log('Enhanced prompt:', enhancedPrompt);

    // Return the enhanced prompt for the frontend to generate the image
    // Using Pollinations AI (free, fast, reliable)
    // Note: OpenRouter doesn't have google/gemini-2.0-flash-exp:image-generation model available
    return NextResponse.json({ 
      success: true, 
      imageDescription: enhancedPrompt,
      originalPrompt: prompt
    });

  } catch (error: any) {
    console.error('Error generating image:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate image', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
