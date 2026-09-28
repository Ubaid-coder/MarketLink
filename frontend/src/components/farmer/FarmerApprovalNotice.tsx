"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import {
  useAuth,
} from "@/context/AuthContext";


export default function FarmerApprovalNotice() {
  const {
    farmerProfile,
  } = useAuth();


  const status =
    farmerProfile
      ?.approvalStatus ||
    "pending";


  // APPROVED

  if (
    status ===
    "approved"
  ) {
    return null;
  }


  // SUSPENDED

  if (
    status ===
    "suspended"
  ) {
    return (
      <div className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-5">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-[#DC2626]">

          <AlertTriangle
            size={20}
          />

        </div>


        <div>

          <h2 className="font-semibold text-[#991B1B]">
            Farmer account suspended
          </h2>

          <p className="mt-1 text-sm leading-6 text-[#7F1D1D]">
            Your MarketLink farmer
            account is currently
            suspended. Your selling
            functionality may be
            restricted until an
            administrator restores
            your account.
          </p>

        </div>

      </div>
    );
  }


  // PENDING

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-5">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#92400E]">

        <Clock3
          size={20}
        />

      </div>


      <div>

        <h2 className="font-semibold text-[#92400E]">
          Approval pending
        </h2>

        <p className="mt-1 text-sm leading-6 text-[#78350F]">
          Your farmer profile is
          waiting for administrator
          approval. You can review
          your dashboard and profile,
          but marketplace selling
          features remain restricted
          until approval.
        </p>

      </div>

    </div>
  );
}