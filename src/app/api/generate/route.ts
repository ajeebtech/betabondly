import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { images } = await request.json();
    
    if (!images || !Array.isArray(images) || images.length !== 2) {
      return NextResponse.json(
        { error: 'Exactly 2 images are required' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

    // Convert base64 images to GoogleGenerativeAI.Part objects
    const imageParts = images.map((imageData: string) => ({
      inlineData: {
        data: imageData.split(',')[1], // Remove the data URL prefix
        mimeType: 'image/png',
      },
    }));

    const prompt = `Create a 4K HD polaroid-style snapshot of the uploaded individuals sharing a sweet, candid laugh. Add natural dim lighting, a hint of film grain, and the feel of an instant photo.`;

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

    const response = await result.response;
    const generatedImage = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedImage) {
      throw new Error('Failed to generate image');
    }

    return NextResponse.json({ image: generatedImage });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
