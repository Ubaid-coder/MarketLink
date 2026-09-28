"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import axios from "axios";
import {
  useSearchParams,
} from "next/navigation";

import {
  useAuth,
} from "../../../context/AuthContext"


export default function LoginPage() {

  const searchParams =
    useSearchParams();

  const redirect =
    searchParams.get(
      "redirect"
    );

  const router =
    useRouter();

  const { login } =
    useAuth();

  const [email, setEmail] =
    useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setError("");
      setLoading(true);

      try {
        const user =
          await login({
            email,
            password,
          });

        if (
          user.role === "admin"
        ) {
          router.push(
            "/admin"
          );

          return;
        }

        if (
          user.role === "farmer"
        ) {
          router.push(
            "/farmer"
          );

          return;
        }

        router.push(
          redirect &&
            redirect.startsWith("/")
            ? redirect
            : "/"
        );
      } catch (error) {
        if (
          axios.isAxiosError(
            error
          )
        ) {
          setError(
            error.response?.data
              ?.message ||
            "Login failed"
          );
        } else {
          setError(
            "Something went wrong"
          );
        }
      } finally {
        setLoading(false);
      }
    };


  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="text-3xl font-bold text-[#166534]"
        >
          MarketLink
        </Link>

        <p className="mt-2 text-[#6B7280]">
          Fresh from local farmers.
        </p>
      </div>


      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">

        <h1 className="text-2xl font-semibold text-[#1F2937]">
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-[#6B7280]">
          Sign in to your MarketLink account.
        </p>


        {error && (
          <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-[#DC2626]">
            {error}
          </div>
        )}


        <form
          onSubmit={
            handleSubmit
          }
          className="mt-6 space-y-5"
        >

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1F2937]">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="you@example.com"
              className="
                w-full
                rounded-lg
                border
                border-[#E5E7EB]
                px-4
                py-3
                outline-none
                transition
                focus:border-[#166534]
                focus:ring-2
                focus:ring-green-100
              "
            />
          </div>


          <div>
            <label className="mb-2 block text-sm font-medium text-[#1F2937]">
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="••••••••"
              className="
                w-full
                rounded-lg
                border
                border-[#E5E7EB]
                px-4
                py-3
                outline-none
                transition
                focus:border-[#166534]
                focus:ring-2
                focus:ring-green-100
              "
            />
          </div>


          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              rounded-lg
              bg-[#166534]
              px-5
              py-3
              font-medium
              text-white
              transition
              hover:bg-[#14532D]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>


        <div className="mt-6 border-t border-[#E5E7EB] pt-6 text-center text-sm text-[#6B7280]">

          New to MarketLink?

          <div className="mt-3 flex justify-center gap-4">

            <Link
              href="/register/customer"
              className="font-medium text-[#166534] hover:underline"
            >
              Join as Customer
            </Link>

            <span>
              •
            </span>

            <Link
              href="/register/farmer"
              className="font-medium text-[#166534] hover:underline"
            >
              Join as Farmer
            </Link>

          </div>

        </div>

      </div>
    </div>
  );
}