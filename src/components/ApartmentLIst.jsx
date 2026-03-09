import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { toDbValues, fromDbValues } from "../lib/fields";
import ApartmentForm from "./ApartmentForm";
import { useAuth } from "../hooks/useAuth";

export default function ApartmentList({ apartments, onSave, users }) {
  const { profile } = useAuth();
  const [editApt, setEditApt] = useState(null);

  async function handleUpdate(form) {
    const { error } = await supabase
      .from("apartments")
      .insert([toDbValues(form, profile.group_id)])
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
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>City</TableHeaderCell>
            {users.map((user) => (
              <TableHeaderCell>{user.name}'s Rating</TableHeaderCell>
            ))}
            <TableHeaderCell>1bd Price</TableHeaderCell>
            <TableHeaderCell>2bd Price</TableHeaderCell>
            <TableHeaderCell>Commute (min)</TableHeaderCell>
            <TableHeaderCell>Garage</TableHeaderCell>
            <TableHeaderCell>Balcony</TableHeaderCell>
            <TableHeaderCell>Toured</TableHeaderCell>
            <TableHeaderCell className="max-w-xs truncate">
              Notes
            </TableHeaderCell>
            <TableHeaderCell>Date Added</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {apartments?.map((apt) => (
            <TableRow
              key={apt.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => setEditApt(apt)}
            >
              <TableCell>{apt.name}</TableCell>
              <TableCell>{apt.city}</TableCell>
              {users.map((user) => {
                const rating = apt.ratings?.find(
                  (r) => r.user_id === user.user_id,
                )?.rating;

                return <TableCell>{rating ? `${rating}/5` : "—"}</TableCell>;
              })}
              <TableCell>${apt.price1bd?.toLocaleString()}</TableCell>
              <TableCell>
                {apt.price2bd ? `$${apt.price2bd.toLocaleString()}` : "—"}
              </TableCell>
              <TableCell>{apt.commute ?? "—"}</TableCell>
              <TableCell>{apt.garage ? "Yes" : "No"}</TableCell>
              <TableCell>{apt.balcony ? "Yes" : "No"}</TableCell>
              <TableCell>{apt.toured ? "Yes" : "No"}</TableCell>
              <TableCell className="max-w-xs truncate">
                {apt.notes ?? "—"}
              </TableCell>
              <TableCell>
                {apt.created_at ? new Date(apt.created_at).toDateString() : "—"}
              </TableCell>
            </TableRow>
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
