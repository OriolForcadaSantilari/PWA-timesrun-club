"use client";

import { maskPaceInput } from "@/lib/types";
import { useState } from "react";

type PaceFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
};

export function PaceField({
  label,
  name,
  placeholder = "5:30",
  defaultValue = "",
}: PaceFieldProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <label className="flex flex-col gap-2 text-[11px] tracking-[0.18em] uppercase">
      {label}
      <input
        name={name}
        value={value}
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        required
        onChange={(event) => setValue(maskPaceInput(event.target.value))}
        className="h-11 border border-white/20 bg-transparent px-3 text-sm tracking-normal normal-case text-[#f4efe6] outline-none placeholder:text-white/30 focus:border-white"
      />
    </label>
  );
}
