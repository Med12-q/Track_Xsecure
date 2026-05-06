import { useEffect, useRef } from "react";
import L from "leaflet";

interface MapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  className?: string;
}

// Fix Leaflet's default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom neon pin icon
const neonIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="w-6 h-6 rounded-full bg-primary pulse-pin shadow-[0_0_15px_#00d4ff] border-2 border-white"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export function MapComponent({ latitude, longitude, zoom = 13, className = "h-[400px] w-full rounded-lg" }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      // Initialize map
      mapInstance.current = L.map(mapRef.current).setView([latitude, longitude], zoom);
      
      // Add dark tile layer
      L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);

      // Add marker
      markerInstance.current = L.marker([latitude, longitude], { icon: neonIcon }).addTo(mapInstance.current);
    } else {
      // Update map
      mapInstance.current.setView([latitude, longitude], zoom);
      if (markerInstance.current) {
        markerInstance.current.setLatLng([latitude, longitude]);
      }
    }

    return () => {
      // Cleanup happens only when component unmounts entirely
      // but React strict mode might cause issues, so we leave it alive unless destroyed
    };
  }, [latitude, longitude, zoom]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return <div ref={mapRef} className={className} style={{ zIndex: 1 }} />;
}
