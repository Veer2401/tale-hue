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

    console.log('Generating image for:', prompt);

    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found, using basic prompt');
      // Use the original prompt with enhancements
      const basicEnhancedPrompt = `${prompt}, photorealistic, 8K, ultra detailed, sharp focus, professional photography, vivid colors`;
      return NextResponse.json({ 
        success: true, 
        imageDescription: basicEnhancedPrompt,
        originalPrompt: prompt
      });
    }

    try {
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

      // Generate a concise, high-quality image prompt
      const result = await model.generateContent([
        {
          text: `Create a SHORT, vivid image prompt for: "${prompt}"

RULES:
- Max 20 words
- Start with main subject
- Add: photorealistic, 8K, ultra detailed, sharp focus
- Specify lighting and colors
- NO: blur, soft, bokeh, abstract

Format: [subject], photorealistic, 8K, ultra detailed, sharp focus, [lighting], [colors]

Prompt only:`
        }
      ]);

      const response = result.response;
      const enhancedPrompt = response.text().trim();

      console.log('Enhanced prompt:', enhancedPrompt);

      return NextResponse.json({ 
        success: true, 
        imageDescription: enhancedPrompt,
        originalPrompt: prompt
      });
    } catch (geminiError: any) {
      console.error('Gemini API error:', geminiError);
      // Fallback to basic enhancement if Gemini fails
      const basicEnhancedPrompt = `${prompt}, photorealistic, 8K, ultra detailed, sharp focus, professional photography, vivid colors`;
      return NextResponse.json({ 
        success: true, 
        imageDescription: basicEnhancedPrompt,
        originalPrompt: prompt
      });
    }

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
