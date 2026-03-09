import { Card, Title, ScatterChart } from "@tremor/react";

export default function CommuteScatter({ apartmentsWithScores }) {
  const data = apartmentsWithScores
    .filter((a) => a.commute != null)
    .map((a) => ({ name: a.name, commute: a.commute, price: a.price1bd }));

  return (
    <Card>
      <Title>Price vs. Commute Time</Title>
      <ScatterChart
        className="mt-4 h-80"
        data={data}
        x="commute"
        y="price"
        category="name"
        autoMinYValue
        minYValue={1400}
        valueFormatter={{
          x: (v) => `${v} min`,
          y: (v) => `$${v.toLocaleString()}`,
        }}
        showLegend={false}
      />
    </Card>
  );
}
