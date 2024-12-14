import React from 'react';
import { ShootingIncident } from '@/types/shooting';

interface IncidentListProps {
  incidents: ShootingIncident[];
  onSelectIncident: (incident: ShootingIncident) => void;
  selectedIncident: ShootingIncident | null;
}

const IncidentList: React.FC<IncidentListProps> = ({ 
  incidents, 
  onSelectIncident, 
  selectedIncident 
}) => {
  // Filter out duplicates based on case number
  const uniqueIncidents = incidents.reduce((acc, incident) => {
    if (!acc.some(i => i.caseNumber === incident.caseNumber)) {
      acc.push(incident);
    }
    return acc;
  }, [] as ShootingIncident[]);

  const sortedIncidents = uniqueIncidents.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const incidentDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - incidentDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays < 1) return "Today";
    if (diffInDays < 30) return `${diffInDays}d`;
    const months = Math.floor(diffInDays / 30);
    return `${months}mo`;
  };

  return (
    <div className="incident-list">
      <div className="sidebar-header">Recent Incidents</div>
      <ul>
        {sortedIncidents.map(incident => (
          <li
            key={`${incident.caseNumber}-${incident.date}`}
            onClick={() => onSelectIncident(incident)}
            className={selectedIncident?.caseNumber === incident.caseNumber ? 'active' : ''}
          >
            <div className="incident-time">
              {getTimeAgo(incident.date)}
            </div>
            <div className="incident-type">
              {incident.incidentType}
            </div>
            <div className="incident-location">
              {incident.location.address}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IncidentList;