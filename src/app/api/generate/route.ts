import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('Received request to generate image');
    const { images } = await request.json();
    
    if (!images || !Array.isArray(images) || images.length !== 2) {
      console.error('Invalid images array:', images);
      return NextResponse.json(
        { error: 'Exactly 2 images are required' },
        { status: 400 }
      );
    }

    console.log('Initializing Gemini client...');
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

    console.log('Processing input images...');
    // Convert base64 images to GoogleGenerativeAI.Part objects
    const imageParts = images.map((imageData: string, index: number) => {
      try {
        // Handle both data URLs and raw base64 strings
        const base64Data = imageData.includes('base64,') 
          ? imageData.split(',')[1] 
          : imageData;
          
        return {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg', // More compatible mimeType
          },
        };
      } catch (error) {
        console.error(`Error processing image ${index + 1}:`, error);
        throw new Error(`Invalid image format at position ${index + 1}`);
      }
    });

    console.log('Sending request to Gemini...');
    const prompt = `Take a picture with a Polaroid camera. The photo should look like a normal photo, without any clear subjects or props. The photo should have a slight blur effect and a consistent light source, such as a flash from a dark room, spread throughout the photo.
Do not change the faces.
Replace the photo should have a slight blur effect and a
consistent light source, such as a flash from a dark room, spread throughout the photo.
Do not change the faces.
Replace the background behind the two people with a white curtain. With the guy being close to me like a couple.`;
    
    console.log('Prompt:', prompt);
    
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            ...imageParts,
          ],
        },
      ],
    });

    console.log('Received response from Gemini');
    const response = await result.response;
    console.log('Full response:', JSON.stringify(response, null, 2));

    // Extract the generated image from the response
    let generatedImage = null;
    
    // Check for the new Gemini 2.5 response structure
    if (response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
      // New structure with inlineData
      generatedImage = response.candidates[0].content.parts[0].inlineData.data;
    } 
    // Check for the older structure with text/uri-list
    else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      const textContent = response.candidates[0].content.parts[0].text;
      // If the response is a base64 image directly
      if (textContent.startsWith('/9j/') || textContent.startsWith('iVBORw0KGgo')) {
        generatedImage = textContent;
      }
    }

    if (!generatedImage) {
      console.error('No image data found in response. Response structure:', JSON.stringify(response, null, 2));
      throw new Error('Failed to extract image data from response. The API response structure may have changed.');
    }

    console.log('Successfully generated image');
    return NextResponse.json({ 
      image: generatedImage,
      mimeType: 'image/jpeg' // Explicitly set the mimeType
    });
    
  } catch (error) {
    console.error('Error in generate endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
