#!/usr/bin/env node

async function testImageGeneration() {
  console.log('Testing image generation API...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'a beautiful sunset over mountains' })
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ API is working!');
      console.log('Enhanced prompt:', data.imageDescription);
      
      // Test the image URL
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(data.imageDescription)}?width=512&height=512&nologo=true&model=flux-pro&enhance=true&seed=${Date.now()}`;
      console.log('\nTesting image URL...');
      console.log('URL:', imageUrl);
      
      const imgResponse = await fetch(imageUrl);
      console.log('Image response status:', imgResponse.status);
      console.log('Image response type:', imgResponse.headers.get('content-type'));
      
      if (imgResponse.ok) {
        console.log('✅ Image generation working!');
      } else {
        console.log('❌ Image URL failed');
      }
    } else {
      console.log('\n❌ API returned error:', data.error);
    }
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testImageGeneration();
