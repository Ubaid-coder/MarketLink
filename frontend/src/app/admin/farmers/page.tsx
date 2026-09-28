"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  RefreshCcw,
  Search,
  Store,
  Tractor,
  XCircle,
} from "lucide-react";

import api from "@/lib/api";

import {
  AdminFarmer,
  FarmerApprovalStatus,
} from "@/types/adminFarmer";


type FilterStatus =
  | "all"
  | FarmerApprovalStatus;


export default function AdminFarmersPage() {
  const [
    farmers,
    setFarmers,
  ] = useState<AdminFarmer[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] =
    useState<FilterStatus>(
      "all"
    );

  const [
    updatingId,
    setUpdatingId,
  ] =
    useState<string | null>(
      null
    );


  // =========================================
  // LOAD
  // =========================================

  const loadFarmers =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/admin/farmers"
          );

        const raw =
          response.data.farmers ||
          response.data.data ||
          response.data ||
          [];

        setFarmers(
          Array.isArray(raw)
            ? raw
            : []
        );
      } catch (error: any) {
        console.error(error);

        setError(
          error?.response?.data
            ?.message ||
            "Unable to load farmers."
        );
      } finally {
        setLoading(false);
      }
    }, []);


  useEffect(() => {
    loadFarmers();
  }, [loadFarmers]);


  // =========================================
  // APPROVE
  // =========================================

  const approveFarmer =
    async (id: string) => {
      try {
        setUpdatingId(id);
        setError("");

        await api.patch(
          `/admin/farmers/${id}/approve`
        );

        await loadFarmers();
      } catch (error: any) {
        setError(
          error?.response?.data
            ?.message ||
            "Unable to approve farmer."
        );
      } finally {
        setUpdatingId(null);
      }
    };


  // =========================================
  // SUSPEND
  // =========================================

  const suspendFarmer =
    async (id: string) => {
      try {
        setUpdatingId(id);
        setError("");

        await api.patch(
          `/admin/farmers/${id}/suspend`
        );

        await loadFarmers();
      } catch (error: any) {
        setError(
          error?.response?.data
            ?.message ||
            "Unable to suspend farmer."
        );
      } finally {
        setUpdatingId(null);
      }
    };


  // =========================================
  // FILTER
  // =========================================

  const filteredFarmers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return farmers.filter(
        (farmer) => {
          const user =
            typeof farmer.user ===
            "string"
              ? null
              : farmer.user;

          const text = [
            farmer.stallName,
            farmer.contactPerson,
            user?.name,
            user?.email,
            user?.phone,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !query ||
            text.includes(query);

          const matchesFilter =
            filter === "all" ||
            farmer.approvalStatus ===
              filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      farmers,
      search,
      filter,
    ]);


  const stats = {
    total:
      farmers.length,

    pending:
      farmers.filter(
        (farmer) =>
          farmer.approvalStatus ===
          "pending"
      ).length,

    approved:
      farmers.filter(
        (farmer) =>
          farmer.approvalStatus ===
          "approved"
      ).length,

    suspended:
      farmers.filter(
        (farmer) =>
          farmer.approvalStatus ===
          "suspended"
      ).length,
  };


  return (
    <div>
      {/* HEADER */}

      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-end justify-between gap-5 px-5 py-7 sm:px-8 lg:px-10">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#1F2937]">
              Farmers
            </h1>

            <p className="mt-2 text-[#6B7280]">
              Review farmer
              registrations and control
              marketplace access.
            </p>
          </div>


          <button
            type="button"
            onClick={loadFarmers}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-semibold text-[#166534] hover:bg-[#DCFCE7] disabled:opacity-50"
          >
            <RefreshCcw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>
      </header>


      <div className="space-y-7 p-5 sm:p-8 lg:p-10">

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
            {error}
          </div>
        )}


        {/* STATS */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <Stat
            label="Total Farmers"
            value={stats.total}
            icon={
              <Tractor size={20} />
            }
          />

          <Stat
            label="Pending"
            value={stats.pending}
            icon={
              <Clock3 size={20} />
            }
          />

          <Stat
            label="Approved"
            value={stats.approved}
            icon={
              <CheckCircle2
                size={20}
              />
            }
          />

          <Stat
            label="Suspended"
            value={stats.suspended}
            icon={
              <XCircle size={20} />
            }
          />

        </div>


        {/* SEARCH */}

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4">

          <div className="flex flex-col gap-3 md:flex-row">

            <div className="flex flex-1 items-center rounded-xl border border-[#E5E7EB] px-4">

              <Search
                size={17}
                className="text-[#6B7280]"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search farmer, stall, email or phone..."
                className="w-full bg-transparent px-3 py-3 text-sm outline-none"
              />

            </div>


            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target
                    .value as FilterStatus
                )
              }
              className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none focus:border-[#22C55E]"
            >
              <option value="all">
                All farmers
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="suspended">
                Suspended
              </option>
            </select>

          </div>

        </section>


        {/* FARMERS */}

        {loading ? (
          <div className="space-y-4">

            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl bg-[#E5E7EB]"
              />
            ))}

          </div>
        ) : filteredFarmers.length ===
          0 ? (
          <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-white py-20 text-center">

            <Tractor
              size={44}
              className="mx-auto text-[#166534]"
            />

            <h2 className="mt-4 text-xl font-semibold text-[#1F2937]">
              No farmers found
            </h2>

          </div>
        ) : (
          <div className="space-y-4">

            {filteredFarmers.map(
              (farmer) => (
                <FarmerCard
                  key={farmer._id}
                  farmer={farmer}
                  updating={
                    updatingId ===
                    farmer._id
                  }
                  onApprove={() =>
                    approveFarmer(
                      farmer._id
                    )
                  }
                  onSuspend={() =>
                    suspendFarmer(
                      farmer._id
                    )
                  }
                />
              )
            )}

          </div>
        )}

      </div>
    </div>
  );
}


// =============================================
// FARMER CARD
// =============================================

function FarmerCard({
  farmer,
  updating,
  onApprove,
  onSuspend,
}: {
  farmer: AdminFarmer;
  updating: boolean;
  onApprove: () => void;
  onSuspend: () => void;
}) {
  const user =
    typeof farmer.user ===
    "string"
      ? null
      : farmer.user;


  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

        {/* FARMER */}

        <div className="flex min-w-0 flex-1 gap-4">

          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#DCFCE7]">

            {farmer.image ? (
              <img
                src={farmer.image}
                alt={farmer.stallName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[#166534]">
                <Store size={22} />
              </div>
            )}

          </div>


          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <h2 className="font-semibold text-[#1F2937]">
                {farmer.stallName}
              </h2>

              <ApprovalBadge
                status={
                  farmer.approvalStatus
                }
              />

            </div>


            <p className="mt-1 text-sm text-[#6B7280]">
              {farmer.contactPerson}
            </p>


            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#6B7280]">

              {user?.email && (
                <span>
                  {user.email}
                </span>
              )}

              {user?.phone && (
                <span>
                  {user.phone}
                </span>
              )}

              <span>
                {
                  farmer
                    .marketSchedules
                    ?.length || 0
                }{" "}
                market
                {farmer
                  .marketSchedules
                  ?.length === 1
                  ? ""
                  : "s"}
              </span>

            </div>

          </div>

        </div>


        {/* ACTIONS */}

        <div className="flex flex-wrap items-center gap-2">

          {farmer.approvalStatus !==
            "approved" && (
            <button
              type="button"
              disabled={updating}
              onClick={onApprove}
              className="flex items-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#14532D] disabled:opacity-50"
            >
              <CheckCircle2
                size={16}
              />

              Approve
            </button>
          )}


          {farmer.approvalStatus !==
            "suspended" && (
            <button
              type="button"
              disabled={updating}
              onClick={onSuspend}
              className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-[#DC2626] hover:bg-red-50 disabled:opacity-50"
            >
              <XCircle size={16} />

              Suspend
            </button>
          )}


          <Link
            href={`/admin/farmers/${farmer._id}`}
            className="flex items-center gap-1 rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-semibold text-[#166534] hover:bg-[#DCFCE7]"
          >
            Details

            <ChevronRight
              size={15}
            />
          </Link>

        </div>

      </div>

    </article>
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
      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}


// =============================================
// STAT
// =============================================

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-[#6B7280]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-[#1F2937]">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
          {icon}
        </div>

      </div>

    </div>
  );
}