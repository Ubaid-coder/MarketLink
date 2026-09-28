"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Image as ImageIcon,
  RefreshCcw,
  Save,
} from "lucide-react";

import api from "@/lib/api";

import { Category } from "@/types/marketplace";
import { FarmerProductFormData } from "@/types/farmerProduct";


interface ProductFormProps {
  initialData?: FarmerProductFormData;

  submitting?: boolean;

  submitLabel?: string;

  onSubmit: (
    data: FarmerProductFormData
  ) => Promise<void> | void;
}


const EMPTY_FORM: FarmerProductFormData = {
  name: "",
  category: "",
  description: "",
  price: "",
  unit: "",
  quantityAvailable: "",
  image: "",
  weeklyStockEnabled: false,
  weeklyDefaultQuantity: "",
};


export default function ProductForm({
  initialData,
  submitting = false,
  submitLabel = "Save Product",
  onSubmit,
}: ProductFormProps) {
  const [form, setForm] =
    useState<FarmerProductFormData>(
      initialData || EMPTY_FORM
    );

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);


  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response =
          await api.get("/categories");

        const raw =
          response.data.categories ||
          response.data.data ||
          response.data ||
          [];

        setCategories(
          Array.isArray(raw)
            ? raw
            : []
        );
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load product categories."
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);


  const updateField = (
    field: keyof FarmerProductFormData,
    value: string | boolean
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };


  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    if (!form.unit.trim()) {
      setError("Product unit is required.");
      return;
    }

    const price =
      Number(form.price);

    const quantity =
      Number(form.quantityAvailable);

    const weeklyQuantity =
      Number(
        form.weeklyDefaultQuantity || 0
      );

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError("Enter a valid price.");
      return;
    }

    if (
      !Number.isFinite(quantity) ||
      quantity < 0
    ) {
      setError(
        "Enter a valid available quantity."
      );
      return;
    }

    if (
      form.weeklyStockEnabled &&
      (
        !Number.isFinite(weeklyQuantity) ||
        weeklyQuantity < 0
      )
    ) {
      setError(
        "Enter a valid weekly stock quantity."
      );
      return;
    }

    await onSubmit(form);
  };


  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
          {error}
        </div>
      )}


      {/* BASIC INFORMATION */}

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#1F2937]">
          Product Information
        </h2>

        <p className="mt-1 text-sm text-[#6B7280]">
          Add the basic information customers
          will see in the marketplace.
        </p>


        <div className="mt-6 grid gap-5 sm:grid-cols-2">

          <Field label="Product Name *">
            <input
              value={form.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value
                )
              }
              placeholder="e.g. Fresh Tomatoes"
              className="filter-input"
            />
          </Field>


          <Field label="Category *">
            <select
              value={form.category}
              disabled={loadingCategories}
              onChange={(event) =>
                updateField(
                  "category",
                  event.target.value
                )
              }
              className="filter-input"
            >
              <option value="">
                {loadingCategories
                  ? "Loading categories..."
                  : "Select category"}
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category._id}
                    value={category._id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </Field>


          <Field label="Price (PKR) *">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) =>
                updateField(
                  "price",
                  event.target.value
                )
              }
              placeholder="250"
              className="filter-input"
            />
          </Field>


          <Field label="Unit *">
            <input
              value={form.unit}
              onChange={(event) =>
                updateField(
                  "unit",
                  event.target.value
                )
              }
              placeholder="kg, dozen, piece..."
              className="filter-input"
            />
          </Field>

        </div>


        <div className="mt-5">
          <Field label="Description">
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              placeholder="Describe your product..."
              className="filter-input resize-none"
            />
          </Field>
        </div>


        <div className="mt-5">
          <Field label="Product Image URL">
            <div className="relative">
              <ImageIcon
                size={17}
                className="absolute left-3 top-3.5 text-[#6B7280]"
              />

              <input
                type="url"
                value={form.image}
                onChange={(event) =>
                  updateField(
                    "image",
                    event.target.value
                  )
                }
                placeholder="https://..."
                className="filter-input pl-10"
              />
            </div>
          </Field>

          <p className="mt-2 text-xs text-[#6B7280]">
            We currently store an image URL because
            image upload is not part of the backend yet.
          </p>
        </div>
      </section>


      {/* INVENTORY */}

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#1F2937]">
          Inventory
        </h2>

        <p className="mt-1 text-sm text-[#6B7280]">
          Control current and recurring weekly stock.
        </p>


        <div className="mt-6 max-w-md">
          <Field label="Quantity Available *">
            <input
              type="number"
              min="0"
              value={form.quantityAvailable}
              onChange={(event) =>
                updateField(
                  "quantityAvailable",
                  event.target.value
                )
              }
              placeholder="30"
              className="filter-input"
            />
          </Field>
        </div>


        <div className="mt-6 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-5">
          <label className="flex cursor-pointer items-start gap-3">

            <input
              type="checkbox"
              checked={
                form.weeklyStockEnabled
              }
              onChange={(event) =>
                updateField(
                  "weeklyStockEnabled",
                  event.target.checked
                )
              }
              className="mt-1 h-4 w-4 accent-[#166534]"
            />

            <div>
              <div className="flex items-center gap-2 font-semibold text-[#166534]">
                <RefreshCcw size={16} />

                Recurring Weekly Stock
              </div>

              <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                Save a default weekly quantity so you
                can quickly reset this product's stock.
              </p>
            </div>

          </label>


          {form.weeklyStockEnabled && (
            <div className="mt-5 max-w-sm">
              <Field label="Default Weekly Quantity">
                <input
                  type="number"
                  min="0"
                  value={
                    form.weeklyDefaultQuantity
                  }
                  onChange={(event) =>
                    updateField(
                      "weeklyDefaultQuantity",
                      event.target.value
                    )
                  }
                  placeholder="50"
                  className="filter-input bg-white"
                />
              </Field>
            </div>
          )}
        </div>
      </section>


      {/* PREVIEW */}

      {form.image && (
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <p className="mb-3 text-sm font-semibold text-[#1F2937]">
            Image Preview
          </p>

          <img
            src={form.image}
            alt="Product preview"
            className="h-48 w-full max-w-sm rounded-xl object-cover"
          />
        </section>
      )}


      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-[#166534] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#14532D] disabled:opacity-50"
        >
          <Save size={17} />

          {submitting
            ? "Saving..."
            : submitLabel}
        </button>
      </div>
    </form>
  );
}


function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#1F2937]">
        {label}
      </label>

      {children}
    </div>
  );
}