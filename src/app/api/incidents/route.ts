import { NextResponse } from 'next/server';
import type { ShootingIncident } from '@/types/shooting';

export async function GET() {
  try {
    const url = 'https://data.cityoforlando.net/resource/6kz6-6c7n.json';

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-store' // Don't cache during development
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.error('Received non-JSON response:', text.substring(0, 200));
      throw new Error('Received non-JSON response from data source');
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Expected array but received: ' + typeof data);
    }

    const incidents: ShootingIncident[] = data
      .filter(record => record.geocoded_column?.coordinates)
      .map(record => {
        const [longitude, latitude] = record.geocoded_column.coordinates;

        return {
          caseNumber: record.case || 'Unknown',
          date: record.date || 'Unknown',
          location: {
            address: record.address || 'Unknown',
            latitude,
            longitude,
          },
          officers: [{
            name: record.officer_name || 'Unknown',
            badgeNumber: undefined
          }],
          suspects: [{
            name: record.suspect_name || 'Unknown',
            age: record.suspect_age && record.suspect_age !== 'Unknown'
              ? parseInt(record.suspect_age)
              : undefined
          }],
          incidentType: record.incident_type || 'Unknown',
        };
      });

    return NextResponse.json(incidents);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}