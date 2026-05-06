import { useEffect, useRef } from "react";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  className?: string;
  label?: string;
}

export function MapComponent({ latitude, longitude, zoom = 13, className = "h-[380px] w-full", label }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView([latitude, longitude], zoom);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
      }).addTo(mapInstance.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

      const icon = L.divIcon({
        className: '',
        html: `<div style="position:relative;width:32px;height:32px;">
          <div style="position:absolute;inset:0;border-radius:50%;background:hsl(210 100% 56%/0.25);animation:ping 1.5s cubic-bezier(0,0,.2,1) infinite;"></div>
          <div style="position:absolute;inset:6px;border-radius:50%;background:hsl(210 100% 56%);box-shadow:0 0 12px hsl(210 100% 56%/0.8);"></div>
        </div>
        <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0}}</style>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      markerInstance.current = L.marker([latitude, longitude], { icon })
        .addTo(mapInstance.current);

      if (label) {
        markerInstance.current.bindPopup(`<div style="font-family:JetBrains Mono,monospace;font-size:12px;color:#1e293b;padding:4px 8px;">${label}</div>`, { className: 'custom-popup' }).openPopup();
      }
    } else {
      mapInstance.current.setView([latitude, longitude], zoom);
      markerInstance.current?.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude, zoom, label]);

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
