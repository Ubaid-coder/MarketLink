"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

import { useAuth } from "../../../../context/AuthContext"

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { registerCustomer } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await registerCustomer(form);

      router.push("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Registration failed"
        );
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="text-3xl font-bold text-[#166534]"
        >
          MarketLink
        </Link>

        <p className="mt-2 text-[#6B7280]">
          Shop fresh. Support local farmers.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#1F2937]">
          Create Customer Account
        </h1>

        <p className="mt-2 text-sm text-[#6B7280]">
          Discover farmers, reserve fresh produce and
          collect it from your local market.
        </p>

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-[#DC2626]">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your full name"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />

          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+92 300 1234567"
          />

          <Input
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Your address"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#166534] px-5 py-3 font-medium text-white transition hover:bg-[#14532D] disabled:opacity-60"
          >
            {loading
              ? "Creating account..."
              : "Create Customer Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B7280]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#166534] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

interface InputProps {
  label: string;
  name: string;
  value: string;
  type?: string;
  placeholder?: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

function Input({
  label,
  name,
  value,
  type = "text",
  placeholder,
  onChange,
}: InputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#1F2937]">
        {label}
      </label>

      <input
        name={name}
        type={type}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 outline-none transition focus:border-[#166534] focus:ring-2 focus:ring-green-100"
      />
    </div>
  );
}