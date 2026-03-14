import {
  Button,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import { useCallback, useMemo, useState } from "react";

export default function HeadToHead({ apartmentsWithRatings, profile }) {
  const [aptA, setAptA] = useState(null);
  const [aptB, setAptB] = useState(null);
  const [showTable, setShowTable] = useState(false);

  const getPersonalRating = useCallback(
    (ratings) => {
      return (
        ratings?.find(({ user_id }) => user_id === profile.user_id) ?? null
      )?.rating;
    },
    [profile.user_id],
  );

  const getAvgRating = useCallback((ratings) => {
    if (!ratings?.length) {
      return null;
    }
    return ratings.reduce((acc, r) => acc + r.rating, 0) / ratings?.length;
  }, []);

  const comparison = useMemo(() => {
    if (!aptA || !aptB) {
      return null;
    }

    const better = (a, b, getValue, higherIsBetter = false) => {
      const valA = getValue(a);
      const valB = getValue(b);

      if (!valA || !valB || valA === valB) {
        return null;
      }

      return higherIsBetter ? (valA > valB ? a : b) : valA < valB ? a : b;
    };

    return {
      betterPrice1bd: better(aptA, aptB, (apt) => apt.price1bd),
      betterPrice2bd: better(aptA, aptB, (apt) => apt.price2bd),
      betterCommute: better(aptA, aptB, (apt) => apt.commute),
      betterPersonalRating: better(
        aptA,
        aptB,
        (apt) => getPersonalRating(apt.ratings),
        true,
      ),
      betterAvgRating: better(
        aptA,
        aptB,
        (apt) => getAvgRating(apt.ratings),
        true,
      ),
      betterScore: better(aptA, aptB, (apt) => apt.score, true),
    };
  }, [aptA, aptB, getPersonalRating, getAvgRating]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-7 mb-6">
        <ApartmentSelect
          label="Apartment A"
          value={aptA}
          onChange={setAptA}
          exclude={aptB}
          apartments={apartmentsWithRatings}
        />
        <ApartmentSelect
          label="Apartment B"
          value={aptB}
          onChange={setAptB}
          exclude={aptA}
          apartments={apartmentsWithRatings}
        />
      </div>

      {!aptA || !aptB ? (
        <>Select two apartments to compare.</>
      ) : (
        <>
          <WinnerCard aptA={aptA} aptB={aptB} comparison={comparison} />

          <Button
            className="h-10 mb-2"
            variant="secondary"
            onClick={() => setShowTable((s) => !s)}
          >
            {showTable ? "Hide" : "Show"} Comparison
          </Button>

          {showTable && (
            <ComparisonTable
              aptA={aptA}
              aptB={aptB}
              comparison={comparison}
              getPersonalRating={getPersonalRating}
              getAvgRating={getAvgRating}
            />
          )}
        </>
      )}
    </>
  );
}

const ApartmentSelect = ({ label, value, onChange, exclude, apartments }) => (
  <div>
    <label className="text-sm text-gray-600 mb-1 block">{label}</label>
    <Select
      value={value?.apartment_id ?? ""}
      onValueChange={(id) =>
        onChange(apartments.find((a) => a.apartment_id === id))
      }
    >
      {apartments
        .filter((a) => a.apartment_id !== exclude?.apartment_id)
        .map((apt) => (
          <SelectItem key={apt.apartment_id} value={apt.apartment_id}>
            {apt.name}
          </SelectItem>
        ))}
    </Select>
  </div>
);

const Badge = ({ good, children }) => (
  <span
    className={`text-xs px-2 py-1 rounded-full ${
      good ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    }`}
  >
    {children}
  </span>
);

const WinnerCard = ({ aptA, aptB, comparison }) => {
  if (!aptA || !aptB || !comparison) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {[aptA, aptB].map((apt) => {
        const other = apt === aptA ? aptB : aptA;
        const isBetter = (field) =>
          comparison[field]?.apartment_id === apt.apartment_id;

        const badges = [
          {
            field: "betterPrice2bd",
            good: isBetter("betterPrice2bd"),
            goodLabel: "💰 Lower 2b Price",
            badLabel: "💰 Higher 2b Price",
          },
          {
            field: "betterCommute",
            good: isBetter("betterCommute"),
            goodLabel: "🚗 Shorter Commute",
            badLabel: "🚗 Longer Commute",
          },
          {
            field: "betterAvgRating",
            good: isBetter("betterAvgRating"),
            goodLabel: "⭐ Higher Rating",
            badLabel: "⭐ Lower Rating",
          },
          {
            field: "betterScore",
            good: isBetter("betterScore"),
            goodLabel: "🏆 Better Score",
            badLabel: "🏆 Worse Score",
          },
        ];

        const featureBadges = [
          {
            differs: apt.garage !== other.garage,
            has: apt.garage,
            goodLabel: "🚘 Has Garage",
            badLabel: "🚘 No Garage",
          },
          {
            differs: apt.balcony !== other.balcony,
            has: apt.balcony,
            goodLabel: "🌿 Has Balcony",
            badLabel: "🌿 No Balcony",
          },
        ];

        return (
          <div
            key={apt.apartment_id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
              {apt === aptA ? "Apartment A" : "Apartment B"}
            </p>
            <p className="text-lg font-bold text-gray-900">{apt.name}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {badges
                .filter(({ field }) => comparison[field] !== null)
                .map(({ field, good, goodLabel, badLabel }) => (
                  <Badge key={field} good={good}>
                    {good ? goodLabel : badLabel}
                  </Badge>
                ))}
              {featureBadges
                .filter(({ differs }) => differs)
                .map(({ has, goodLabel, badLabel }) => (
                  <Badge key={goodLabel} good={has}>
                    {has ? goodLabel : badLabel}
                  </Badge>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ComparisonTable = ({
  aptA,
  aptB,
  comparison,
  getPersonalRating,
  getAvgRating,
}) => {
  const cellColor = (aptId, betterAptId, value) => {
    // no value - no color
    if (!value || !betterAptId) {
      return "";
    }

    return betterAptId === aptId
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const boolCellColor = (val) =>
    val ? "bg-green-100 text-green-800" : "text-gray-400";

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>1bd Price</TableHeaderCell>
          <TableHeaderCell>2bd Price</TableHeaderCell>
          <TableHeaderCell>Commute</TableHeaderCell>
          <TableHeaderCell>Garage</TableHeaderCell>
          <TableHeaderCell>Balcony</TableHeaderCell>
          <TableHeaderCell>Toured</TableHeaderCell>
          <TableHeaderCell>Avg Rating</TableHeaderCell>
          <TableHeaderCell>Your Rating</TableHeaderCell>
          <TableHeaderCell>Score</TableHeaderCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {[aptA, aptB].map((apt) => {
          const avgRating = getAvgRating(apt.ratings);
          const personalRating = getPersonalRating(apt.ratings);

          return (
            <TableRow key={apt.apartment_id}>
              <TableCell>{apt.name}</TableCell>
              <TableCell
                className={cellColor(
                  apt.apartment_id,
                  comparison.betterPrice1bd?.apartment_id,
                  apt.price1bd,
                )}
              >
                ${apt.price1bd}
              </TableCell>
              <TableCell
                className={cellColor(
                  apt.apartment_id,
                  comparison.betterPrice2bd?.apartment_id,
                  apt.price2bd,
                )}
              >
                ${apt.price2bd}
              </TableCell>
              <TableCell
                className={cellColor(
                  apt.apartment_id,
                  comparison.betterCommute?.apartment_id,
                  apt.commute,
                )}
              >
                {apt.commute ? `${apt.commute} min` : "—"}
              </TableCell>
              <TableCell className={boolCellColor(apt.garage)}>
                {apt.garage ? "Yes" : "No"}
              </TableCell>
              <TableCell className={boolCellColor(apt.balcony)}>
                {apt.balcony ? "Yes" : "No"}
              </TableCell>
              <TableCell className={boolCellColor(apt.toured)}>
                {apt.toured ? "Yes" : "No"}
              </TableCell>
              <TableCell
                className={cellColor(
                  apt.apartment_id,
                  comparison.betterAvgRating?.apartment_id,
                  avgRating,
                )}
              >
                {avgRating ? `${avgRating} / 5` : "—"}
              </TableCell>
              <TableCell
                className={cellColor(
                  apt.apartment_id,
                  comparison.betterPersonalRating?.apartment_id,
                  personalRating,
                )}
              >
                {personalRating ? `${personalRating} / 5` : "—"}
              </TableCell>
              <TableCell
                className={cellColor(
                  apt.apartment_id,
                  comparison.betterScore?.apartment_id,
                  apt.score,
                )}
              >
                {apt.score ? apt.score?.toFixed(2) : "—"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
