import { Card, Title, BarChart } from "@tremor/react";

function UserRankingPanel({ user, apartments }) {
  const rated = apartments
    .map((apt) => {
      const r = apt.ratings?.find((r) => r.user_id === user.user_id);
      return r ? { name: apt.name, Rating: parseInt(r.rating) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.Rating - a.Rating);

  return (
    <Card>
      <Title>{user.name}'s Rankings</Title>
      {rated.length === 0 ? (
        <p className="text-sm text-gray-400 mt-4">No ratings yet.</p>
      ) : (
        <div style={{ height: `${rated.length * 56}px` }} className="mt-4">
          <BarChart
            className="h-full"
            data={rated}
            index="name"
            categories={["Rating"]}
            colors={["blue"]}
            valueFormatter={(v) => `${v}/5`}
            layout="vertical"
            showLegend={false}
            yAxisWidth={180}
            maxValue={5}
          />
        </div>
      )}
    </Card>
  );
}

export default function UserRankings({ apartments, users }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {users.map((user) => (
        <UserRankingPanel key={user.user_id} user={user} apartments={apartments} />
      ))}
    </div>
  );
}
