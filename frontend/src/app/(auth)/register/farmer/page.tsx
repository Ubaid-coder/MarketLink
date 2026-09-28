"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

import { useAuth } from "../../../../context/AuthContext";

export default function FarmerRegisterPage() {
  const router = useRouter();

  const { registerFarmer } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    stallName: "",
    contactPerson: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e:
      React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement
      >
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
      await registerFarmer(form);

      router.push(
        "/login?registered=farmer"
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Farmer registration failed"
        );
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="text-3xl font-bold text-[#166534]"
        >
          MarketLink
        </Link>

        <p className="mt-2 text-[#6B7280]">
          Bring your farm to the local community.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#1F2937]">
          Register as a Farmer
        </h1>

        <p className="mt-2 text-sm text-[#6B7280]">
          Create your farmer account and stall profile.
          Your profile will require administrator approval
          before public listing.
        </p>

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-[#DC2626]">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-7"
        >
          <h2 className="mb-4 font-semibold text-[#1F2937]">
            Account Information
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />

            <Input
              label="Contact Person"
              name="contactPerson"
              value={form.contactPerson}
              onChange={handleChange}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />

            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
            />

            <Input
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div className="my-7 border-t border-[#E5E7EB]" />

          <h2 className="mb-4 font-semibold text-[#1F2937]">
            Stall Information
          </h2>

          <Input
            label="Stall / Business Name"
            name="stallName"
            value={form.stallName}
            onChange={handleChange}
          />

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-[#1F2937]">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Tell customers about your farm and produce..."
              className="w-full resize-none rounded-lg border border-[#E5E7EB] px-4 py-3 outline-none transition focus:border-[#166534] focus:ring-2 focus:ring-green-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-[#166534] px-5 py-3 font-medium text-white transition hover:bg-[#14532D] disabled:opacity-60"
          >
            {loading
              ? "Creating farmer account..."
              : "Register Farmer"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B7280]">
          Already registered?{" "}
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
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

function Input({
  label,
  name,
  value,
  type = "text",
  onChange,
}: InputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#1F2937]">
        {label}
      </label>

      <input
        required
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 outline-none transition focus:border-[#166534] focus:ring-2 focus:ring-green-100"
      />
    </div>
  );
}