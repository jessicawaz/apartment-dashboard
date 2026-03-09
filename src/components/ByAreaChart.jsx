import { Card, Title, BarChart } from "@tremor/react";

const valueFormatter = (v) => `$${v.toLocaleString()}`;

export default function ByAreaChart({ bedFilter, apartmentsWithScores }) {
  // Average 1bd price per city
  const cityMap1bd = {};
  apartmentsWithScores?.forEach((a) => {
    if (!cityMap1bd[a.city]) cityMap1bd[a.city] = [];
    cityMap1bd[a.city].push(a.price1bd);
  });

  const cityMap2bd = {};
  apartmentsWithScores?.forEach((a) => {
    if (a.price2bd == null) {
      return;
    }
    if (!cityMap2bd[a.city]) cityMap2bd[a.city] = [];
    cityMap2bd[a.city].push(a.price2bd);
  });

  const data1bd = Object.entries(cityMap1bd)
    .map(([city, prices]) => ({
      city,
      "Avg 1bd Rent": Math.round(
        prices.reduce((s, p) => s + p, 0) / prices.length,
      ),
    }))
    .sort((a, b) => a["Avg 1bd Rent"] - b["Avg 1bd Rent"]);

  const data2bd = Object.entries(cityMap2bd)
    .map(([city, prices]) => ({
      city,
      "Avg 2bd Rent": Math.round(
        prices.reduce((s, p) => s + p, 0) / prices.length,
      ),
    }))
    .sort((a, b) => a["Avg 2bd Rent"] - b["Avg 2bd Rent"]);

  return (
    <>
      {bedFilter === "1bd" && (
        <Card>
          <Title>Avg 1bd Rent by Neighborhood</Title>
          <BarChart
            className="mt-4 h-72"
            data={data1bd}
            index="city"
            categories={["Avg 1bd Rent"]}
            colors={["teal"]}
            valueFormatter={valueFormatter}
            layout="vertical"
            showLegend={false}
            yAxisWidth={140}
          />
        </Card>
      )}

      {bedFilter === "2bd" && (
        <Card>
          <Title>Avg 2bd Rent by Neighborhood</Title>
          <BarChart
            className="mt-4 h-72"
            data={data2bd}
            index="city"
            categories={["Avg 2bd Rent"]}
            colors={["indigo"]}
            valueFormatter={valueFormatter}
            layout="vertical"
            showLegend={false}
            yAxisWidth={140}
          />
        </Card>
      )}
    </>
  );
}
