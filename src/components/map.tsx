import { useEffect, useRef } from "react";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;

interface MapProps {
  lat: number;
  lng: number;
  zoom?: number;
  label?: string;
  className?: string;
  accentColor?: string;
}

export function MapComponent({ lat, lng, zoom = 12, label, className = "h-64 w-full", accentColor = "#00e5ff" }: MapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(ref.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
      }).setView([lat, lng], zoom);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(mapRef.current);
      L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

      const c = accentColor;
      const icon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:40px;height:40px;transform:translate(-50%,-50%)">
            <div style="position:absolute;inset:0;border-radius:50%;border:1.5px solid ${c}33;animation:ping-dot 2.2s ease-out infinite;"></div>
            <div style="position:absolute;inset:0;border-radius:50%;border:1px solid ${c}22;animation:ping-dot 2.2s ease-out infinite 0.8s;"></div>
            <div style="position:absolute;inset:11px;border-radius:50%;background:${c};box-shadow:0 0 14px ${c}cc,0 0 28px ${c}66;"></div>
            <div style="position:absolute;inset:9px;border-radius:50%;border:1.5px solid ${c}88;"></div>
          </div>
          <style>@keyframes ping-dot{0%{transform:scale(0.8);opacity:.7}100%{transform:scale(2.6);opacity:0}}</style>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      markerRef.current = L.marker([lat, lng], { icon }).addTo(mapRef.current);
      if (label) markerRef.current.bindPopup(`<span style="color:${c};font-weight:600">${label}</span>`, { maxWidth: 220 }).openPopup();
    } else {
      mapRef.current.setView([lat, lng], zoom);
      markerRef.current?.setLatLng([lat, lng]);
    }
  }, [lat, lng, zoom, label, accentColor]);

  useEffect(() => () => { mapRef.current?.remove(); mapRef.current = null; }, []);

  return <div ref={ref} className={className} style={{ zIndex: 1 }} />;
}
