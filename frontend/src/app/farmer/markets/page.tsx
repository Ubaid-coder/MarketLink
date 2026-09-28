"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  Clock,
  Edit3,
  ExternalLink,
  MapPin,
  Plus,
  Store,
  Trash2,
} from "lucide-react";

import api from "@/lib/api";

import {
  useAuth,
} from "@/context/AuthContext";

import FarmerApprovalNotice from "@/components/farmer/FarmerApprovalNotice";

import MarketScheduleForm from "@/components/farmer/MarketScheduleForm";

import {
  Market,
} from "@/types/marketplace";

import {
  FarmerMarketFormData,
  FarmerMarketSchedule,
} from "@/types/farmerMarket";


export default function FarmerMarketsPage() {
  const {
    farmerProfile,
    refreshUser,
  } = useAuth();


  const [
    markets,
    setMarkets,
  ] = useState<Market[]>([]);

  const [
    schedules,
    setSchedules,
  ] =
    useState<
      FarmerMarketSchedule[]
    >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    editingSchedule,
    setEditingSchedule,
  ] =
    useState<FarmerMarketSchedule | null>(
      null
    );

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    deleteSchedule,
    setDeleteSchedule,
  ] =
    useState<FarmerMarketSchedule | null>(
      null
    );


  const approved =
    farmerProfile
      ?.approvalStatus ===
    "approved";


  // ================================================
  // LOAD
  // ================================================

  const loadData =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");


        const [
          farmerResponse,
          marketsResponse,
        ] =
          await Promise.all([
            api.get(
              "/farmers/me"
            ),

            api.get(
              "/markets"
            ),
          ]);


        const farmer =
          farmerResponse.data
            .farmer ||
          farmerResponse.data
            .farmerProfile ||
          farmerResponse.data;


        setSchedules(
          farmer
            ?.marketSchedules ||
            []
        );


        setMarkets(
          marketsResponse.data
            .markets ||
            marketsResponse.data ||
            []
        );
      } catch (error: any) {
        console.error(
          error
        );

        setError(
          error?.response
            ?.data?.message ||
            "Unable to load your market schedules."
        );
      } finally {
        setLoading(false);
      }
    }, []);


  useEffect(() => {
    loadData();
  }, [loadData]);


  // ================================================
  // AVAILABLE MARKETS
  // ================================================

  const availableMarkets =
    useMemo(() => {
      if (editingSchedule) {
        return markets;
      }


      const usedIds =
        new Set(
          schedules.map(
            (schedule) =>
              schedule.market
                ?._id
          )
        );


      return markets.filter(
        (market) =>
          !usedIds.has(
            market._id
          )
      );
    }, [
      markets,
      schedules,
      editingSchedule,
    ]);


  // ================================================
  // CREATE / UPDATE
  // ================================================

  const saveSchedule =
    async (
      form:
        FarmerMarketFormData
    ) => {
      if (!approved) {
        return;
      }


      try {
        setSubmitting(true);
        setError("");


        const payload = {
          market:
            form.marketId,

          operatingDays:
            form.operatingDays,

          pickupWindows:
            form.pickupWindows,

          stallLocation: {
            description:
              form.stallDescription.trim() ||
              undefined,

            latitude:
              form.latitude !==
              ""
                ? Number(
                    form.latitude
                  )
                : undefined,

            longitude:
              form.longitude !==
              ""
                ? Number(
                    form.longitude
                  )
                : undefined,
          },
        };


        if (
          editingSchedule
        ) {
          await api.patch(
            `/farmers/me/markets/${editingSchedule.market._id}`,
            payload
          );
        } else {
          await api.post(
            "/farmers/me/markets",
            payload
          );
        }


        setFormOpen(
          false
        );

        setEditingSchedule(
          null
        );


        await loadData();

        /*
         * Keep AuthContext farmerProfile
         * synchronized as checkout and
         * other components can depend on it.
         */
        await refreshUser();
      } catch (error: any) {
        console.error(
          error
        );

        setError(
          error?.response
            ?.data?.message ||
            "Unable to save market schedule."
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };


  // ================================================
  // EDIT
  // ================================================

  const startEditing = (
    schedule:
      FarmerMarketSchedule
  ) => {
    setEditingSchedule(
      schedule
    );

    setFormOpen(true);
  };


  // ================================================
  // DELETE
  // ================================================

  const confirmDelete =
    async () => {
      if (
        !deleteSchedule ||
        !approved
      ) {
        return;
      }


      try {
        setSubmitting(true);
        setError("");


        await api.delete(
          `/farmers/me/markets/${deleteSchedule.market._id}`
        );


        setDeleteSchedule(
          null
        );


        await loadData();

        await refreshUser();
      } catch (error: any) {
        console.error(
          error
        );

        setError(
          error?.response
            ?.data?.message ||
            "Unable to remove market schedule."
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };


  // ================================================
  // FORM DATA
  // ================================================

  const editingFormData:
    FarmerMarketFormData | undefined =
    editingSchedule
      ? {
          marketId:
            editingSchedule
              .market._id,

          operatingDays:
            editingSchedule
              .operatingDays,

          pickupWindows:
            editingSchedule
              .pickupWindows
              .length > 0
              ? editingSchedule
                  .pickupWindows
              : [
                  {
                    startTime:
                      "",
                    endTime:
                      "",
                  },
                ],

          stallDescription:
            editingSchedule
              .stallLocation
              ?.description ||
            "",

          latitude:
            editingSchedule
              .stallLocation
              ?.latitude !==
            undefined
              ? String(
                  editingSchedule
                    .stallLocation
                    .latitude
                )
              : "",

          longitude:
            editingSchedule
              .stallLocation
              ?.longitude !==
            undefined
              ? String(
                  editingSchedule
                    .stallLocation
                    .longitude
                )
              : "",
        }
      : undefined;


  return (
    <div>

      {/* HEADER */}

      <header className="border-b border-[#E5E7EB] bg-white">

        <div className="flex flex-wrap items-end justify-between gap-5 px-5 py-7 sm:px-8 lg:px-10">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
              Pickup Locations
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#1F2937]">
              Markets & Pickup
            </h1>

            <p className="mt-2 text-[#6B7280]">
              Configure where and when
              customers can collect
              their preorders.
            </p>

          </div>


          <button
            type="button"
            disabled={
              !approved ||
              availableMarkets.length ===
                0
            }
            onClick={() => {
              setEditingSchedule(
                null
              );

              setFormOpen(
                true
              );
            }}
            className="flex items-center gap-2 rounded-xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#14532D] disabled:cursor-not-allowed disabled:bg-[#D1D5DB]"
          >
            <Plus
              size={18}
            />

            Add Market
          </button>

        </div>

      </header>


      <div className="space-y-7 p-5 sm:p-8 lg:p-10">

        <FarmerApprovalNotice />


        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
            {error}
          </div>
        )}


        {/* FORM */}

        {formOpen && (
          <section className="rounded-2xl border border-[#86EFAC] bg-white">

            <div className="border-b border-[#E5E7EB] px-6 py-5">

              <h2 className="text-lg font-semibold text-[#1F2937]">
                {editingSchedule
                  ? "Edit Market Schedule"
                  : "Add Market Schedule"}
              </h2>

              <p className="mt-1 text-sm text-[#6B7280]">
                Set your operating
                days, pickup windows
                and stall location.
              </p>

            </div>


            <div className="p-6">

              <MarketScheduleForm
                key={
                  editingSchedule
                    ? editingSchedule
                        .market._id
                    : "new"
                }
                markets={
                  editingSchedule
                    ? markets
                    : availableMarkets
                }
                initialData={
                  editingFormData
                }
                editing={
                  Boolean(
                    editingSchedule
                  )
                }
                submitting={
                  submitting
                }
                onSubmit={
                  saveSchedule
                }
                onCancel={() => {
                  setFormOpen(
                    false
                  );

                  setEditingSchedule(
                    null
                  );
                }}
              />

            </div>

          </section>
        )}


        {/* LIST */}

        {loading ? (
          <MarketsLoading />
        ) : schedules.length ===
          0 ? (
          <section className="rounded-2xl border border-dashed border-[#D1D5DB] bg-white py-20 text-center">

            <Store
              size={42}
              className="mx-auto text-[#166534]"
            />

            <h2 className="mt-5 text-xl font-semibold text-[#1F2937]">
              No market schedules yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
              Add a market where you
              sell so customers can
              choose a valid pickup
              location and time.
            </p>

          </section>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">

            {schedules.map(
              (schedule) => (
                <ScheduleCard
                  key={
                    schedule.market
                      ._id
                  }
                  schedule={
                    schedule
                  }
                  approved={
                    approved
                  }
                  onEdit={() =>
                    startEditing(
                      schedule
                    )
                  }
                  onDelete={() =>
                    setDeleteSchedule(
                      schedule
                    )
                  }
                />
              )
            )}

          </div>
        )}

      </div>


      {/* DELETE */}

      {deleteSchedule && (
        <DeleteScheduleModal
          schedule={
            deleteSchedule
          }
          submitting={
            submitting
          }
          onCancel={() =>
            setDeleteSchedule(
              null
            )
          }
          onConfirm={
            confirmDelete
          }
        />
      )}

    </div>
  );
}


// ======================================================
// SCHEDULE CARD
// ======================================================

function ScheduleCard({
  schedule,
  approved,
  onEdit,
  onDelete,
}: {
  schedule:
    FarmerMarketSchedule;

  approved: boolean;

  onEdit: () => void;

  onDelete: () => void;
}) {
  const {
    market,
  } = schedule;


  const hasCoordinates =
    schedule.stallLocation
      ?.latitude !==
      undefined &&
    schedule.stallLocation
      ?.longitude !==
      undefined;


  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white">

      <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] p-6">

        <div className="flex gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">

            <Store
              size={20}
            />

          </div>


          <div>

            <h2 className="font-semibold text-[#1F2937]">
              {market.name}
            </h2>

            <div className="mt-1 flex items-start gap-1.5 text-sm text-[#6B7280]">

              <MapPin
                size={14}
                className="mt-0.5 shrink-0"
              />

              <span>
                {market.address}
              </span>

            </div>

          </div>

        </div>


        <div className="flex gap-2">

          <button
            type="button"
            disabled={
              !approved
            }
            onClick={
              onEdit
            }
            title="Edit schedule"
            className="rounded-lg border border-[#E5E7EB] p-2 text-[#6B7280] transition hover:bg-[#DCFCE7] hover:text-[#166534] disabled:opacity-30"
          >
            <Edit3
              size={16}
            />
          </button>


          <button
            type="button"
            disabled={
              !approved
            }
            onClick={
              onDelete
            }
            title="Remove market"
            className="rounded-lg border border-[#E5E7EB] p-2 text-[#6B7280] transition hover:bg-red-50 hover:text-[#DC2626] disabled:opacity-30"
          >
            <Trash2
              size={16}
            />
          </button>

        </div>

      </div>


      <div className="space-y-5 p-6">

        {/* DAYS */}

        <div>

          <div className="flex items-center gap-2 text-sm font-medium text-[#1F2937]">

            <CalendarDays
              size={16}
              className="text-[#166534]"
            />

            Operating Days
          </div>


          <div className="mt-3 flex flex-wrap gap-2">

            {schedule.operatingDays.map(
              (day) => (
                <span
                  key={day}
                  className="rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-semibold text-[#166534]"
                >
                  {day}
                </span>
              )
            )}

          </div>

        </div>


        {/* WINDOWS */}

        <div>

          <div className="flex items-center gap-2 text-sm font-medium text-[#1F2937]">

            <Clock
              size={16}
              className="text-[#166534]"
            />

            Pickup Windows
          </div>


          <div className="mt-3 flex flex-wrap gap-2">

            {schedule.pickupWindows.map(
              (
                window,
                index
              ) => (
                <span
                  key={`${window.startTime}-${window.endTime}-${index}`}
                  className="rounded-lg border border-[#E5E7EB] bg-[#FAFAF7] px-3 py-2 text-xs text-[#6B7280]"
                >
                  {
                    window.startTime
                  }{" "}
                  –{" "}
                  {
                    window.endTime
                  }
                </span>
              )
            )}

          </div>

        </div>


        {/* STALL */}

        {schedule
          .stallLocation
          ?.description && (
          <div>

            <div className="flex items-center gap-2 text-sm font-medium text-[#1F2937]">

              <MapPin
                size={16}
                className="text-[#166534]"
              />

              Stall Location
            </div>

            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              {
                schedule
                  .stallLocation
                  .description
              }
            </p>

          </div>
        )}


        {/* MAP */}

        {hasCoordinates && (
          <a
            href={`https://www.openstreetmap.org/?mlat=${schedule.stallLocation!.latitude}&mlon=${schedule.stallLocation!.longitude}#map=17/${schedule.stallLocation!.latitude}/${schedule.stallLocation!.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#166534] hover:underline"
          >
            View Stall on Map

            <ExternalLink
              size={14}
            />
          </a>
        )}

      </div>

    </article>
  );
}


// ======================================================
// DELETE MODAL
// ======================================================

function DeleteScheduleModal({
  schedule,
  submitting,
  onCancel,
  onConfirm,
}: {
  schedule:
    FarmerMarketSchedule;

  submitting: boolean;

  onCancel: () => void;

  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#DC2626]">

          <Trash2
            size={20}
          />

        </div>


        <h2 className="mt-5 text-xl font-semibold text-[#1F2937]">
          Remove market?
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#6B7280]">
          Remove{" "}
          <strong className="text-[#1F2937]">
            {
              schedule.market
                .name
            }
          </strong>{" "}
          from your pickup
          locations?
        </p>


        <div className="mt-6 grid grid-cols-2 gap-3">

          <button
            type="button"
            disabled={
              submitting
            }
            onClick={
              onCancel
            }
            className="rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-[#6B7280]"
          >
            Cancel
          </button>


          <button
            type="button"
            disabled={
              submitting
            }
            onClick={
              onConfirm
            }
            className="rounded-xl bg-[#DC2626] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting
              ? "Removing..."
              : "Remove"}
          </button>

        </div>

      </div>

    </div>
  );
}


// ======================================================
// LOADING
// ======================================================

function MarketsLoading() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">

      {Array.from({
        length: 4,
      }).map(
        (_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-2xl bg-[#E5E7EB]"
          />
        )
      )}

    </div>
  );
}