import { useMemo } from "react";
import { Card } from "@tremor/react";
import { COORDS } from "../data/coords";

const WORK_COORDS = [28.3274, -81.5496]; // Celebration, FL

function haversine([lat1, lon1], [lat2, lon2]) {
  const R = 3958.8; // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function permutations(arr) {
  if (arr.length <= 1) return [arr];
  return arr.flatMap((item, i) =>
    permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map((rest) => [
      item,
      ...rest,
    ])
  );
}

function totalDistance(stops) {
  let dist = haversine(WORK_COORDS, COORDS[stops[0]]);
  for (let i = 0; i < stops.length - 1; i++) {
    dist += haversine(COORDS[stops[i]], COORDS[stops[i + 1]]);
  }
  return dist;
}

function optimalRoute(stops) {
  if (stops.length <= 1) return stops;
  let best = null;
  let bestDist = Infinity;
  for (const perm of permutations(stops)) {
    const d = totalDistance(perm);
    if (d < bestDist) {
      bestDist = d;
      best = perm;
    }
  }
  return best;
}

export function TourPlan({ apartmentsWithScores }) {
  // All untoured apartments with known coordinates, sorted by score descending
  const candidates = useMemo(
    () =>
      apartmentsWithScores
        .filter((a) => !a.toured && COORDS[a.name])
        .sort((a, b) => b.composite - a.composite),
    [apartmentsWithScores]
  );

  const batch = candidates.slice(0, 5);
  const remaining = candidates.slice(5);

  const route = useMemo(
    () => (batch.length >= 2 ? optimalRoute(batch.map((a) => a.name)) : null),
    [batch]
  );

  const legs = useMemo(() => {
    if (!route) return [];
    const stops = ["__work__", ...route];
    return stops.slice(0, -1).map((_, i) => {
      const fromCoords = i === 0 ? WORK_COORDS : COORDS[stops[i]];
      const toCoords = COORDS[stops[i + 1]];
      return {
        from: i === 0 ? "Work (Celebration)" : stops[i],
        to: stops[i + 1],
        miles: haversine(fromCoords, toCoords).toFixed(1),
      };
    });
  }, [route]);

  const totalMiles = legs
    .reduce((sum, l) => sum + parseFloat(l.miles), 0)
    .toFixed(1);

  if (candidates.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-500">
          No untoured apartments with known coordinates.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {route ? (
        <Card>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Optimal Route &mdash;{" "}
            <span className="text-blue-600">{totalMiles} mi total</span>
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Top {batch.length} untoured apartments by score · starts from Work
            (Celebration, FL)
          </p>
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center">
                S
              </span>
              <div className="pt-1">
                <p className="text-sm font-medium text-gray-900">
                  Work (Celebration, FL)
                </p>
              </div>
            </li>
            {legs.map((leg, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="pt-1">
                  <p className="text-sm font-medium text-gray-900">{leg.to}</p>
                  <p className="text-xs text-gray-400">
                    {leg.miles} mi from {leg.from}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-gray-500">
            Only 1 untoured apartment found — need at least 2 to plan a route.
          </p>
          <p className="text-sm font-medium text-gray-900 mt-2">
            {batch[0]?.name}
          </p>
        </Card>
      )}

      {remaining.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Up next ({remaining.length} more untoured)
          </h3>
          <ul className="space-y-1">
            {remaining.map((apt) => (
              <li key={apt.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{apt.name}</span>
                <span className="text-xs text-gray-400">
                  score {apt.composite?.toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
