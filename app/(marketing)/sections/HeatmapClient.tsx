'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data to ensure it always renders something impressive on landing,
// even if backend is empty. In production, this would merge with fetch('/api/v1/analytics/live-stats')
const MOCK_HOTSPOTS = [
  { city: 'Nagpur', coords: [21.1458, 79.0882], users: 1250, active: 45, events: 5 },
  { city: 'Pune', coords: [18.5204, 73.8567], users: 890, active: 32, events: 3 },
  { city: 'Mumbai', coords: [19.0760, 72.8777], users: 2100, active: 120, events: 12 },
  { city: 'San Francisco', coords: [37.7749, -122.4194], users: 450, active: 15, events: 2 },
  { city: 'London', coords: [51.5074, -0.1278], users: 670, active: 28, events: 4 },
  { city: 'Toronto', coords: [43.6510, -79.3470], users: 320, active: 12, events: 1 },
];

export default function HeatmapClient() {
  const [mounted, setMounted] = useState(false);
  const [hotspots, setHotspots] = useState(MOCK_HOTSPOTS);

  useEffect(() => {
    setMounted(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    
    fetch(`${apiUrl}/analytics/live-stats`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (data?.data?.hotspots?.length > 0) {
          setHotspots(data.data.hotspots);
        }
      })
      .catch(() => {
        // Silently catch fetch errors to avoid console noise when backend is down
        // It will gracefully fall back to MOCK_HOTSPOTS
      });
  }, []);

  if (!mounted) return <div className="h-[600px] w-full bg-neutral-900 rounded-3xl animate-pulse" />;

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800">
      
      {/* Live Indicator */}
      <div className="absolute top-6 right-6 z-[400] bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </div>
        <span className="font-bold text-sm dark:text-white">Live Activity</span>
      </div>

      <MapContainer
        center={[20, 0]}
        zoom={3}
        className="w-full h-full bg-[#1a1a1a]" // Dark background for the map
        zoomControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
        />

        {hotspots.map((spot, i) => (
          <CircleMarker
            key={i}
            center={spot.coords as [number, number]}
            radius={Math.max(8, Math.min(spot.users / 50, 30))}
            fillColor="#ef4444" // red-500
            color="#ef4444"
            weight={1}
            opacity={0.4}
            fillOpacity={0.4}
            className="animate-pulse" // Pulsing effect
          >
            <Tooltip
              direction="top"
              offset={[0, -10]}
              opacity={1}
              className="custom-leaflet-tooltip"
            >
              <div className="p-2 text-sm">
                <p className="font-bold text-lg mb-2">{spot.city}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-neutral-500 text-xs">Members</p>
                    <p className="font-bold">{spot.users.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs">Active Now</p>
                    <p className="font-bold text-green-500 flex items-center gap-1">
                      <Activity className="w-3 h-3" /> {spot.active}
                    </p>
                  </div>
                  <div className="col-span-2 mt-1 pt-1 border-t border-neutral-200">
                    <p className="text-xs font-medium text-primary-600">{spot.events} Upcoming Events</p>
                  </div>
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
