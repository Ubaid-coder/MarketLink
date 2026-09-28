import { ReactNode } from "react";

import CustomerNavbar from "@/components/customer/CustomerNavbar";

export default function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <CustomerNavbar />

      <main>{children}</main>
    </div>
  );
}