export const FIELDS = [
  { label: "Apartment Name", key: "name", type: "text", required: true },
  { label: "City", key: "city", type: "text", required: true },
  { label: "1 Bed Price", key: "price1bd", type: "number", required: true },
  {
    label: "2 Bed Price (optional)",
    key: "price2bd",
    type: "number",
    required: false,
  },
  {
    label: "Commute (minutes)",
    key: "commute",
    type: "number",
    required: true,
  },
  { label: "Garage?", key: "garage", type: "select", required: true },
  {
    label: "Screened Balcony?",
    key: "balcony",
    type: "select",
    required: true,
  },
  { label: "Toured?", key: "toured", type: "select", required: true },
  { label: "Notes", key: "notes", type: "textarea", required: false },
];

export const EMPTY_FORM = {
  name: "",
  city: "",
  price1bd: 0,
  price2bd: 0,
  commute: 0,
  garage: "no",
  balcony: "no",
  toured: "no",
  notes: "",
};

export function toDbValues(form, groupId) {
  return {
    name: form.name,
    city: form.city,
    price1bd: form.price1bd,
    price2bd: form.price2bd || null,
    commute: form.commute,
    garage: form.garage === "yes" ? true : form.garage === "no" ? false : null,
    balcony:
      form.balcony === "yes" ? true : form.balcony === "no" ? false : null,
    toured: form.toured === "yes",
    notes: form.notes || null,
    group_id: groupId,
  };
}

export function fromDbValues(apt) {
  return {
    name: apt.name ?? "",
    city: apt.city ?? "",
    price1bd: apt.price1bd ?? 0,
    price2bd: apt.price2bd ?? 0,
    commute: apt.commute ?? 0,
    garage: apt.garage === true ? "yes" : apt.garage === false ? "no" : "maybe",
    balcony:
      apt.balcony === true ? "yes" : apt.balcony === false ? "no" : "maybe",
    toured: apt.toured ? "yes" : "no",
    notes: apt.notes ?? "",
  };
}
