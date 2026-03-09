import ApartmentMap from "./ApartmentMap";

export default function MapView({ apartmentsWithScores }) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <ApartmentMap apartmentsWithScores={apartmentsWithScores} />
    </div>
  );
}
