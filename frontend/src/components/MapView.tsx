// src/components/MapView.jsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type Point = {
  name: string;
  lat: number;
  lng: number;
  employees?: number;
  branches?: number;
  country?: string;
  [key: string]: any;
};

export default function MapView({ points = [] }: { points?: Point[] }) {
  console.log("🗺️ MapView rendering with points:", points);
  console.log("📊 Total points:", points.length);

  // Validate points have valid coordinates
  const validPoints = points.filter(p => {
    const hasCoords = p.lat && p.lng && 
                      !isNaN(p.lat) && !isNaN(p.lng) &&
                      p.lat >= -90 && p.lat <= 90 &&
                      p.lng >= -180 && p.lng <= 180;
    if (!hasCoords) {
      console.warn('⚠️ Invalid point:', p);
    }
    return hasCoords;
  });

  console.log("✅ Valid points to plot:", validPoints.length);

  return (
    <MapContainer 
      center={[20, 77]} 
      zoom={4} 
      style={{ height: "75vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {validPoints.map((point, idx) => (
        <Marker key={idx} position={[point.lat, point.lng]}>
          <Popup>
            <div className="text-sm">
              <b className="text-lg">{point.name}</b><br/>
              {point.country && <div>📍 {point.country}</div>}
              {point.employees && <div>👥 Employees: {point.employees}</div>}
              {point.branches && <div>🏢 Branches: {point.branches}</div>}
              <div className="text-xs text-gray-500 mt-1">
                Lat: {point.lat.toFixed(4)}, Lng: {point.lng.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
