import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const { location, radius = 500, keyword, type = 'restaurant' } = requestBody;
    
    if (!location || !location.lat || !location.lng) {
      console.error('Location is required');
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
      radius: Math.min(Number(radius), 50000).toString(), // Max 50km
      key: apiKey,
      type: type || 'restaurant',
      rankby: 'prominence'
    });

    // Add keyword if provided
    if (keyword) {
      params.append('keyword', keyword);
    }

    const apiUrl = `${baseUrl}?${params.toString()}`;
    console.log('Google Places API URL:', apiUrl.replace(apiKey, '***'));
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    console.log('Google Places API response status:', response.status);
    console.log('Google Places API response:', JSON.stringify(data, null, 2));
    
    if (data.status === 'ZERO_RESULTS') {
      console.log('No places found for the given criteria');
      return NextResponse.json({ places: [] });
    }
    
    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status, data.error_message || '');
      return NextResponse.json(
        { error: data.error_message || 'Failed to fetch places' },
        { status: response.status }
      );
    }

    // Map the response to our PlaceResult format
    const places = data.results.map((place: any) => ({
      place_id: place.place_id,
      name: place.name,
      formatted_address: place.vicinity || place.formatted_address,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      price_level: place.price_level,
      photos: place.photos?.map((photo: any) => ({
        photo_reference: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`,
        width: photo.width,
        height: photo.height
      })),
      geometry: {
        location: {
          lat: place.geometry?.location?.lat || 0,
          lng: place.geometry?.location?.lng || 0
        }
      },
      types: place.types
    }));
    
    console.log(`Found ${places.length} places`);
    return NextResponse.json({ places });

  } catch (error) {
    console.error('Error in nearby-places API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
