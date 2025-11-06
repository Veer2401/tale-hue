import dotenv from "dotenv";

dotenv.config({ path: '.env.local' });

async function testOpenRouter() {
  console.log('Testing OpenRouter API...');
  console.log('API Key:', process.env.OPENROUTER_API_KEY?.substring(0, 20) + '...');

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:image-generation',
        messages: [
          {
            role: 'user',
            content: 'Create a picture of a sunset over mountains',
          },
        ],
        modalities: ['image', 'text'],
        image_config: {
          aspect_ratio: '1:1',
        },
      }),
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));

    if (result.choices && result.choices[0]?.message?.images) {
      console.log('✅ Success! Image URL:', result.choices[0].message.images[0].image_url.url);
    } else {
      console.log('❌ No images in response');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testOpenRouter();
