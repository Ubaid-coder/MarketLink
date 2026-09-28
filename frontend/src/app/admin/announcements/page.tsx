"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  BellRing,
  Megaphone,
  Send,
  Users,
} from "lucide-react";

import api from "@/lib/api";

type Audience =
  | "all"
  | "customer"
  | "farmer";

export default function AdminAnnouncementsPage() {
  const [title, setTitle] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [audience, setAudience] =
    useState<Audience>("all");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const submitAnnouncement = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError(
        "Announcement title is required."
      );
      return;
    }

    if (!message.trim()) {
      setError(
        "Announcement message is required."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response =
        await api.post(
          "/admin/announcements",
          {
            title:
              title.trim(),

            message:
              message.trim(),

            audience,
          }
        );

      setSuccess(
        response.data.message ||
          "Announcement sent successfully."
      );

      setTitle("");
      setMessage("");
      setAudience("all");
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to send announcement."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="px-5 py-7 sm:px-8 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
            Communication
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#1F2937]">
            Announcements
          </h1>

          <p className="mt-2 text-[#6B7280]">
            Send platform-wide information
            to MarketLink users.
          </p>
        </div>
      </header>

      <div className="p-5 sm:p-8 lg:p-10">
        <div className="grid gap-6 xl:grid-cols-[1fr_350px]">
          {/* FORM */}

          <form
            onSubmit={
              submitAnnouncement
            }
            className="rounded-2xl border border-[#E5E7EB] bg-white p-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
                <Megaphone
                  size={20}
                />
              </div>

              <div>
                <h2 className="font-semibold text-[#1F2937]">
                  New Announcement
                </h2>

                <p className="text-sm text-[#6B7280]">
                  Users receive this in
                  their notification center.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-6 rounded-xl border border-green-200 bg-[#DCFCE7] p-4 text-sm font-medium text-[#166534]">
                {success}
              </div>
            )}

            <div className="mt-7">
              <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                Audience *
              </label>

              <select
                value={audience}
                onChange={(event) =>
                  setAudience(
                    event.target
                      .value as Audience
                  )
                }
                className="filter-input"
              >
                <option value="all">
                  Everyone
                </option>

                <option value="customer">
                  Customers Only
                </option>

                <option value="farmer">
                  Farmers Only
                </option>
              </select>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                Title *
              </label>

              <input
                value={title}
                maxLength={100}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="e.g. Weekend Market Update"
                className="filter-input"
              />

              <p className="mt-1 text-right text-xs text-[#9CA3AF]">
                {title.length}/100
              </p>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                Message *
              </label>

              <textarea
                rows={7}
                value={message}
                maxLength={500}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                placeholder="Write the announcement..."
                className="filter-input resize-none"
              />

              <p className="mt-1 text-right text-xs text-[#9CA3AF]">
                {message.length}/500
              </p>
            </div>

            <div className="mt-7 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-[#166534] px-6 py-3 text-sm font-semibold text-white hover:bg-[#14532D] disabled:opacity-50"
              >
                <Send size={16} />

                {submitting
                  ? "Sending..."
                  : "Send Announcement"}
              </button>
            </div>
          </form>

          {/* INFO */}

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
              <BellRing
                size={25}
                className="text-[#166534]"
              />

              <h2 className="mt-4 font-semibold text-[#1F2937]">
                In-App Notification
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Each matching user receives
                an announcement notification
                in their MarketLink account.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
              <Users
                size={25}
                className="text-[#166534]"
              />

              <h2 className="mt-4 font-semibold text-[#1F2937]">
                Audience
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                Choose everyone, only
                customers, or only farmers
                depending on the announcement.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}