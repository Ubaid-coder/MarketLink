import {
  ReactNode,
} from "react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main
      className="
        min-h-screen
        bg-[#FAFAF7]
        flex
        items-center
        justify-center
        px-4
        py-10
      "
    >
      {children}
    </main>
  );
}