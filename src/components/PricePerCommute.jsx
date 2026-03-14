import { BarChart, Card, Title } from "@tremor/react";
import { useEffect, useMemo, useState } from "react";

export default function PricePerCommute({ apartmentsWithScores }) {
  const maxPrice = useMemo(() => {
    const values = apartmentsWithScores.map((a) => a.price1bd).filter(Boolean);
    return values.length ? Math.max(...values) : 0;
  }, [apartmentsWithScores]);

  const maxCommute = useMemo(() => {
    const values = apartmentsWithScores.map((a) => a.commute).filter(Boolean);
    return values.length ? Math.max(...values) : 0;
  }, [apartmentsWithScores]);
  const [priceLimit, setPriceLimit] = useState(() => 0);
  const [commuteLimit, setCommuteLimit] = useState(() => 0);
  const [garageOnly, setGarageOnly] = useState(false);
  const [balconyOnly, setBalconyOnly] = useState(false);
  const [touredOnly, setTouredOnly] = useState(false);

  useEffect(() => {
    if (maxPrice > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPriceLimit(maxPrice);
    }
  }, [maxPrice]);

  useEffect(() => {
    if (maxCommute > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCommuteLimit(maxCommute);
    }
  }, [maxCommute]);

  const filtered = useMemo(() => {
    const filteredApartments = apartmentsWithScores.filter((apt) => {
      if (apt.price1bd === null || apt.commute === null) {
        return false;
      }

      if (apt.price1bd > priceLimit) {
        return false;
      }

      if (apt.commute > commuteLimit) {
        return false;
      }

      if (garageOnly && !apt.garage) {
        return false;
      }
      if (balconyOnly && !apt.balcony) {
        return false;
      }
      if (touredOnly && !apt.toured) {
        return false;
      }

      return true;
    });

    const ppc = filteredApartments.map((apt) => {
      const pricePerCommute = parseFloat(
        (apt.price1bd / apt.commute).toFixed(2),
      );

      return { name: apt.name, pricePerCommute };
    });

    return ppc.sort((a, b) => a.pricePerCommute - b.pricePerCommute);
  }, [
    apartmentsWithScores,
    balconyOnly,
    commuteLimit,
    garageOnly,
    priceLimit,
    touredOnly,
  ]);

  return (
    <div className="space-y-4">
      <Card>
        <Title>Filters</Title>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
          <div>
            <label className="text-sm text-gray-600">
              Max Price: ${priceLimit?.toLocaleString()}
            </label>
            <input
              type="range"
              min={0}
              max={maxPrice}
              value={priceLimit}
              onChange={(e) => setPriceLimit(Number(e.target.value))}
              className="w-full mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Max Commute: {commuteLimit} min
            </label>
            <input
              type="range"
              min={0}
              max={maxCommute}
              value={commuteLimit}
              onChange={(e) => setCommuteLimit(Number(e.target.value))}
              className="w-full mt-1"
            />
          </div>

          <div className="flex flex-col gap-2 justify-center">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={garageOnly}
                onChange={(e) => setGarageOnly(e.target.checked)}
              />
              Garage only
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={balconyOnly}
                onChange={(e) => setBalconyOnly(e.target.checked)}
              />
              Balcony only
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={touredOnly}
                onChange={(e) => setTouredOnly(e.target.checked)}
              />
              Toured only
            </label>
          </div>
        </div>
      </Card>

      {filtered.length ? (
        <BarChart
          className="mt-4 h-[480px]"
          data={filtered}
          index="name"
          categories={["pricePerCommute"]}
          colors={["blue"]}
          layout="vertical"
          showLegend={false}
          yAxisWidth={180}
        />
      ) : (
        <p className="text-gray-500 text-sm text-center py-8">
          No apartments match your filters.
        </p>
      )}
    </div>
  );
}
