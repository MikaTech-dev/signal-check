import { NextResponse } from 'next/server';
import { signalStore } from '@/lib/store';
import { calculateHaversineDistance, maskCoordinates } from '@/lib/haversine';
import { Coordinates } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '8.9806');
    const lng = parseFloat(searchParams.get('lng') || '7.3762');
    const radiusKm = parseFloat(searchParams.get('radiusKm') || '5.0');
    const state = searchParams.get('state');
    const type = searchParams.get('type');

    const userCoord: Coordinates = { latitude: lat, longitude: lng };
    const allIncidents = signalStore.getIncidents();

    const filtered = allIncidents
      .map((inc) => {
        const distanceKm = calculateHaversineDistance(userCoord, inc.coordinates);
        return {
          ...inc,
          coordinates: maskCoordinates(inc.coordinates), // Mask exact coordinates in public feed
          distanceKm: Math.round(distanceKm * 10) / 10,
        };
      })
      .filter((inc) => {
        if (inc.distanceKm > radiusKm) return false;
        if (state && state !== 'ALL' && inc.state !== state) return false;
        if (type && type !== 'ALL' && inc.incidentType !== type) return false;
        return true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json({
      success: true,
      count: filtered.length,
      incidents: filtered,
    });
  } catch (error) {
    console.error('API route error in /api/incidents:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve incidents.' },
      { status: 500 }
    );
  }
}
