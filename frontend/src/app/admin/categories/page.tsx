"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Edit3,
  Plus,
  RefreshCcw,
  Search,
  Tags,
  Trash2,
  X,
} from "lucide-react";

import api from "@/lib/api";
import { Category } from "@/types/marketplace";

interface CategoryForm {
  name: string;
  description: string;
}

const EMPTY_FORM: CategoryForm = {
  name: "",
  description: "",
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [
    editingCategory,
    setEditingCategory,
  ] = useState<Category | null>(null);

  const [form, setForm] =
    useState<CategoryForm>(
      EMPTY_FORM
    );

  const [submitting, setSubmitting] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  // =========================================
  // LOAD
  // =========================================

  const loadCategories =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/categories"
          );

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
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            "Unable to load categories."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // =========================================
  // MODAL
  // =========================================

  const openCreate = () => {
    setEditingCategory(null);

    setForm(
      EMPTY_FORM
    );

    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const openEdit = (
    category: Category
  ) => {
    setEditingCategory(
      category
    );

    setForm({
      name:
        category.name || "",

      description:
        category.description ||
        "",
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setModalOpen(false);
    setEditingCategory(null);
    setForm(EMPTY_FORM);
  };

  // =========================================
  // SAVE
  // =========================================

  const saveCategory = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError(
        "Category name is required."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),

        description:
          form.description.trim(),
      };

      if (editingCategory) {
        await api.patch(
          `/categories/${editingCategory._id}`,
          payload
        );

        setSuccess(
          "Category updated successfully."
        );
      } else {
        await api.post(
          "/categories",
          payload
        );

        setSuccess(
          "Category created successfully."
        );
      }

      await loadCategories();

      setModalOpen(false);
      setEditingCategory(null);
      setForm(EMPTY_FORM);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to save category."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================
  // DELETE
  // =========================================

  const deleteCategory = async (
    category: Category
  ) => {
    const confirmed =
      window.confirm(
        `Remove category "${category.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        category._id
      );

      setError("");
      setSuccess("");

      await api.delete(
        `/categories/${category._id}`
      );

      setSuccess(
        "Category removed successfully."
      );

      await loadCategories();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to remove category."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================
  // FILTER
  // =========================================

  const filteredCategories =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return categories;
      }

      return categories.filter(
        (category) =>
          `${category.name} ${
            category.description || ""
          }`
            .toLowerCase()
            .includes(query)
      );
    }, [
      categories,
      search,
    ]);

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
              Categories
            </h1>

            <p className="mt-2 text-[#6B7280]">
              Manage the product categories
              used throughout MarketLink.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white hover:bg-[#14532D]"
          >
            <Plus size={17} />

            Add Category
          </button>
        </div>
      </header>

      <div className="space-y-6 p-5 sm:p-8 lg:p-10">
        {error && !modalOpen && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-green-200 bg-[#DCFCE7] p-4 text-sm text-[#166534]">
            {success}
          </div>
        )}

        {/* SUMMARY */}

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">
                Total Categories
              </p>

              <p className="mt-2 text-3xl font-bold text-[#1F2937]">
                {categories.length}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
              <Tags size={22} />
            </div>
          </div>
        </div>

        {/* SEARCH */}

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center rounded-xl border border-[#E5E7EB] px-4">
              <Search
                size={17}
                className="text-[#6B7280]"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search categories..."
                className="w-full bg-transparent px-3 py-3 text-sm outline-none"
              />
            </div>

            <button
              type="button"
              onClick={loadCategories}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-[#166534] hover:bg-[#DCFCE7]"
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
        </section>

        {/* CATEGORIES */}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({
              length: 6,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-40 animate-pulse rounded-2xl bg-[#E5E7EB]"
                />
              )
            )}
          </div>
        ) : filteredCategories.length ===
          0 ? (
          <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-white py-20 text-center">
            <Tags
              size={44}
              className="mx-auto text-[#166534]"
            />

            <h2 className="mt-4 text-xl font-semibold text-[#1F2937]">
              No categories found
            </h2>

            <p className="mt-2 text-sm text-[#6B7280]">
              Create categories such as
              Vegetables, Fruits, Dairy or
              Grains.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCategories.map(
              (category) => (
                <article
                  key={
                    category._id
                  }
                  className="rounded-2xl border border-[#E5E7EB] bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
                      <Tags
                        size={18}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEdit(
                            category
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#166534] hover:bg-[#DCFCE7]"
                        title="Edit category"
                      >
                        <Edit3
                          size={15}
                        />
                      </button>

                      <button
                        type="button"
                        disabled={
                          deletingId ===
                          category._id
                        }
                        onClick={() =>
                          deleteCategory(
                            category
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-[#DC2626] hover:bg-red-50 disabled:opacity-50"
                        title="Remove category"
                      >
                        <Trash2
                          size={15}
                        />
                      </button>
                    </div>
                  </div>

                  <h2 className="mt-5 text-lg font-semibold text-[#1F2937]">
                    {category.name}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#6B7280]">
                    {category.description ||
                      "No description provided."}
                  </p>
                </article>
              )
            )}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-[#1F2937]">
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h2>

                <p className="mt-1 text-sm text-[#6B7280]">
                  Categories organize products
                  across the marketplace.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[#FAFAF7]"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={saveCategory}
              className="p-6"
            >
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-[#DC2626]">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                  Category Name *
                </label>

                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        name:
                          event.target
                            .value,
                      })
                    )
                  }
                  placeholder="e.g. Vegetables"
                  className="filter-input"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                  Description
                </label>

                <textarea
                  rows={4}
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
                  placeholder="Describe this product category..."
                  className="filter-input resize-none"
                />
              </div>

              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={
                    submitting
                  }
                  onClick={
                    closeModal
                  }
                  className="rounded-xl border border-[#E5E7EB] px-5 py-2.5 text-sm font-semibold text-[#6B7280]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="rounded-xl bg-[#166534] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#14532D] disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingCategory
                      ? "Save Changes"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}