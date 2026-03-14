import { Card, Title, BarChart } from "@tremor/react";

const valueFormatter = (v) => `$${v.toLocaleString()}`;

export default function PriceChart({ apartmentsWithScores }) {
  const data1bd = [...apartmentsWithScores]
    .sort((a, b) => a.price1bd - b.price1bd)
    .map((a) => ({ name: a.name, "1bd/1ba": a.price1bd }));

  const data2bd = [...apartmentsWithScores]
    .filter((a) => a.price2bd != null)
    .sort((a, b) => a.price2bd - b.price2bd)
    .map((a) => ({ name: a.name, "2bd/2ba": a.price2bd }));

  return (
    <div className="space-y-6" style={{ width: "100%", minHeight: 300 }}>
      <PricePanel
        title="1bd/1ba — Monthly Rent"
        data={data1bd}
        category="1bd/1ba"
        color="teal"
      />

      <PricePanel
        title="2bd/2ba — Monthly Rent"
        data={data2bd}
        category="2bd/2ba"
        color="indigo"
      />
    </div>
  );
}

function PricePanel({ title, data, category, color }) {
  return (
    <Card>
      <Title>{title}</Title>
      <BarChart
        className="mt-4 h-[480px]"
        data={data}
        index="name"
        categories={[category]}
        colors={[color]}
        valueFormatter={valueFormatter}
        layout="vertical"
        showLegend={false}
        yAxisWidth={180}
      />
    </Card>
  );
}
