import { useEffect, useRef } from "react";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;

interface MapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  className?: string;
  label?: string;
}

export function MapComponent({ latitude, longitude, zoom = 13, className = "h-72 w-full", label }: MapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (!map.current) {
      map.current = L.map(ref.current, { zoomControl: false, attributionControl: false })
        .setView([latitude, longitude], zoom);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 19 })
        .addTo(map.current);

      L.control.zoom({ position: "bottomright" }).addTo(map.current);

      const icon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:32px;height:32px;">
            <div style="position:absolute;inset:0;border-radius:50%;border:1.5px solid #00e5ff44;animation:rping 2s ease-out infinite;"></div>
            <div style="position:absolute;inset:0;border-radius:50%;border:1.5px solid #00e5ff33;animation:rping 2s ease-out infinite 0.7s;"></div>
            <div style="position:absolute;inset:9px;border-radius:50%;background:#00e5ff;box-shadow:0 0 16px #00e5ffcc,0 0 32px #00e5ff66;"></div>
          </div>
          <style>@keyframes rping{0%{transform:scale(0.8);opacity:.8}100%{transform:scale(2.8);opacity:0}}</style>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      marker.current = L.marker([latitude, longitude], { icon }).addTo(map.current);
      if (label) {
        marker.current.bindPopup(label, { maxWidth: 200 }).openPopup();
      }
    } else {
      map.current.setView([latitude, longitude], zoom);
      marker.current?.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude, zoom, label]);

  useEffect(() => () => { map.current?.remove(); map.current = null; }, []);

  return <div ref={ref} className={className} style={{ zIndex: 1 }} />;
}
