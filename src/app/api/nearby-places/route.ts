import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { location, radius = 500, keyword = 'vegetarian restaurant' } = await request.json();
    
    if (!location || !location.lat || !location.lng) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const baseUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    const params = new URLSearchParams({
      location: `${location.lat},${location.lng}`,
      radius: radius.toString(),
      keyword,
      key: apiKey,
      type: 'restaurant',
      rankby: 'prominence'
    });

    const response = await fetch(`${baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      console.error('Google Places API error:', await response.text());
      return NextResponse.json(
        { error: 'Failed to fetch places' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status, data.error_message || '');
      return NextResponse.json(
        { error: data.error_message || 'No results found' },
        { status: 404 }
      );
    }

    // Transform the response to match our PlaceResult interface
    const places = data.results.map((place: any) => ({
      place_id: place.place_id,
      name: place.name,
      formatted_address: place.vicinity,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      price_level: place.price_level,
      photos: place.photos?.map((photo: any) => ({
        photo_reference: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`
      })),
      geometry: {
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        }
      },
      types: place.types
    }));

    return NextResponse.json({ places });

  } catch (error) {
    console.error('Error in nearby-places API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
