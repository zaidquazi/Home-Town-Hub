'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Search, Navigation, Loader2, Check } from 'lucide-react';
import { Button, Input } from './index';

// Dynamically import the Map component so Leaflet window object doesn't crash SSR
const DynamicMap = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse flex items-center justify-center text-neutral-400"><MapPin className="w-8 h-8 opacity-50" /></div>
});

export interface LocationData {
  country: string;
  state: string;
  district?: string;
  city: string;
  area?: string;
  latitude?: number;
  longitude?: number;
}

interface LocationPickerProps {
  value?: LocationData;
  onChange: (location: LocationData) => void;
  label?: string;
  placeholder?: string;
}

export default function LocationPicker({ value, onChange, label = "Location", placeholder = "Search for your location..." }: LocationPickerProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  // Coordinates for the map
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(
    value?.latitude && value?.longitude ? { lat: value.latitude, lng: value.longitude } : null
  );

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Extract location data from Nominatim response
  const parseNominatimAddress = (address: any, lat: number, lon: number): LocationData => {
    return {
      country: address.country || '',
      state: address.state || address.region || '',
      district: address.state_district || address.county || '',
      city: address.city || address.town || address.village || address.municipality || address.state_district || address.county || '',
      area: address.suburb || address.neighbourhood || address.residential || '',
      latitude: Number(lat),
      longitude: Number(lon)
    };
  };

  // Reverse Geocoding
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data && data.address) {
        const loc = parseNominatimAddress(data.address, lat, lon);
        onChange(loc);
        setQuery(data.display_name.split(',')[0]); // Just set the first part as query to look nice
      }
    } catch (err) {
      console.error("Reverse geocoding failed", err);
    }
  };

  // Forward Geocoding (Autocomplete)
  const searchLocation = async (text: string) => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&addressdetails=1&limit=5`);
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Geocoding search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Input typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    
    // Immediately emit raw text as the city so the user can hit "Next" without clicking a dropdown item
    if (text.trim()) {
      onChange({ country: '', state: '', city: text });
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      searchLocation(text);
    }, 500);
  };

  // Select a suggestion
  const handleSelectSuggestion = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    const loc = parseNominatimAddress(suggestion.address, lat, lon);
    
    setCoords({ lat, lng: lon });
    setQuery(suggestion.display_name.split(',')[0]);
    setSuggestions([]);
    onChange(loc);
  };

  // Auto-detect GPS
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        reverseGeocode(latitude, longitude);
        setIsDetecting(false);
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location.";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please allow location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "The request to get user location timed out.";
            break;
        }
        console.error("Geolocation Error:", error.message || errorMessage);
        setIsDetecting(false);
        alert(errorMessage);
      }
    );
  };

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{label}</label>}
      
      <div className="relative">
        <Input 
          label=""
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          leftIcon={<Search className="w-5 h-5 text-neutral-400" />}
          className="pr-12"
        />
        
        <div className="absolute right-2 top-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="p-1.5 h-auto text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
            onClick={detectLocation}
            disabled={isDetecting}
            title="Use my current location"
          >
            {isDetecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
          </Button>
        </div>

        {/* Autocomplete Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden z-50">
            {suggestions.map((s, i) => (
              <div 
                key={i} 
                className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer flex items-start gap-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                onClick={() => handleSelectSuggestion(s)}
              >
                <MapPin className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-1">{s.display_name.split(',')[0]}</p>
                  <p className="text-xs text-neutral-500 line-clamp-1">{s.display_name.split(',').slice(1).join(',')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map Toggle */}
      {coords && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                  {value?.city || 'Location Selected'}
                </p>
                <p className="text-xs text-neutral-500">
                  {value?.state}, {value?.country}
                </p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowMap(!showMap)} className="text-xs">
              {showMap ? 'Hide Map' : 'Adjust on Map'}
            </Button>
          </div>

          {showMap && (
            <div className="h-48 w-full relative z-0 rounded-xl overflow-hidden shadow-inner">
              <DynamicMap 
                center={coords} 
                interactive={true} 
                onLocationSelect={(lat, lng) => reverseGeocode(lat, lng)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
