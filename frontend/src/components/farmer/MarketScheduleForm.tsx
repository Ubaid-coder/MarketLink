"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  Clock,
  MapPin,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import {
  Market,
} from "@/types/marketplace";

import {
  FarmerMarketFormData,
} from "@/types/farmerMarket";


interface Props {
  markets: Market[];

  initialData?: FarmerMarketFormData;

  editing?: boolean;

  submitting?: boolean;

  onSubmit: (
    data: FarmerMarketFormData
  ) => Promise<void>;

  onCancel: () => void;
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


export default function MarketScheduleForm({
  markets,
  initialData,
  editing = false,
  submitting = false,
  onSubmit,
  onCancel,
}: Props) {
  const [
    form,
    setForm,
  ] =
    useState<FarmerMarketFormData>(
      initialData || {
        marketId: "",
        operatingDays: [],
        pickupWindows: [
          {
            startTime: "",
            endTime: "",
          },
        ],
        stallDescription: "",
        latitude: "",
        longitude: "",
      }
    );

  const [
    error,
    setError,
  ] = useState("");
  const selectedMarket =
    markets.find(
      (market) =>
        market._id ===
        form.marketId
    );


  const allowedDays =
    selectedMarket
      ?.operatingDays ||
    [];

  // ================================================
  // DAYS
  // ================================================

  const toggleDay = (
    day: string
  ) => {
    setForm(
      (current) => ({
        ...current,

        operatingDays:
          current.operatingDays.includes(
            day
          )
            ? current.operatingDays.filter(
              (item) =>
                item !== day
            )
            : [
              ...current.operatingDays,
              day,
            ],
      })
    );
  };


  // ================================================
  // PICKUP WINDOW
  // ================================================

  const updateWindow = (
    index: number,
    key:
      | "startTime"
      | "endTime",
    value: string
  ) => {
    setForm(
      (current) => ({
        ...current,

        pickupWindows:
          current.pickupWindows.map(
            (
              window,
              windowIndex
            ) =>
              windowIndex ===
                index
                ? {
                  ...window,
                  [key]: value,
                }
                : window
          ),
      })
    );
  };


  const addWindow = () => {
    setForm(
      (current) => ({
        ...current,

        pickupWindows: [
          ...current.pickupWindows,

          {
            startTime: "",
            endTime: "",
          },
        ],
      })
    );
  };


  const removeWindow = (
    index: number
  ) => {
    setForm(
      (current) => ({
        ...current,

        pickupWindows:
          current.pickupWindows.filter(
            (_, i) =>
              i !== index
          ),
      })
    );
  };


  // ================================================
  // SUBMIT
  // ================================================

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setError("");


      if (!form.marketId) {
        setError(
          "Please select a market."
        );

        return;
      }


      if (
        form.operatingDays.length ===
        0
      ) {
        setError(
          "Select at least one operating day."
        );

        return;
      }


      if (
        form.pickupWindows.length ===
        0
      ) {
        setError(
          "Add at least one pickup window."
        );

        return;
      }


      const invalidWindow =
        form.pickupWindows.some(
          (window) =>
            !window.startTime ||
            !window.endTime ||
            window.startTime >=
            window.endTime
        );


      if (invalidWindow) {
        setError(
          "Every pickup window needs a valid start and end time."
        );

        return;
      }


      if (
        form.latitude &&
        !Number.isFinite(
          Number(
            form.latitude
          )
        )
      ) {
        setError(
          "Enter a valid latitude."
        );

        return;
      }


      if (
        form.longitude &&
        !Number.isFinite(
          Number(
            form.longitude
          )
        )
      ) {
        setError(
          "Enter a valid longitude."
        );

        return;
      }


      await onSubmit(form);
    };


  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6"
    >

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
          {error}
        </div>
      )}


      {/* MARKET */}

      <div>

        <label className="mb-2 block text-sm font-medium text-[#1F2937]">
          Market *
        </label>

        <select
          value={
            form.marketId
          }
          disabled={editing}
          onChange={(
            event
          ) =>
            setForm(
              (current) => ({
                ...current,
                marketId:
                  event.target
                    .value,
              })
            )
          }
          className="filter-input disabled:bg-[#F3F4F6]"
        >
          <option value="">
            Select market
          </option>

          {markets.map(
            (market) => (
              <option
                key={
                  market._id
                }
                value={
                  market._id
                }
              >
                {market.name} —{" "}
                {market.address}
              </option>
            )
          )}

        </select>

        {editing && (
          <p className="mt-2 text-xs text-[#6B7280]">
            The market cannot be
            changed while editing.
            Remove this schedule and
            create another one if you
            need a different market.
          </p>
        )}

      </div>


      {/* OPERATING DAYS */}

      <div>

        <label className="block text-sm font-medium text-[#1F2937]">
          Your Operating Days *
        </label>

        <p className="mt-1 text-sm text-[#6B7280]">
          Select the days you sell at
          this market.
        </p>


        <div className="mt-4 flex flex-wrap gap-2">

          {DAYS.map((day) => {
  const allowed =
    allowedDays.includes(
      day
    );

  const selected =
    form.operatingDays.includes(
      day
    );

  return (
    <button
      key={day}
      type="button"
      disabled={!allowed}
      onClick={() =>
        toggleDay(day)
      }
      title={
        allowed
          ? day
          : `${selectedMarket?.name || "This market"} does not operate on ${day}`
      }
      className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
        selected
          ? "border-[#166534] bg-[#DCFCE7] text-[#166534]"
          : allowed
          ? "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#86EFAC]"
          : "cursor-not-allowed border-[#E5E7EB] bg-[#F3F4F6] text-[#D1D5DB]"
      }`}
    >
      {day.slice(0, 3)}
    </button>
  );
})}

        </div>

      </div>


      {/* PICKUP WINDOWS */}

      <div className="border-t border-[#E5E7EB] pt-6">

        <div className="flex items-start justify-between gap-4">

          <div>

            <div className="flex items-center gap-2">

              <Clock
                size={18}
                className="text-[#166534]"
              />

              <h3 className="font-semibold text-[#1F2937]">
                Pickup Windows
              </h3>

            </div>

            <p className="mt-1 text-sm text-[#6B7280]">
              Customers choose one of
              these windows during
              checkout.
            </p>

          </div>


          <button
            type="button"
            onClick={
              addWindow
            }
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#166534] px-3 py-2 text-xs font-semibold text-[#166534] transition hover:bg-[#DCFCE7]"
          >
            <Plus
              size={14}
            />

            Add Window
          </button>

        </div>


        <div className="mt-5 space-y-3">

          {form.pickupWindows.map(
            (
              window,
              index
            ) => (
              <div
                key={index}
                className="grid gap-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAF7] p-4 sm:grid-cols-[1fr_1fr_auto]"
              >

                <div>

                  <label className="mb-1.5 block text-xs font-medium text-[#6B7280]">
                    Start
                  </label>

                  <input
                    type="time"
                    value={
                      window.startTime
                    }
                    onChange={(
                      event
                    ) =>
                      updateWindow(
                        index,
                        "startTime",
                        event.target
                          .value
                      )
                    }
                    className="filter-input"
                  />

                </div>


                <div>

                  <label className="mb-1.5 block text-xs font-medium text-[#6B7280]">
                    End
                  </label>

                  <input
                    type="time"
                    value={
                      window.endTime
                    }
                    onChange={(
                      event
                    ) =>
                      updateWindow(
                        index,
                        "endTime",
                        event.target
                          .value
                      )
                    }
                    className="filter-input"
                  />

                </div>


                <div className="flex items-end">

                  <button
                    type="button"
                    disabled={
                      form
                        .pickupWindows
                        .length ===
                      1
                    }
                    onClick={() =>
                      removeWindow(
                        index
                      )
                    }
                    title="Remove pickup window"
                    className="flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-[#E5E7EB] text-[#6B7280] transition hover:bg-red-50 hover:text-[#DC2626] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2
                      size={17}
                    />
                  </button>

                </div>

              </div>
            )
          )}

        </div>

      </div>


      {/* STALL LOCATION */}

      <div className="border-t border-[#E5E7EB] pt-6">

        <div className="flex items-center gap-2">

          <MapPin
            size={18}
            className="text-[#166534]"
          />

          <h3 className="font-semibold text-[#1F2937]">
            Stall Location
          </h3>

        </div>

        <p className="mt-1 text-sm text-[#6B7280]">
          Help customers find your
          stall after reaching the
          market.
        </p>


        <div className="mt-5">

          <label className="mb-2 block text-sm font-medium text-[#1F2937]">
            Stall Description
          </label>

          <input
            value={
              form.stallDescription
            }
            onChange={(
              event
            ) =>
              setForm(
                (current) => ({
                  ...current,

                  stallDescription:
                    event.target
                      .value,
                })
              )
            }
            placeholder="e.g. Stall 14, beside the main entrance"
            className="filter-input"
          />

        </div>


        <div className="mt-4 grid gap-4 sm:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm font-medium text-[#1F2937]">
              Latitude
            </label>

            <input
              type="number"
              step="any"
              value={
                form.latitude
              }
              onChange={(
                event
              ) =>
                setForm(
                  (current) => ({
                    ...current,

                    latitude:
                      event.target
                        .value,
                  })
                )
              }
              placeholder="24.8607"
              className="filter-input"
            />

          </div>


          <div>

            <label className="mb-2 block text-sm font-medium text-[#1F2937]">
              Longitude
            </label>

            <input
              type="number"
              step="any"
              value={
                form.longitude
              }
              onChange={(
                event
              ) =>
                setForm(
                  (current) => ({
                    ...current,

                    longitude:
                      event.target
                        .value,
                  })
                )
              }
              placeholder="67.0011"
              className="filter-input"
            />

          </div>

        </div>

      </div>


      {/* BUTTONS */}

      <div className="flex justify-end gap-3 border-t border-[#E5E7EB] pt-6">

        <button
          type="button"
          disabled={
            submitting
          }
          onClick={
            onCancel
          }
          className="rounded-xl border border-[#E5E7EB] px-5 py-3 text-sm font-semibold text-[#6B7280] transition hover:bg-[#F3F4F6]"
        >
          Cancel
        </button>


        <button
          type="submit"
          disabled={
            submitting
          }
          className="flex items-center gap-2 rounded-xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#14532D] disabled:opacity-50"
        >
          <Save
            size={17}
          />

          {submitting
            ? "Saving..."
            : editing
              ? "Save Changes"
              : "Add Market"}
        </button>

      </div>

    </form>
  );
}