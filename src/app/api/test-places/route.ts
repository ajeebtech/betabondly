import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Google Maps API key is not configured' },
      { status: 500 }
    );
  }

  const testLocation = { lat: 40.7128, lng: -74.0060 }; // New York City
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${testLocation.lat},${testLocation.lng}&radius=1500&type=restaurant&key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    return NextResponse.json({
      status: data.status,
      results: data.results ? data.results.length : 0,
      error: data.error_message || null,
      apiKeyConfigured: !!apiKey,
      places: data.results ? data.results.map((p: any) => p.name) : []
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch from Google Places API',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
