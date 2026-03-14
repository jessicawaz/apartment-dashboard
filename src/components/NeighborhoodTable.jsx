import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import { useMemo, useState } from "react";

export default function NeighborhoodTable({ apartmentsWithScores }) {
  const [sortKey, setSortKey] = useState("avg1bd");
  const [sortAsc, setSortAsc] = useState(true);

  const calculateAvg = (arr, field) => {
    return arr.reduce((sum, value) => sum + value[field], 0) / arr.length || 0;
  };

  // Group apartments by city
  const grouped = useMemo(() => {
    const cityMap = {};

    apartmentsWithScores?.forEach((apt) => {
      if (!cityMap[apt.city]) {
        // first time seeing this city — initialize it
        cityMap[apt.city] = {
          city: apt.city,
          apts: [], // collect all apartments, compute stats after
        };
      }
      // just push the apartment, compute averages after
      cityMap[apt.city].apts.push(apt);
    });

    return Object.values(cityMap)
      .map(({ city, apts }) => {
        const with1bd = apts.filter((apt) => apt.price1bd);
        const with2bd = apts.filter((apt) => apt.price2bd);
        const withCommute = apts.filter((apt) => apt.commute);

        return {
          city,
          count: apts.length ?? 0,
          avg1bd: calculateAvg(with1bd, "price1bd"),
          avg2bd: calculateAvg(with2bd, "price2bd"),
          avgCommute: calculateAvg(withCommute, "commute"),
          toured: apts.filter((apt) => apt.toured)?.length || 0,
        };
      })
      .sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (typeof valA === "string") {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        return sortAsc ? valA - valB : valB - valA;
      });
  }, [apartmentsWithScores, sortKey, sortAsc]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc((dir) => !dir);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
    return;
  };

  return (
    <div className="rounded-xl overflow-x-auto border border-gray-200 shadow-sm">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell onClick={() => handleSort("city")}>
              City
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort("count")}>
              Count
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort("avg1bd")}>
              Avg 1bd Price
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort("avg2bd")}>
              Avg 2bd Price
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort("commute")}>
              Avg Commute
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort("toured")}>
              Toured
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {grouped?.map((group) => (
            <TableRow
              key={group.city}
              className="cursor-pointer hover:bg-gray-50"
            >
              <TableCell>{group.city}</TableCell>
              <TableCell>{group.count}</TableCell>
              <TableCell>${group.avg1bd?.toLocaleString()}</TableCell>
              <TableCell>${group.avg2bd?.toLocaleString()}</TableCell>
              <TableCell>
                {group.avgCommute?.toLocaleString()} minutes
              </TableCell>
              <TableCell>
                {group.toured} of {group.count}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
