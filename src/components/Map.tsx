import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ShootingIncident } from '@/types/shooting';
import IncidentList from './IncidentList';

interface MapProps {
  incidents: ShootingIncident[];
}

const Map: React.FC<MapProps> = ({ incidents }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<ShootingIncident | null>(null);

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  const createCustomMarkerElement = (incident: ShootingIncident) => {
    const markerEl = document.createElement('div');
    markerEl.innerHTML = `
      <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12zm0 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" 
              fill="#60A5FA"/>
      </svg>
    `;
    markerEl.className = `marker-container ${selectedIncident?.caseNumber === incident.caseNumber ? 'selected' : ''}`;
    markerEl.style.cursor = 'pointer';
    return markerEl;
  };

  const showIncidentDetails = (incident: ShootingIncident, mapInstance: maplibregl.Map) => {
    if (popupRef.current) {
      popupRef.current.remove();
    }

    setSelectedIncident(incident);

    mapInstance.flyTo({
      center: [incident.location.longitude, incident.location.latitude],
      zoom: 15,
      duration: 1000
    });

    const formattedDate = new Date(incident.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '300px',
      className: 'incident-details-popup'
    })
      .setLngLat([incident.location.longitude, incident.location.latitude])
      .setHTML(`
        <div class="popup-content">
          <h3 class="text-lg font-bold mb-3">Case #${incident.caseNumber}</h3>
          <div class="space-y-2">
            <p class="text-sm"><span class="font-medium">Date:</span> ${formattedDate}</p>
            <p class="text-sm"><span class="font-medium">Type:</span> ${incident.incidentType}</p>
            <p class="text-sm"><span class="font-medium">Location:</span> ${incident.location.address}</p>
            ${incident.officers[0]?.name ? 
              `<p class="text-sm"><span class="font-medium">Officer:</span> ${incident.officers[0].name}</p>` : 
              ''}
            ${incident.stateAttorneyLetterUrl ? 
              `<div class="mt-3">
                <a href="${incident.stateAttorneyLetterUrl}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   class="text-blue-400 hover:text-blue-300 text-sm">
                   View State Attorney's Review →
                </a>
              </div>` : 
              ''}
          </div>
        </div>
      `)
      .addTo(mapInstance);

    popup.on('close', () => {
      setSelectedIncident(null);
      popupRef.current = null;
    });

    popupRef.current = popup;
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initializeMap = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [-81.379234, 28.538336],
      zoom: 11,
    });

    initializeMap.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    initializeMap.on('load', () => {
      setMap(initializeMap);
    });

    return () => {
      initializeMap.remove();
      clearMarkers();
    };
  }, []);

  useEffect(() => {
    if (!map || incidents.length === 0) return;

    clearMarkers();

    const uniqueIncidents = incidents.reduce((acc, incident) => {
      if (!acc.some(i => i.caseNumber === incident.caseNumber)) {
        acc.push(incident);
      }
      return acc;
    }, [] as ShootingIncident[]);

    uniqueIncidents.forEach(incident => {
      const markerEl = createCustomMarkerElement(incident);

      markerEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showIncidentDetails(incident, map);
      });

      const marker = new maplibregl.Marker({
        element: markerEl,
        anchor: 'bottom'
      })
        .setLngLat([incident.location.longitude, incident.location.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [map, incidents, selectedIncident]);

  return (
    <div className="map-container">
      <div className="sidebar">
        <div className="p-4 bg-gray-900 md:p-6">
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Orlando Officer-Involved Shootings</h1>
            <h2 className="text-lg md:text-xl text-red-500 font-semibold mt-1">Interactive Map</h2>
            <p className="by-line text-sm text-gray-400 mt-1">by Dechante Chang</p>
          </div>
          
          <p className="text-gray-300 text-sm mb-4">
            A comprehensive visualization of officer-involved shooting incidents in Orlando,
            providing location-based insights into law enforcement encounters.
          </p>

          <div className="bg-gray-800 rounded-lg p-3 mb-4 text-sm">
            <h3 className="text-white font-semibold mb-2">Project Information</h3>
            <div className="space-y-1 text-gray-300">
              <p><span className="font-medium">Source:</span> OPD Public Records</p>
              <p><span className="font-medium">Updated:</span> December 14, 2024</p>
              <p><span className="font-medium">Stack:</span> Next.js 14, React 18, Tailwind, MapLibre GL</p>
            </div>
          </div>

          <div className="text-gray-300 text-xs">
            <p><strong>Interactive features:</strong> Click markers or list items to view details and locations</p>
          </div>
        </div>

        <div className="divider border-t border-gray-800"></div>
        
        <div className="flex-1 overflow-y-auto">
          <IncidentList
            incidents={incidents}
            onSelectIncident={(incident) => map && showIncidentDetails(incident, map)}
            selectedIncident={selectedIncident}
          />
        </div>
      </div>
      <div className="map-view" ref={mapContainerRef}></div>
    </div>
  );
};

export default Map;