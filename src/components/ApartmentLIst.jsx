import {
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import { useState } from "react";
import { FaMinusCircle, FaBan } from "react-icons/fa";

import { supabase } from "../lib/supabase";
import { toDbValues, fromDbValues } from "../lib/fields";
import ApartmentForm from "./ApartmentForm";
import { useAuth } from "../hooks/useAuth";
import { Label } from "@radix-ui/react-label";

export default function ApartmentList({ apartments, onSave, users }) {
  const { profile } = useAuth();
  const [editApt, setEditApt] = useState(null);
  const [hideDismissed, setHideDismissed] = useState(true);

  const apartmentsFiltered = hideDismissed
    ? apartments.filter((a) => !a.is_dismissed)
    : apartments;

  async function handleUpdate(form) {
    const { error } = await supabase
      .from("apartments")
      .update(toDbValues(form, profile.group_id))
      .eq("apartment_id", editApt.apartment_id);

    if (!error) {
      setEditApt(null);
      onSave?.();
    }
  }

  async function handleDelete() {
    const { error } = await supabase
      .from("apartments")
      .delete()
      .eq("apartment_id", editApt.apartment_id);
    if (!error) {
      setEditApt(null);
      onSave?.();
    }
  }

  async function handleRating(ratingsMap) {
    const upserts = Object.entries(ratingsMap)?.map(([userId, rating]) => ({
      user_id: userId,
      apartment_id: editApt.apartment_id,
      rating,
    }));
    const { error } = await supabase.from("user_ratings").upsert(upserts);
    if (!error) {
      setEditApt(null);
      onSave?.();
    }
  }

  return (
    <div className="rounded-xl overflow-x-auto border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-700">Apartments</span>
        <div className="flex items-center gap-2">
          <Label
            htmlFor="hideDismissed"
            className="text-sm text-gray-500 cursor-pointer"
          >
            Hide Dismissed
          </Label>
          <Switch
            id="hideDismissed"
            defaultChecked
            onChange={() => setHideDismissed((d) => !d)}
          />
        </div>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Actions</TableHeaderCell>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>City</TableHeaderCell>
            {users.map((user) => (
              <TableHeaderCell key={user.user_id}>
                {user.name}'s Rating
              </TableHeaderCell>
            ))}
            <TableHeaderCell>1bd Price</TableHeaderCell>
            <TableHeaderCell>2bd Price</TableHeaderCell>
            <TableHeaderCell className="max-w-xs truncate">
              Notes
            </TableHeaderCell>
            <TableHeaderCell>Date Added</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {apartmentsFiltered?.map((apt) => (
            <ApartmentRow
              key={apt.apartment_id}
              apt={apt}
              setEditApt={setEditApt}
              onSave={onSave}
              users={users}
            />
          ))}
        </TableBody>
      </Table>

      <ApartmentForm
        key={editApt?.id ?? "edit"}
        users={users}
        open={editApt !== null}
        setOpen={() => setEditApt(null)}
        heading={`Edit ${editApt?.name ?? ""}`}
        presetData={editApt ? fromDbValues(editApt) : undefined}
        presetRatings={editApt?.ratings ?? []}
        onSave={handleUpdate}
        onDelete={handleDelete}
        addRating={handleRating}
      />
    </div>
  );
}

const ApartmentRow = ({ apt, setEditApt, users, onSave }) => {
  async function handleDismiss(e) {
    e.stopPropagation(); // Doesn't allow form to open on click
    const { error } = await supabase
      .from("apartments")
      .update({ is_dismissed: true })
      .eq("apartment_id", apt.apartment_id);

    if (!error) {
      onSave?.();
    }
  }

  return (
    <TableRow
      className={`${apt.is_dismissed ? "opacity-50" : "cursor-pointer hover:bg-gray-50"}`}
      onClick={() => {
        if (apt.is_dismissed) {
          return;
        } else {
          setEditApt(apt);
        }
      }}
    >
      <TableCell>
        <button
          onClick={handleDismiss}
          title="Dismiss"
          className="text-red-400 hover:text-red-600 transition-colors"
        >
          <FaMinusCircle size={18} />
        </button>
      </TableCell>
      <TableCell>{apt.name}</TableCell>
      <TableCell>{apt.city}</TableCell>
      {users.map((user) => {
        const rating = apt.ratings?.find(
          (r) => r.user_id === user.user_id,
        )?.rating;
        return (
          <TableCell key={user.user_id}>
            {rating ? `${rating}/5` : "—"}
          </TableCell>
        );
      })}
      <TableCell>${apt.price1bd?.toLocaleString()}</TableCell>
      <TableCell>
        {apt.price2bd ? `$${apt.price2bd.toLocaleString()}` : "—"}
      </TableCell>
      <TableCell className="max-w-xs truncate">{apt.notes ?? "—"}</TableCell>
      <TableCell>
        {apt.created_at ? new Date(apt.created_at).toDateString() : "—"}
      </TableCell>
    </TableRow>
  );
};
