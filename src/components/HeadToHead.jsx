import {
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

    return {
      betterPrice1bd:
        aptA.price1bd === aptB.price1bd
          ? null
          : aptA.price1bd < aptB.price1bd
            ? aptA
            : aptB,
      betterPrice2bd:
        !aptA.price2bd || !aptB.price2bd
          ? null
          : aptA.price2bd === aptB.price2bd
            ? null
            : aptA.price2bd < aptB.price2bd
              ? aptA
              : aptB,
      betterCommute:
        !aptA.commute || !aptB.commute
          ? null
          : aptA.commute === aptB.commute
            ? null
            : aptA.commute < aptB.commute
              ? aptA
              : aptB,
      betterPersonalRating:
        !getPersonalRating(aptA.ratings) || !getPersonalRating(aptB.ratings)
          ? null
          : getPersonalRating(aptA.ratings) === getPersonalRating(aptB.ratings)
            ? null
            : getPersonalRating(aptA.ratings) > getPersonalRating(aptB.ratings)
              ? aptA
              : aptB,
      betterAvgRating:
        !getAvgRating(aptA.ratings) || !getAvgRating(aptB.ratings)
          ? null
          : getAvgRating(aptA.ratings) === getAvgRating(aptB.ratings)
            ? null
            : getAvgRating(aptA.ratings) > getAvgRating(aptB.ratings)
              ? aptA
              : aptB,
      betterScore:
        !aptA.score || !aptB.score
          ? null
          : aptA.score === aptB.score
            ? null
            : aptA.score > aptB.score
              ? aptA
              : aptB,
    };
  }, [aptA, aptB, getPersonalRating, getAvgRating]);

  
  const cellColor = (aptId, betterAptId, value) => {
    // no value - no color
    if (value === null || value === undefined) {
      return "";
    }

    // tie - no color
    if (!betterAptId) {
      return "";
    }

    return betterAptId === aptId
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };
  console.log({ apartmentsWithRatings });
  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            Apartment A
          </label>
          <Select
            value={aptA?.apartment_id ?? ""}
            onValueChange={(id) =>
              setAptA(apartmentsWithRatings.find((a) => a.apartment_id === id))
            }
          >
            {apartmentsWithRatings
              .filter((a) => a.apartment_id !== aptB?.apartment_id)
              .map((apt) => (
                <SelectItem key={apt.apartment_id} value={apt.apartment_id}>
                  {apt.name}
                </SelectItem>
              ))}
          </Select>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            Apartment B
          </label>
          <Select
            value={aptB?.apartment_id ?? ""}
            onValueChange={(id) =>
              setAptB(apartmentsWithRatings.find((a) => a.apartment_id === id))
            }
          >
            {apartmentsWithRatings
              .filter((a) => a.apartment_id !== aptA?.apartment_id)
              .map((apt) => (
                <SelectItem key={apt.apartment_id} value={apt.apartment_id}>
                  {apt.name}
                </SelectItem>
              ))}
          </Select>
        </div>
      </div>

      {!aptA || !aptB ? (
        <>Select two apartments to compare.</>
      ) : (
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
            {apartmentsWithRatings
              .filter(
                (apt) =>
                  apt.apartment_id === aptA.apartment_id ||
                  apt.apartment_id === aptB.apartment_id,
              )
              .map((apt) => {
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
                    <TableCell
                      className={
                        apt.garage
                          ? "bg-green-100 text-green-800"
                          : "text-gray-400"
                      }
                    >
                      {apt.garage ? "Yes" : "No"}
                    </TableCell>
                    <TableCell
                      className={
                        apt.balcony
                          ? "bg-green-100 text-green-800"
                          : "text-gray-400"
                      }
                    >
                      {apt.balcony ? "Yes" : "No"}
                    </TableCell>
                    <TableCell
                      className={
                        apt.toured
                          ? "bg-green-100 text-green-800"
                          : "text-gray-400"
                      }
                    >
                      {apt.toured ? "Yes" : "No"}
                    </TableCell>
                    <TableCell
                      className={cellColor(
                        apt.apartment_id,
                        comparison.betterAvgRating?.apartment_id,
                        getAvgRating(apt.ratings),
                      )}
                    >
                      {getAvgRating(apt.ratings)
                        ? `${getAvgRating(apt.ratings)} / 5`
                        : "—"}
                    </TableCell>
                    <TableCell
                      className={cellColor(
                        apt.apartment_id,
                        comparison.betterPersonalRating?.apartment_id,
                        getPersonalRating(apt.ratings),
                      )}
                    >
                      {getPersonalRating(apt.ratings)
                        ? `${getPersonalRating(apt.ratings)} / 5`
                        : "—"}
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
      )}
    </>
  );
}
