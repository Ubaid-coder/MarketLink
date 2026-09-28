"use client";

import { FormEvent, useEffect, useState } from "react";
import { Clock3, MapPin, Save } from "lucide-react";

export interface MarketFormData {
  name: string;
  address: string;
  operatingDays: string[];
  openingTime: string;
  closingTime: string;
  latitude: string;
  longitude: string;
}

interface Props {
  initialData?: MarketFormData;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (data: MarketFormData) => Promise<void> | void;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const EMPTY_FORM: MarketFormData = {
  name: "",
  address: "",
  operatingDays: [],
  openingTime: "",
  closingTime: "",
  latitude: "",
  longitude: "",
};

export default function MarketForm({
  initialData,
  submitting = false,
  submitLabel = "Save Market",
  onSubmit,
}: Props) {
  const [form, setForm] = useState<MarketFormData>(
    initialData || EMPTY_FORM
  );

  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const update = (
    field: keyof MarketFormData,
    value: string | string[]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleDay = (day: string) => {
    const exists =
      form.operatingDays.includes(day);

    update(
      "operatingDays",
      exists
        ? form.operatingDays.filter(
            (item) => item !== day
          )
        : [...form.operatingDays, day]
    );
  };

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Market name is required.");
      return;
    }

    if (!form.address.trim()) {
      setError("Market address is required.");
      return;
    }

    if (!form.operatingDays.length) {
      setError(
        "Select at least one operating day."
      );
      return;
    }

    if (
      !form.openingTime ||
      !form.closingTime
    ) {
      setError(
        "Opening and closing times are required."
      );
      return;
    }

    if (
      form.openingTime >=
      form.closingTime
    ) {
      setError(
        "Closing time must be after opening time."
      );
      return;
    }

    const latitude =
      Number(form.latitude);

    const longitude =
      Number(form.longitude);

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      setError(
        "Enter a valid latitude between -90 and 90."
      );
      return;
    }

    if (
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError(
        "Enter a valid longitude between -180 and 180."
      );
      return;
    }

    await onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
          {error}
        </div>
      )}

      {/* BASIC INFO */}

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
            <MapPin size={19} />
          </div>

          <div>
            <h2 className="font-semibold text-[#1F2937]">
              Market Information
            </h2>

            <p className="text-sm text-[#6B7280]">
              Basic location information for
              customers and farmers.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <Field label="Market Name *">
            <input
              value={form.name}
              onChange={(e) =>
                update(
                  "name",
                  e.target.value
                )
              }
              placeholder="e.g. North Karachi Farmers Market"
              className="filter-input"
            />
          </Field>

          <Field label="Address *">
            <textarea
              rows={3}
              value={form.address}
              onChange={(e) =>
                update(
                  "address",
                  e.target.value
                )
              }
              placeholder="Complete market address..."
              className="filter-input resize-none"
            />
          </Field>
        </div>
      </section>

      {/* OPERATING DAYS */}

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
        <h2 className="font-semibold text-[#1F2937]">
          Operating Schedule
        </h2>

        <p className="mt-1 text-sm text-[#6B7280]">
          Select the days this market operates.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {DAYS.map((day) => {
            const selected =
              form.operatingDays.includes(
                day
              );

            return (
              <button
                key={day}
                type="button"
                onClick={() =>
                  toggleDay(day)
                }
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  selected
                    ? "border-[#166534] bg-[#166534] text-white"
                    : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#86EFAC]"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Opening Time *">
            <div className="relative">
              <Clock3
                size={16}
                className="absolute left-3 top-3.5 text-[#6B7280]"
              />

              <input
                type="time"
                value={form.openingTime}
                onChange={(e) =>
                  update(
                    "openingTime",
                    e.target.value
                  )
                }
                className="filter-input pl-10"
              />
            </div>
          </Field>

          <Field label="Closing Time *">
            <div className="relative">
              <Clock3
                size={16}
                className="absolute left-3 top-3.5 text-[#6B7280]"
              />

              <input
                type="time"
                value={form.closingTime}
                onChange={(e) =>
                  update(
                    "closingTime",
                    e.target.value
                  )
                }
                className="filter-input pl-10"
              />
            </div>
          </Field>
        </div>
      </section>

      {/* MAP */}

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
        <h2 className="font-semibold text-[#1F2937]">
          Map Coordinates
        </h2>

        <p className="mt-1 text-sm text-[#6B7280]">
          These coordinates are used by the
          customer map experience.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Latitude *">
            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) =>
                update(
                  "latitude",
                  e.target.value
                )
              }
              placeholder="24.8607"
              className="filter-input"
            />
          </Field>

          <Field label="Longitude *">
            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) =>
                update(
                  "longitude",
                  e.target.value
                )
              }
              placeholder="67.0011"
              className="filter-input"
            />
          </Field>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-[#166534] px-6 py-3 text-sm font-semibold text-white hover:bg-[#14532D] disabled:opacity-50"
        >
          <Save size={17} />

          {submitting
            ? "Saving..."
            : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#1F2937]">
        {label}
      </label>

      {children}
    </div>
  );
}