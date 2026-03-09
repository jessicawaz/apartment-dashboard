import { Select, SelectItem } from "@tremor/react";

export default function BedFilter({ bedFilter, setBedFilter }) {
  return (
    <div className="max-w-xs">
      <Select value={bedFilter} onValueChange={setBedFilter}>
        <SelectItem value="1bd">1 Bed</SelectItem>
        <SelectItem value="2bd">2 Bed</SelectItem>
      </Select>
    </div>
  );
}
