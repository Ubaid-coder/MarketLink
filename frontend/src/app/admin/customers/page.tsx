"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  Search,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import api from "@/lib/api";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: "customer";
  isActive: boolean;
  createdAt?: string;
}

type StatusFilter =
  | "all"
  | "active"
  | "inactive";

export default function AdminCustomersPage() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);


  // ==========================================
  // LOAD CUSTOMERS
  // ==========================================

  const loadCustomers =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/admin/customers"
          );

        const raw =
          response.data.customers ||
          response.data.data ||
          response.data ||
          [];

        setCustomers(
          Array.isArray(raw)
            ? raw
            : []
        );
      } catch (error: any) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            "Unable to load customers."
        );
      } finally {
        setLoading(false);
      }
    }, []);


  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);


  // ==========================================
  // STATUS
  // ==========================================

  const changeStatus = async (
    customer: Customer,
    isActive: boolean
  ) => {
    try {
      setUpdatingId(customer._id);
      setError("");

      await api.patch(
        `/admin/customers/${customer._id}/status`,
        {
          isActive,
        }
      );

      setCustomers((current) =>
        current.map((item) =>
          item._id === customer._id
            ? {
                ...item,
                isActive,
              }
            : item
        )
      );
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to update customer status."
      );
    } finally {
      setUpdatingId(null);
    }
  };


  // ==========================================
  // FILTER
  // ==========================================

  const filteredCustomers =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return customers.filter(
        (customer) => {
          const text = [
            customer.name,
            customer.email,
            customer.phone,
            customer.address,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !query ||
            text.includes(query);

          const matchesStatus =
            statusFilter === "all" ||
            (statusFilter ===
              "active" &&
              customer.isActive) ||
            (statusFilter ===
              "inactive" &&
              !customer.isActive);

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      customers,
      search,
      statusFilter,
    ]);


  const stats = {
    total: customers.length,

    active: customers.filter(
      (customer) =>
        customer.isActive
    ).length,

    inactive: customers.filter(
      (customer) =>
        !customer.isActive
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
              Customers
            </h1>

            <p className="mt-2 text-[#6B7280]">
              Manage customer accounts
              and platform access.
            </p>
          </div>


          <button
            type="button"
            onClick={loadCustomers}
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

        <div className="grid gap-4 sm:grid-cols-3">

          <StatCard
            label="Total Customers"
            value={stats.total}
            icon={<Users size={20} />}
          />

          <StatCard
            label="Active"
            value={stats.active}
            icon={
              <UserCheck size={20} />
            }
          />

          <StatCard
            label="Inactive"
            value={stats.inactive}
            icon={
              <UserX size={20} />
            }
          />

        </div>


        {/* SEARCH / FILTER */}

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4">

          <div className="flex flex-col gap-3 md:flex-row">

            <div className="flex flex-1 items-center rounded-xl border border-[#E5E7EB] px-4">

              <Search
                size={17}
                className="shrink-0 text-[#6B7280]"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search name, email, phone or address..."
                className="w-full bg-transparent px-3 py-3 text-sm outline-none"
              />

            </div>


            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as StatusFilter
                )
              }
              className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none focus:border-[#22C55E]"
            >
              <option value="all">
                All customers
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

          </div>

        </section>


        {/* CUSTOMERS */}

        {loading ? (
          <div className="space-y-4">

            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl bg-[#E5E7EB]"
              />
            ))}

          </div>
        ) : filteredCustomers.length ===
          0 ? (
          <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-white py-20 text-center">

            <Users
              size={44}
              className="mx-auto text-[#166534]"
            />

            <h2 className="mt-4 text-xl font-semibold text-[#1F2937]">
              No customers found
            </h2>

            <p className="mt-2 text-sm text-[#6B7280]">
              No customer accounts
              match your current filters.
            </p>

          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead className="bg-[#FAFAF7] text-left text-xs uppercase tracking-wide text-[#6B7280]">

                  <tr>
                    <th className="px-5 py-4">
                      Customer
                    </th>

                    <th className="px-5 py-4">
                      Contact
                    </th>

                    <th className="px-5 py-4">
                      Address
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Joined
                    </th>

                    <th className="px-5 py-4 text-right">
                      Action
                    </th>
                  </tr>

                </thead>


                <tbody className="divide-y divide-[#E5E7EB]">

                  {filteredCustomers.map(
                    (customer) => (
                      <CustomerRow
                        key={
                          customer._id
                        }
                        customer={
                          customer
                        }
                        updating={
                          updatingId ===
                          customer._id
                        }
                        onChangeStatus={
                          changeStatus
                        }
                      />
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}


// ============================================
// CUSTOMER ROW
// ============================================

function CustomerRow({
  customer,
  updating,
  onChangeStatus,
}: {
  customer: Customer;

  updating: boolean;

  onChangeStatus: (
    customer: Customer,
    isActive: boolean
  ) => void;
}) {
  return (
    <tr className="hover:bg-[#FAFAF7]">

      {/* CUSTOMER */}

      <td className="px-5 py-4">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] font-semibold text-[#166534]">
            {customer.name
              ?.charAt(0)
              .toUpperCase() ||
              "C"}
          </div>


          <div>
            <p className="font-semibold text-[#1F2937]">
              {customer.name}
            </p>

            <p className="mt-1 text-xs text-[#6B7280]">
              Customer
            </p>
          </div>

        </div>

      </td>


      {/* CONTACT */}

      <td className="px-5 py-4">

        <div className="space-y-1.5 text-sm text-[#6B7280]">

          <p className="flex items-center gap-2">
            <Mail
              size={14}
              className="text-[#166534]"
            />

            {customer.email}
          </p>

          <p className="flex items-center gap-2">
            <Phone
              size={14}
              className="text-[#166534]"
            />

            {customer.phone}
          </p>

        </div>

      </td>


      {/* ADDRESS */}

      <td className="max-w-[250px] px-5 py-4">

        <div className="flex items-start gap-2 text-sm text-[#6B7280]">

          <MapPin
            size={14}
            className="mt-0.5 shrink-0 text-[#166534]"
          />

          <span className="line-clamp-2">
            {customer.address}
          </span>

        </div>

      </td>


      {/* STATUS */}

      <td className="px-5 py-4">

        {customer.isActive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-semibold text-[#166534]">

            <CheckCircle2
              size={12}
            />

            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-[#DC2626]">

            <UserX size={12} />

            Inactive
          </span>
        )}

      </td>


      {/* JOINED */}

      <td className="px-5 py-4 text-sm text-[#6B7280]">
        {customer.createdAt
          ? formatDate(
              customer.createdAt
            )
          : "—"}
      </td>


      {/* ACTION */}

      <td className="px-5 py-4 text-right">

        {customer.isActive ? (
          <button
            type="button"
            disabled={updating}
            onClick={() =>
              onChangeStatus(
                customer,
                false
              )
            }
            className="rounded-xl border border-red-200 px-4 py-2 text-xs font-semibold text-[#DC2626] hover:bg-red-50 disabled:opacity-50"
          >
            {updating
              ? "Updating..."
              : "Deactivate"}
          </button>
        ) : (
          <button
            type="button"
            disabled={updating}
            onClick={() =>
              onChangeStatus(
                customer,
                true
              )
            }
            className="rounded-xl bg-[#166534] px-4 py-2 text-xs font-semibold text-white hover:bg-[#14532D] disabled:opacity-50"
          >
            {updating
              ? "Updating..."
              : "Activate"}
          </button>
        )}

      </td>

    </tr>
  );
}


// ============================================
// STAT
// ============================================

function StatCard({
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


function formatDate(
  date: string
) {
  return new Date(
    date
  ).toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}