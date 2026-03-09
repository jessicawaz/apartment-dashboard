import {
  Button,
  Dialog,
  DialogPanel,
  NumberInput,
  Select,
  SelectItem,
  Textarea,
  TextInput,
} from "@tremor/react";
import { useEffect, useState } from "react";
import { FIELDS, EMPTY_FORM } from "../lib/fields";
import { useAuth } from "../hooks/useAuth";

export function Field({ field, value, onChange }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
      </label>
      {field.type === "text" && (
        <TextInput
          value={value}
          onValueChange={onChange}
          required={field.required}
        />
      )}
      {field.type === "textarea" && (
        <Textarea
          value={value}
          onValueChange={onChange}
          required={field.required}
        />
      )}
      {field.type === "number" && (
        <NumberInput
          value={value}
          onValueChange={onChange}
          required={field.required}
        />
      )}
      {field.type === "select" && (
        <Select
          value={value ?? ""}
          onValueChange={onChange}
          required={field.required}
        >
          <SelectItem value="yes">Yes</SelectItem>
          <SelectItem value="no">No</SelectItem>
          <SelectItem value="maybe">Maybe</SelectItem>
        </Select>
      )}
    </div>
  );
}

export default function ApartmentForm({
  users,
  open,
  setOpen,
  onSave,
  heading,
  presetData,
  presetRatings = [],
  onDelete = null,
  addRating = null,
}) {
  const { profile } = useAuth();
  const [form, setForm] = useState(presetData ?? EMPTY_FORM);
  const [ratings, setRatings] = useState(
    Object.fromEntries(presetRatings.map((r) => [r.user_id, r.rating])),
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(presetData ?? EMPTY_FORM);
    setRatings(
      Object.fromEntries(
        (presetRatings ?? []).map((r) => [r.user_id, r.rating]),
      ),
    );
  }, [presetData]); // eslint-disable-line react-hooks/exhaustive-deps

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogPanel className="max-w-lg">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {heading}
          </h3>
          {typeof onDelete === "function" && (
            <Button
              variant="secondary"
              color="red"
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
            >
              Delete
            </Button>
          )}
        </div>

        {FIELDS.map((field) => (
          <Field
            key={field.key}
            field={field}
            value={form[field.key]}
            onChange={(v) => setField(field.key, v)}
          />
        ))}

        {form.toured !== "no" &&
          typeof addRating === "function" &&
          users
            .filter((user) => user.user_id === profile.user_id)
            .map((user) => (
              <RatingFields
                key={user.user_id}
                user={user}
                value={ratings[user.user_id] ?? ""}
                onChange={(v) =>
                  setRatings((prev) => ({ ...prev, [user.user_id]: v }))
                }
              />
            ))}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(form);
              addRating?.(ratings);
            }}
          >
            Save
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

function RatingFields({ user, value, onChange }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {user.name}'s Rating
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectItem value={"1"}>1</SelectItem>
        <SelectItem value={"2"}>2</SelectItem>
        <SelectItem value={"3"}>3</SelectItem>
        <SelectItem value={"4"}>4</SelectItem>
        <SelectItem value={"5"}>5</SelectItem>
      </Select>
    </div>
  );
}
