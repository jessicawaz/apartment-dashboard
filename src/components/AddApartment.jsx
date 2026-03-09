import { Button } from "@tremor/react";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { toDbValues } from "../lib/fields";
import ApartmentForm from "./ApartmentForm";
import { useAuth } from "../hooks/useAuth";

export default function AddApartment({ onSave, users }) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);

  async function handleSubmit(form) {
    const { error } = await supabase
      .from("apartments")
      .insert([toDbValues(form, profile.group_id)]);
    if (!error) {
      setOpen(false);
      onSave?.();
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        + Add Apartment
      </Button>
      <ApartmentForm
        users={users}
        open={open}
        setOpen={setOpen}
        heading="Add Apartment"
        onSave={handleSubmit}
      />
    </>
  );
}
