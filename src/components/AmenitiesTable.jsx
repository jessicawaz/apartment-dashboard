import {
  Card,
  Title,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
} from "@tremor/react";

function YesNo({ value }) {
  if (value === true) return <Badge color="emerald">Yes</Badge>;
  if (value === false) return <Badge color="rose">No</Badge>;
  return <Badge color="gray">Maybe</Badge>;
}

export default function AmenitiesTable({ apartmentsWithScores }) {
  const sorted = [...apartmentsWithScores].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  return (
    <Card>
      <Title>Amenities & Status</Title>
      <div className="overflow-x-auto">
      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Apartment</TableHeaderCell>
            <TableHeaderCell>City</TableHeaderCell>
            <TableHeaderCell>1bd Price</TableHeaderCell>
            <TableHeaderCell>Commute</TableHeaderCell>
            <TableHeaderCell>Garage</TableHeaderCell>
            <TableHeaderCell>Screened Balcony</TableHeaderCell>
            <TableHeaderCell>Toured</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((a) => (
            <TableRow key={a.name}>
              <TableCell className="font-medium">{a.name}</TableCell>
              <TableCell>{a.city}</TableCell>
              <TableCell>${a.price1bd?.toLocaleString()}/mo</TableCell>
              <TableCell>
                {a.commute != null ? `${a.commute} min` : "—"}
              </TableCell>
              <TableCell>
                <YesNo value={a.garage} />
              </TableCell>
              <TableCell>
                <YesNo value={a.balcony} />
              </TableCell>
              <TableCell>
                {a.toured ? (
                  <Badge color="purple">Toured</Badge>
                ) : (
                  <Badge color="gray">Not yet</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </Card>
  );
}
