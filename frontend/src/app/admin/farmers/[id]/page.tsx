"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
} from "next/navigation";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Store,
  UserRound,
  XCircle,
} from "lucide-react";

import api from "@/lib/api";

import {
  AdminFarmer,
  FarmerApprovalStatus,
} from "@/types/adminFarmer";


export default function AdminFarmerDetailsPage() {
  const params =
    useParams();

  const id =
    params.id as string;


  const [
    farmer,
    setFarmer,
  ] =
    useState<AdminFarmer | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    updating,
    setUpdating,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  // =============================================
  // LOAD
  // =============================================

  const loadFarmer =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            `/admin/farmers/${id}`
          );

        const raw =
          response.data.farmer ||
          response.data.data ||
          response.data;

        setFarmer(raw);
      } catch (error: any) {
        setError(
          error?.response?.data
            ?.message ||
            "Unable to load farmer."
        );
      } finally {
        setLoading(false);
      }
    }, [id]);


  useEffect(() => {
    if (id) {
      loadFarmer();
    }
  }, [
    id,
    loadFarmer,
  ]);


  // =============================================
  // STATUS
  // =============================================

  const changeStatus =
    async (
      action:
        | "approve"
        | "suspend"
    ) => {
      if (!farmer) return;

      try {
        setUpdating(true);
        setError("");

        await api.patch(
          `/admin/farmers/${farmer._id}/${action}`
        );

        await loadFarmer();
      } catch (error: any) {
        setError(
          error?.response?.data
            ?.message ||
            `Unable to ${action} farmer.`
        );
      } finally {
        setUpdating(false);
      }
    };


  if (loading) {
    return (
      <div className="p-8">
        <div className="h-96 animate-pulse rounded-2xl bg-[#E5E7EB]" />
      </div>
    );
  }


  if (!farmer) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

          <h1 className="text-xl font-semibold">
            Farmer not found
          </h1>

          <p className="mt-2 text-sm text-[#DC2626]">
            {error}
          </p>

          <Link
            href="/admin/farmers"
            className="mt-5 inline-block font-semibold text-[#166534]"
          >
            Back to Farmers
          </Link>

        </div>
      </div>
    );
  }


  const user =
    typeof farmer.user ===
    "string"
      ? null
      : farmer.user;


  return (
    <div>
      {/* HEADER */}

      <header className="border-b border-[#E5E7EB] bg-white">

        <div className="px-5 py-7 sm:px-8 lg:px-10">

          <Link
            href="/admin/farmers"
            className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#166534]"
          >
            <ArrowLeft size={16} />

            Farmers
          </Link>


          <div className="mt-6 flex flex-wrap items-start justify-between gap-5">

            <div>
              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-3xl font-bold text-[#1F2937]">
                  {farmer.stallName}
                </h1>

                <ApprovalBadge
                  status={
                    farmer.approvalStatus
                  }
                />

              </div>

              <p className="mt-2 text-[#6B7280]">
                Farmer registration and
                marketplace access.
              </p>
            </div>


            <div className="flex gap-3">

              {farmer.approvalStatus !==
                "approved" && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    changeStatus(
                      "approve"
                    )
                  }
                  className="flex items-center gap-2 rounded-xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <CheckCircle2
                    size={17}
                  />

                  Approve
                </button>
              )}


              {farmer.approvalStatus !==
                "suspended" && (
                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    changeStatus(
                      "suspend"
                    )
                  }
                  className="flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-[#DC2626] hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle
                    size={17}
                  />

                  Suspend
                </button>
              )}

            </div>

          </div>
        </div>
      </header>


      <div className="space-y-6 p-5 sm:p-8 lg:p-10">

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
            {error}
          </div>
        )}


        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">

          {/* LEFT */}

          <div className="space-y-6">

            {/* PROFILE */}

            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">

              <div className="flex items-start gap-5">

                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#DCFCE7]">

                  {farmer.image ? (
                    <img
                      src={farmer.image}
                      alt={
                        farmer.stallName
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#166534]">
                      <Store
                        size={30}
                      />
                    </div>
                  )}

                </div>


                <div>
                  <h2 className="text-xl font-semibold text-[#1F2937]">
                    {
                      farmer.stallName
                    }
                  </h2>

                  <p className="mt-1 text-sm text-[#6B7280]">
                    Contact:{" "}
                    {
                      farmer.contactPerson
                    }
                  </p>
                </div>

              </div>


              <div className="mt-6 border-t border-[#E5E7EB] pt-6">

                <p className="text-sm font-semibold text-[#1F2937]">
                  Description
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#6B7280]">
                  {farmer.description ||
                    "No description provided."}
                </p>

              </div>

            </section>


            {/* MARKETS */}

            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">

              <h2 className="text-lg font-semibold text-[#1F2937]">
                Markets & Pickup
              </h2>

              <p className="mt-1 text-sm text-[#6B7280]">
                Markets configured by
                this farmer.
              </p>


              <div className="mt-5 space-y-4">

                {farmer.marketSchedules
                  ?.length ? (
                  farmer.marketSchedules.map(
                    (
                      schedule,
                      index
                    ) => {
                      const market =
                        typeof schedule.market ===
                        "string"
                          ? null
                          : schedule.market;

                      return (
                        <div
                          key={
                            market?._id ||
                            index
                          }
                          className="rounded-xl border border-[#E5E7EB] p-4"
                        >

                          <div className="flex items-start gap-3">

                            <MapPin
                              size={18}
                              className="mt-0.5 shrink-0 text-[#166534]"
                            />

                            <div>
                              <p className="font-semibold text-[#1F2937]">
                                {market?.name ||
                                  "Market"}
                              </p>

                              {market?.address && (
                                <p className="mt-1 text-sm text-[#6B7280]">
                                  {
                                    market.address
                                  }
                                </p>
                              )}
                            </div>

                          </div>


                          <div className="mt-4">

                            <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                              Operating Days
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">

                              {schedule.operatingDays.map(
                                (day) => (
                                  <span
                                    key={
                                      day
                                    }
                                    className="rounded-lg bg-[#DCFCE7] px-2.5 py-1 text-xs font-medium text-[#166534]"
                                  >
                                    {day}
                                  </span>
                                )
                              )}

                            </div>

                          </div>


                          <div className="mt-4">

                            <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                              Pickup Windows
                            </p>

                            <div className="mt-2 space-y-1">

                              {schedule.pickupWindows.map(
                                (
                                  window,
                                  windowIndex
                                ) => (
                                  <p
                                    key={
                                      windowIndex
                                    }
                                    className="flex items-center gap-2 text-sm text-[#6B7280]"
                                  >
                                    <Clock3
                                      size={14}
                                    />

                                    {
                                      window.startTime
                                    }{" "}
                                    –{" "}
                                    {
                                      window.endTime
                                    }
                                  </p>
                                )
                              )}

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )
                ) : (
                  <p className="rounded-xl bg-[#FAFAF7] p-4 text-sm text-[#6B7280]">
                    No markets have
                    been configured.
                  </p>
                )}

              </div>

            </section>

          </div>


          {/* RIGHT */}

          <aside className="space-y-6">

            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">

              <h2 className="font-semibold text-[#1F2937]">
                Account Information
              </h2>


              <div className="mt-5 space-y-5">

                <Info
                  icon={
                    <UserRound
                      size={17}
                    />
                  }
                  label="Name"
                  value={
                    user?.name ||
                    farmer.contactPerson
                  }
                />

                <Info
                  icon={
                    <Mail
                      size={17}
                    />
                  }
                  label="Email"
                  value={
                    user?.email ||
                    "Not available"
                  }
                />

                <Info
                  icon={
                    <Phone
                      size={17}
                    />
                  }
                  label="Phone"
                  value={
                    user?.phone ||
                    "Not available"
                  }
                />

                <Info
                  icon={
                    <MapPin
                      size={17}
                    />
                  }
                  label="Address"
                  value={
                    user?.address ||
                    "Not available"
                  }
                />

              </div>

            </section>


            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">

              <p className="text-sm font-semibold text-[#1F2937]">
                Preorder Cutoff
              </p>

              <p className="mt-3 text-3xl font-bold text-[#166534]">
                {
                  farmer.orderCutoffHours
                }{" "}
                <span className="text-sm font-normal text-[#6B7280]">
                  hours
                </span>
              </p>

              <p className="mt-2 text-xs leading-5 text-[#6B7280]">
                Customers cannot modify
                or cancel inside this
                farmer's configured
                cutoff period.
              </p>

            </section>

          </aside>

        </div>

      </div>
    </div>
  );
}


// =============================================
// INFO
// =============================================

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">

      <span className="mt-0.5 text-[#166534]">
        {icon}
      </span>

      <div className="min-w-0">

        <p className="text-xs text-[#9CA3AF]">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-[#1F2937]">
          {value}
        </p>

      </div>

    </div>
  );
}


// =============================================
// BADGE
// =============================================

function ApprovalBadge({
  status,
}: {
  status:
    FarmerApprovalStatus;
}) {
  const styles = {
    pending:
      "bg-amber-100 text-amber-800",

    approved:
      "bg-[#DCFCE7] text-[#166534]",

    suspended:
      "bg-red-100 text-[#DC2626]",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}