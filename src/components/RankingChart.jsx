import { Card, Title, BarChart } from "@tremor/react";

const TIERS = [
  { key: "top", label: "Top tier",   color: "emerald" },
  { key: "mid", label: "Mid tier",   color: "blue"    },
  { key: "low", label: "Lower tier", color: "rose"    },
];

function RankingPanel({ title, data }) {
  const sorted = [...data].sort((a, b) => b.composite - a.composite);

  return (
    <Card>
      <Title>{title}</Title>
      <p className="text-xs text-gray-500 mt-1">Price 40% · Commute 35% · Amenities 25%</p>
      <div className="mt-4 space-y-4">
        {TIERS.map(({ key, label, color }) => {
          const tierData = sorted
            .filter(a => a.tier === key)
            .map(a => ({ name: a.name, Score: parseFloat(a.composite.toFixed(3)) }));
          if (!tierData.length) return null;
          return (
            <div key={key}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
              <div style={{ height: `${tierData.length * 56}px` }}>
              <BarChart
                className="h-full"
                data={tierData}
                index="name"
                categories={["Score"]}
                colors={[color]}
                valueFormatter={v => v.toFixed(2)}
                layout="vertical"
                showLegend={false}
                yAxisWidth={180}
                maxValue={1}
              />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function RankingChart({ apartmentsWithScores }) {
  const all = apartmentsWithScores.filter(a => a.commute != null);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RankingPanel title="Composite Ranking — 1bd/1ba" data={all} />
      <RankingPanel title="Composite Ranking — 2bd/2ba" data={all.filter(a => a.price2bd != null)} />
    </div>
  );
}
