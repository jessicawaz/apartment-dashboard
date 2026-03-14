import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import { useState } from "react";

export default function DecisionMatrix({ apartmentsWithRatings }) {
  const [sortKey, setSortKey] = useState("score");
  const [sortAsc, setSortAsc] = useState(false);

  const avgRating = (apt) => {
    if (!apt.ratings?.length) {
      return null;
    }

    return (
      apt.ratings.reduce((acc, r) => {
        return acc + r.rating;
      }, 0) / apt.ratings.length
    );
  };

  const getColor = (value, allValues, lowerIsBetter) => {
    // Spread allValues to new array to avoid mutation
    const sortedValues = [...allValues].sort((a, b) => {
      if (lowerIsBetter) {
        return a - b;
      } else {
        return b - a;
      }
    });

    const rank = sortedValues.indexOf(value) / (sortedValues.length - 1);

    if (lowerIsBetter) {
      if (rank <= 0.33) {
        return "bg-green-100 text-green-800";
      } else if (rank <= 0.66) {
        return "bg-yellow-100 text-yellow-800";
      } else {
        return "bg-red-100 text-red-800";
      }
    } else {
      if (rank >= 0.66) {
        return "bg-green-100 text-green-800";
      } else if (rank >= 0.33) {
        return "bg-yellow-100 text-yellow-800";
      } else {
        return "bg-red-100 text-red-800";
      }
    }
  };

  const getBoolColor = (val) =>
    val ? "bg-green-100 text-green-800" : "text-gray-400";

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc((dir) => !dir);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sorted = [...apartmentsWithRatings].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];

    // handle computed fields not directly on the object
    if (sortKey === "rating") {
      valA = avgRating(a);
      valB = avgRating(b);
    }

    if (typeof valA === "string") {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    if (typeof valA === "boolean") {
      const boolVal = (v) => (v ? 1 : -1);
      return sortAsc
        ? boolVal(valA) - boolVal(valB)
        : boolVal(valB) - boolVal(valA);
    }

    valA = valA ?? (sortAsc ? Infinity : -Infinity);
    valB = valB ?? (sortAsc ? Infinity : -Infinity);

    return sortAsc ? valA - valB : valB - valA;
  });

  const all1bdPrices = apartmentsWithRatings.map((a) => a.price1bd);
  const all2bdPrices = apartmentsWithRatings.map((a) => a.price2bd);
  const allCommutes = apartmentsWithRatings.map((a) => a.commute);
  const allRatings = apartmentsWithRatings.map((a) => avgRating(a));
  const allScores = apartmentsWithRatings.map((a) => a.score);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell onClick={() => handleSort("name")}>
            Name
          </TableHeaderCell>
          <TableHeaderCell onClick={() => handleSort("price1bd")}>
            1bd Price
          </TableHeaderCell>
          <TableHeaderCell onClick={() => handleSort("price2bd")}>
            2bd Price
          </TableHeaderCell>
          <TableHeaderCell onClick={() => handleSort("commute")}>
            Commute
          </TableHeaderCell>
          <TableHeaderCell onClick={() => handleSort("garage")}>
            Garage
          </TableHeaderCell>
          <TableHeaderCell onClick={() => handleSort("balcony")}>
            Balcony
          </TableHeaderCell>
          <TableHeaderCell onClick={() => handleSort("toured")}>
            Toured
          </TableHeaderCell>
          <TableHeaderCell onClick={() => handleSort("rating")}>
            Avg Rating
          </TableHeaderCell>
          <TableHeaderCell onClick={() => handleSort("score")}>
            Score
          </TableHeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {sorted.map((apt) => {
          return (
            <TableRow key={apt.apartment_id}>
              <TableCell>{apt.name}</TableCell>
              <TableCell className={getColor(apt.price1bd, all1bdPrices, true)}>
                ${apt.price1bd}
              </TableCell>
              <TableCell className={getColor(apt.price2bd, all2bdPrices, true)}>
                ${apt.price2bd}
              </TableCell>
              <TableCell className={getColor(apt.commute, allCommutes, true)}>
                {apt.commute} min
              </TableCell>
              <TableCell className={getBoolColor(apt.garage)}>
                {apt.garage ? "Yes" : "No"}
              </TableCell>
              <TableCell className={getBoolColor(apt.balcony)}>
                {apt.balcony ? "Yes" : "No"}
              </TableCell>
              <TableCell className={getBoolColor(apt.toured)}>
                {apt.toured ? "Yes" : "No"}
              </TableCell>
              <TableCell
                className={getColor(avgRating(apt), allRatings, false)}
              >
                {avgRating(apt) ? avgRating(apt)?.toFixed(2) / 5 : "-"}
              </TableCell>
              <TableCell className={getColor(apt.score, allScores, false)}>
                {apt.score?.toFixed(2)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
