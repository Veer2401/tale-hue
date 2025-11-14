import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

    // Retry logic for Gemini API with exponential backoff
    let enhancedPrompt = '';
    let retries = 3;
    
    while (retries > 0) {
      try {
        // First, enhance the prompt using Gemini 2.0
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.0-flash-exp',
          generationConfig: {
            temperature: 0.9,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 300,
          }
        });

        // Generate a concise, high-quality image prompt
        const result = await model.generateContent([
          {
            text: `Create a SHORT, vivid image prompt for: "${prompt}"

RULES:
- Max 15 words
- Start with main subject
- Add: photorealistic, 8K, ultra detailed, sharp focus
- Specify lighting and colors
- NO: blur, soft, bokeh, abstract

Format: [subject], photorealistic, 8K, ultra detailed, sharp focus, [lighting], [colors]

Prompt only:`
          }
        ]);

        const response = result.response;
        enhancedPrompt = response.text().trim();

        console.log('Enhanced prompt:', enhancedPrompt);
        break; // Success, exit retry loop
        
      } catch (geminiError: any) {
        retries--;
        console.error(`Gemini API error (${3 - retries}/3):`, geminiError.message);
        
        if (retries === 0) {
          // All retries exhausted, use fallback
          console.warn('All Gemini retries exhausted, using fallback');
          enhancedPrompt = `${prompt}, photorealistic, 8K, ultra detailed, sharp focus, professional photography, vivid colors`;
        } else {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, (3 - retries) * 1000));
        }
      }
    }

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
