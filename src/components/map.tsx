import { useEffect, useRef } from "react";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;

interface MapProps {
  lat: number; lng: number; zoom?: number;
  label?: string; className?: string; accentColor?: string;
}

export function MapComponent({ lat, lng, zoom = 11, label, className = "h-full w-full", accentColor = "#00e5ff" }: MapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const c = accentColor;
    if (!mapRef.current) {
      mapRef.current = L.map(ref.current, { zoomControl: false, attributionControl: false, scrollWheelZoom: true })
        .setView([lat, lng], zoom);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(mapRef.current);
      L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);
      const icon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:48px;height:48px;transform:translate(-50%,-50%)">
            <div style="position:absolute;inset:0;border-radius:50%;border:1px solid ${c}30;animation:ping-expand 2s ease-out infinite"></div>
            <div style="position:absolute;inset:0;border-radius:50%;border:1px solid ${c}20;animation:ping-expand 2s ease-out infinite 0.7s"></div>
            <div style="position:absolute;inset:0;border-radius:50%;border:1px solid ${c}15;animation:ping-expand 2s ease-out infinite 1.4s"></div>
            <div style="position:absolute;inset:13px;border-radius:50%;background:${c};box-shadow:0 0 16px ${c}cc,0 0 32px ${c}66;"></div>
            <div style="position:absolute;inset:10px;border-radius:50%;border:1.5px solid ${c}88;"></div>
          </div>
          <style>@keyframes ping-expand{0%{transform:scale(0.8);opacity:.7}100%{transform:scale(3.2);opacity:0}}</style>`,
        iconSize: [0, 0], iconAnchor: [0, 0],
      });
      markerRef.current = L.marker([lat, lng], { icon }).addTo(mapRef.current);
      if (label) markerRef.current.bindPopup(`<div style="color:${c};font-weight:700;letter-spacing:0.05em">${label}</div>`, { maxWidth: 240 }).openPopup();
    } else {
      mapRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
      markerRef.current?.setLatLng([lat, lng]);
    }
  }, [lat, lng, zoom, label, accentColor]);

  useEffect(() => () => { mapRef.current?.remove(); mapRef.current = null; }, []);
  return <div ref={ref} className={className} style={{ zIndex: 1 }} />;
}
