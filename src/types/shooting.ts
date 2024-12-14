export interface OfficerInfo {
  name: string;
  badgeNumber?: string;
  race?: string;
  ethnicity?: string;
  gender?: string;
  age?: number;
  tenure?: number;
}

export interface SuspectInfo {
  name: string;
  race?: string;
  gender?: string;
  age?: number | string;
  weapon?: string;
  wasHit?: boolean;
  wasFatal?: boolean;
}

export interface ShootingIncident {
  caseNumber: string;
  date: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  incidentType: string;
  officers: OfficerInfo[];
  suspects: SuspectInfo[];
  narrative?: string;
  stateAttorneyLetterUrl?: string;
}