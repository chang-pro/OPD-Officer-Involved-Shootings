import { ShootingIncident, OfficerInfo, SuspectInfo } from '@/types/shooting';

export function transformRecordToIncident(record: any): ShootingIncident | null {
  try {
    if (!record.geocoded_column?.coordinates) {
      return null;
    }

    const [longitude, latitude] = record.geocoded_column.coordinates;

    // Parse officers
    const officers: OfficerInfo[] = [];
    const officerCount = record.number_of_officers_involved ?
      parseInt(record.number_of_officers_involved, 10) : 1;

    const officerNames = record.officer_name?.split(';') || ['Unknown'];
    const officerRaces = record.officer_race?.split(',') || [];
    const officerGenders = record.officer_gender?.split(',') || [];
    const officerAges = record.officer_age?.split(',') || [];
    const officerTenures = record.officer_tenure?.split(',') || [];

    for (let i = 0; i < officerCount; i++) {
      officers.push({
        name: officerNames[i]?.trim() || 'Unknown',
        race: officerRaces[i]?.trim(),
        gender: officerGenders[i]?.trim(),
        age: officerAges[i] ? parseInt(officerAges[i].trim(), 10) : undefined,
        tenure: officerTenures[i] ? parseInt(officerTenures[i].trim(), 10) : undefined
      });
    }

    // Parse suspects
    const suspects: SuspectInfo[] = [];
    const suspectCount = record.number_of_suspects_involved ?
      parseInt(record.number_of_suspects_involved, 10) : 1;

    const suspectNames = record.suspect_name?.split(';') || ['Unknown'];
    const suspectRaces = record.suspect_race?.split(',') || [];
    const suspectGenders = record.suspect_gender?.split(',') || [];
    const suspectAges = record.suspect_age?.split(',') || [];

    for (let i = 0; i < suspectCount; i++) {
      suspects.push({
        name: suspectNames[i]?.trim() || 'Unknown',
        race: suspectRaces[i]?.trim(),
        gender: suspectGenders[i]?.trim(),
        age: suspectAges[i]?.trim() !== 'Unknown' ?
          parseInt(suspectAges[i]?.trim(), 10) : undefined,
        weapon: record.suspect_s_weapon,
        wasHit: record.suspect_hit?.toLowerCase().includes('yes'),
        wasFatal: record.fatal?.toLowerCase().includes('yes')
      });
    }

    return {
      caseNumber: record.case || 'Unknown',
      date: record.date || 'Unknown',
      location: {
        address: record.address || 'Unknown',
        latitude,
        longitude,
      },
      incidentType: record.incident_type || 'Unknown',
      officers,
      suspects,
      stateAttorneyLetterUrl: record.state_attorney_s_review_letter?.url
    };
  } catch (error) {
    console.error('Error transforming record:', error, record);
    return null;
  }
}