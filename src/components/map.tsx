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

export function MapComponent({ latitude, longitude, zoom = 13, className = "h-[320px] w-full", label }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView([latitude, longitude], zoom);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(mapInstance.current);
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

      const icon = L.divIcon({
        className: '',
        html: `<div style="position:relative;width:28px;height:28px;">
          <div style="position:absolute;inset:0;border-radius:50%;background:hsl(185 100% 50%/0.2);animation:ping 2s cubic-bezier(0,0,.2,1) infinite;"></div>
          <div style="position:absolute;inset:0;border-radius:50%;border:2px solid hsl(185 100% 50%/0.5);animation:ping 2s cubic-bezier(0,0,.2,1) infinite;animation-delay:0.5s;"></div>
          <div style="position:absolute;inset:7px;border-radius:50%;background:hsl(185 100% 50%);box-shadow:0 0 16px hsl(185 100% 50%/0.9),0 0 32px hsl(185 100% 50%/0.4);"></div>
        </div>
        <style>@keyframes ping{75%,100%{transform:scale(2.5);opacity:0}}</style>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      markerInstance.current = L.marker([latitude, longitude], { icon }).addTo(mapInstance.current);
      if (label) {
        markerInstance.current.bindPopup(
          `<div style="font-family:Share Tech Mono,monospace;font-size:11px;color:#050505;padding:3px 6px;background:#00e5ff;border-radius:3px;">${label}</div>`,
          { className: 'custom-popup' }
        ).openPopup();
      }
    } else {
      mapInstance.current.setView([latitude, longitude], zoom);
      markerInstance.current?.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude, zoom, label]);

  useEffect(() => {
    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, []);

  return <div ref={mapRef} className={className} style={{ zIndex: 1 }} />;
}
