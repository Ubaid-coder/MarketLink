"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Clock3,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Save,
  Store,
  UserRound,
} from "lucide-react";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface ProfileForm {
  stallName: string;
  contactPerson: string;
  description: string;
  image: string;
  orderCutoffHours: string;
}

export default function FarmerProfilePage() {
  const {
    user,
    farmerProfile,
    refreshUser,
  } = useAuth();

  const [form, setForm] =
    useState<ProfileForm>({
      stallName: "",
      contactPerson: "",
      description: "",
      image: "",
      orderCutoffHours: "2",
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ============================================
  // LOAD PROFILE
  // ============================================

  const loadProfile =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/farmers/me"
          );

        const farmer =
          response.data.farmer ||
          response.data.farmerProfile ||
          response.data.data ||
          response.data;

        setForm({
          stallName:
            farmer.stallName || "",

          contactPerson:
            farmer.contactPerson || "",

          description:
            farmer.description || "",

          image:
            farmer.image || "",

          orderCutoffHours:
            String(
              farmer.orderCutoffHours ??
                2
            ),
        });
      } catch (error: any) {
        console.error(error);

        setError(
          error?.response?.data
            ?.message ||
            "Unable to load farmer profile."
        );
      } finally {
        setLoading(false);
      }
    }, []);


  useEffect(() => {
    loadProfile();
  }, [loadProfile]);


  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.stallName.trim()) {
      setError(
        "Stall name is required."
      );
      return;
    }

    if (
      !form.contactPerson.trim()
    ) {
      setError(
        "Contact person is required."
      );
      return;
    }

    const cutoff =
      Number(
        form.orderCutoffHours
      );

    if (
      !Number.isFinite(cutoff) ||
      cutoff < 0
    ) {
      setError(
        "Order cutoff hours must be 0 or greater."
      );
      return;
    }

    try {
      setSaving(true);

      await api.patch(
        "/farmers/me",
        {
          stallName:
            form.stallName.trim(),

          contactPerson:
            form.contactPerson.trim(),

          description:
            form.description.trim(),

          image:
            form.image.trim(),

          orderCutoffHours:
            cutoff,
        }
      );

      /*
       * Important:
       * refresh AuthContext so sidebar
       * immediately gets the new stall
       * name/image/status information.
       */
      await refreshUser();

      setSuccess(
        "Profile updated successfully."
      );
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data
          ?.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="space-y-5">
          <div className="h-28 animate-pulse rounded-2xl bg-[#E5E7EB]" />
          <div className="h-96 animate-pulse rounded-2xl bg-[#E5E7EB]" />
        </div>
      </div>
    );
  }


  return (
    <div>
      {/* HEADER */}

      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="px-5 py-7 sm:px-8 lg:px-10">

          <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
            Stall Settings
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#1F2937]">
            Farmer Profile
          </h1>

          <p className="mt-2 text-[#6B7280]">
            Manage the public
            information customers see
            about your farm or stall.
          </p>

        </div>
      </header>


      <div className="p-5 sm:p-8 lg:p-10">

        <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[1fr_340px]">

          {/* ==========================
              FORM
          =========================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
                {error}
              </div>
            )}


            {success && (
              <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-4 text-sm font-medium text-[#166534]">
                {success}
              </div>
            )}


            {/* BUSINESS */}

            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
                  <Store size={19} />
                </div>

                <div>
                  <h2 className="font-semibold text-[#1F2937]">
                    Stall Information
                  </h2>

                  <p className="mt-0.5 text-sm text-[#6B7280]">
                    This information
                    appears to customers.
                  </p>
                </div>

              </div>


              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                    Stall Name *
                  </label>

                  <input
                    value={
                      form.stallName
                    }
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          stallName:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="e.g. Green Valley Farm"
                    className="filter-input"
                  />
                </div>


                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                    Contact Person *
                  </label>

                  <input
                    value={
                      form.contactPerson
                    }
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          contactPerson:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="Contact person's name"
                    className="filter-input"
                  />
                </div>

              </div>


              <div className="mt-5">

                <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                  Description
                </label>

                <textarea
                  rows={5}
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        description:
                          event.target
                            .value,
                      })
                    )
                  }
                  placeholder="Tell customers about your farm, produce and stall..."
                  className="filter-input resize-none"
                />

              </div>


              <div className="mt-5">

                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#1F2937]">
                  <ImageIcon
                    size={16}
                    className="text-[#166534]"
                  />

                  Profile / Stall Image URL
                </label>

                <input
                  type="url"
                  value={form.image}
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        image:
                          event.target
                            .value,
                      })
                    )
                  }
                  placeholder="https://example.com/stall.jpg"
                  className="filter-input"
                />

                <p className="mt-2 text-xs text-[#6B7280]">
                  MarketLink currently
                  stores an image URL.
                  Direct image upload
                  can be added later.
                </p>

              </div>

            </section>


            {/* ORDER SETTINGS */}

            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
                  <Clock3 size={19} />
                </div>

                <div>
                  <h2 className="font-semibold text-[#1F2937]">
                    Preorder Settings
                  </h2>

                  <p className="mt-0.5 text-sm text-[#6B7280]">
                    Configure when
                    customers stop being
                    able to place or
                    modify preorders.
                  </p>
                </div>

              </div>


              <div className="mt-6 max-w-sm">

                <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                  Order Cutoff Hours
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={
                    form.orderCutoffHours
                  }
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,

                        orderCutoffHours:
                          event.target
                            .value,
                      })
                    )
                  }
                  className="filter-input"
                />

                <p className="mt-2 text-xs leading-5 text-[#6B7280]">
                  Example: setting this
                  to 2 means customers
                  cannot change or cancel
                  an order within 2 hours
                  of its pickup time.
                </p>

              </div>

            </section>


            {/* SAVE */}

            <div className="flex justify-end">

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#166534] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#14532D] disabled:opacity-50"
              >
                <Save size={17} />

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>


          {/* ==========================
              SIDEBAR
          =========================== */}

          <aside className="space-y-6">

            {/* PREVIEW */}

            <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">

              <div className="aspect-[16/9] bg-[#DCFCE7]">

                {form.image ? (
                  <img
                    src={form.image}
                    alt={
                      form.stallName ||
                      "Farmer stall"
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#166534]">
                    <Store size={42} />
                  </div>
                )}

              </div>


              <div className="p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-[#22C55E]">
                  Public Preview
                </p>

                <h3 className="mt-2 text-lg font-bold text-[#1F2937]">
                  {form.stallName ||
                    "Your Stall Name"}
                </h3>

                <p className="mt-1 text-sm text-[#6B7280]">
                  {form.contactPerson ||
                    "Contact Person"}
                </p>


                {form.description && (
                  <p className="mt-4 line-clamp-4 text-sm leading-6 text-[#6B7280]">
                    {
                      form.description
                    }
                  </p>
                )}

              </div>

            </section>


            {/* ACCOUNT */}

            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">

              <h3 className="font-semibold text-[#1F2937]">
                Account Information
              </h3>

              <p className="mt-1 text-xs text-[#6B7280]">
                Account fields are
                currently read-only.
              </p>


              <div className="mt-5 space-y-4">

                <AccountItem
                  icon={
                    <UserRound
                      size={16}
                    />
                  }
                  label="Name"
                  value={
                    user?.name || "—"
                  }
                />

                <AccountItem
                  icon={
                    <Mail size={16} />
                  }
                  label="Email"
                  value={
                    user?.email || "—"
                  }
                />

                <AccountItem
                  icon={
                    <Phone size={16} />
                  }
                  label="Phone"
                  value={
                    user?.phone || "—"
                  }
                />

                <AccountItem
                  icon={
                    <MapPin
                      size={16}
                    />
                  }
                  label="Address"
                  value={
                    user?.address || "—"
                  }
                />

              </div>

            </section>


            {/* APPROVAL */}

            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">

              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Farmer Status
              </p>

              <div className="mt-3">

                <ApprovalBadge
                  status={
                    farmerProfile
                      ?.approvalStatus ||
                    "pending"
                  }
                />

              </div>

              <p className="mt-3 text-xs leading-5 text-[#6B7280]">
                Farmer approval is
                controlled by the
                MarketLink administrator.
              </p>

            </section>

          </aside>

        </div>

      </div>
    </div>
  );
}


// ============================================
// ACCOUNT ITEM
// ============================================

function AccountItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="mt-0.5 text-[#166534]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-[#9CA3AF]">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm font-medium text-[#1F2937]">
          {value}
        </p>
      </div>

    </div>
  );
}


// ============================================
// APPROVAL BADGE
// ============================================

function ApprovalBadge({
  status,
}: {
  status:
    | "pending"
    | "approved"
    | "suspended";
}) {
  const styles = {
    approved:
      "bg-[#DCFCE7] text-[#166534]",

    pending:
      "bg-amber-100 text-amber-800",

    suspended:
      "bg-red-100 text-[#DC2626]",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}