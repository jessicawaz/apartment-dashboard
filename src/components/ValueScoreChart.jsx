import { Card, Title, BarChart } from "@tremor/react";

const valueFormatter = (v) => `$${v}/min`;

export default function ValueScoreChart({ apartmentsWithScores }) {
  const data = apartmentsWithScores
    .filter((a) => a.commute != null)
    .map((a) => ({
      name: a.name,
      "$/min": parseFloat((a.price1bd / a.commute).toFixed(1)),
    }))
    .sort((a, b) => a["$/min"] - b["$/min"]);
    
  return (
    <Card>
      <Title>Value Score — Price per Commute Minute (lower = better)</Title>
      <BarChart
        className="mt-4 h-96"
        data={data}
        index="name"
        categories={["$/min"]}
        colors={["teal"]}
        valueFormatter={valueFormatter}
        layout="vertical"
        showLegend={false}
        yAxisWidth={180}
      />
    </Card>
  );
}
