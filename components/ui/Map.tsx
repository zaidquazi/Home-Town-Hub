'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface MapProps {
  center: { lat: number; lng: number };
  onLocationSelect?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

function LocationMarker({ position, onLocationSelect, interactive }: any) {
  const [pos, setPos] = useState(position);

  useMapEvents({
    click(e) {
      if (!interactive) return;
      setPos(e.latlng);
      onLocationSelect?.(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    setPos(position);
  }, [position]);

  return pos === null ? null : (
    <Marker position={pos} icon={icon}></Marker>
  );
}

export default function Map({ center, onLocationSelect, interactive = true }: MapProps) {
  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={interactive} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={center} onLocationSelect={onLocationSelect} interactive={interactive} />
      </MapContainer>
    </div>
  );
}
