import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { COORDS } from "../data/coords";

const TIER_COLOR = { top: "#10b981", mid: "#3b82f6", low: "#f43f5e" };

export default function ApartmentMap({ apartmentsWithScores }) {
  return (
    <MapContainer
      center={[28.42, -81.43]}
      zoom={11}
      style={{ height: "70vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {apartmentsWithScores
        .filter(a => COORDS[a.name])
        .map(a => (
          <CircleMarker
            key={a.name}
            center={COORDS[a.name]}
            radius={10}
            color={TIER_COLOR[a.tier] ?? "#6b7280"}
            fillColor={TIER_COLOR[a.tier] ?? "#6b7280"}
            fillOpacity={0.8}
          >
            <Popup>
              <b>{a.name}</b><br />
              {a.city}<br /><br />
              1bd: ${a.price1bd.toLocaleString()}/mo<br />
              {a.price2bd && <>2bd: ${a.price2bd.toLocaleString()}/mo<br /></>}
              Commute: {a.commute} min<br />
              Score: {a.composite?.toFixed(2)}<br />
              {a.toured && <><br /><b>✓ Toured</b></>}
            </Popup>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}
