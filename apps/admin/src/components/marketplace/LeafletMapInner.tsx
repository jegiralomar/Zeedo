'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface LeafletMapInnerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  jumpTarget?: { lat: number; lng: number } | null;
  className?: string;
}

export const LeafletMapInner: React.FC<LeafletMapInnerProps> = ({
  latitude,
  longitude,
  onLocationChange,
  jumpTarget,
  className = 'w-full h-full',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Custom emerald pin icon with pulse effect
  const createPinIcon = () => {
    return L.divIcon({
      className: 'zeedo-map-pin',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: grab;">
          <div style="position: absolute; inset: 4px; border-radius: 50%; background: rgba(16, 185, 129, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 38px; height: 38px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 50% 50% 50% 4px; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 24px -4px rgba(5, 150, 105, 0.5), 0 4px 6px -2px rgba(5, 150, 105, 0.2); border: 2.5px solid #ffffff;">
            <svg style="transform: rotate(45deg); width: 18px; height: 18px; color: #ffffff;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 42],
      popupAnchor: [0, -40],
    });
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize Leaflet map
    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 14,
      zoomControl: true,
      attributionControl: true,
    });

    // High quality OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
    }).addTo(map);

    // Add draggable marker
    const marker = L.marker([latitude, longitude], {
      icon: createPinIcon(),
      draggable: true,
      autoPan: true,
    }).addTo(map);

    // Marker drag event
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onLocationChange(pos.lat, pos.lng);
    });

    // Map click event: move pin & center
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      map.panTo([lat, lng], { animate: true, duration: 0.5 });
      onLocationChange(lat, lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    // Invalidate map size after container mounts or animates in
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []); // Run once on mount

  // Handle jumpTarget changes (City selection or GPS locate)
  useEffect(() => {
    if (!jumpTarget || !mapRef.current || !markerRef.current) return;
    const { lat, lng } = jumpTarget;
    markerRef.current.setLatLng([lat, lng]);
    mapRef.current.flyTo([lat, lng], 15, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [jumpTarget]);

  return <div ref={containerRef} className={className} />;
};

export default LeafletMapInner;
