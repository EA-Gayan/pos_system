import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { FaEdit, FaPlus, FaSearch, FaTrash } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import {
  addExpenseCategory,
  deleteExpenseCategory,
  getExpenseCategories,
  updateExpenseCategory,
} from "../../https";
import Table from "../shared/Table";
import ConfirmationPopup from "../shared/ConfirmationPopup";

const apiError = (err, fallback) => err?.response?.data?.message || fallback;

const CategoryFormModal = ({ category, onClose }) => {
  const queryClient = useQueryClient();
  const isEdit = Boolean(category);
  const [nameEn, setNameEn] = useState(category?.nameEn || "");
  const [nameSi, setNameSi] = useState(category?.nameSi || "");

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? updateExpenseCategory({ categoryId: category._id, ...data })
        : addExpenseCategory(data),
    onSuccess: () => {
      enqueueSnackbar(isEdit ? "Category updated!" : "Category added!", {
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["expenseCategories"] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ["records"] });
      onClose();
    },
    onError: (err) =>
      enqueueSnackbar(apiError(err, "Failed to save category!"), { variant: "error" }),
  });

  const submit = (e) => {
    e.preventDefault();
    if (!nameEn.trim() || !nameSi.trim()) {
      return enqueueSnackbar("Enter both the Sinhala and English names.", {
        variant: "warning",
      });
    }
    mutation.mutate({ nameEn: nameEn.trim(), nameSi: nameSi.trim() });
  };

  const input =
    "w-full bg-elevated text-fg text-sm px-3 py-2.5 rounded-xl border border-line-strong focus:border-[#f6b100] focus:outline-none";

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 px-4">
      <form
        onSubmit={submit}
        className="bg-app border border-line rounded-2xl shadow-xl w-full max-w-md"
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-line">
          <h2 className="text-base font-bold text-fg">
            {isEdit ? "Edit Expense Category" : "Add Expense Category"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-fg-dim hover:text-fg text-xl cursor-pointer"
          >
            <IoMdClose />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-fg-dim mb-1.5">
              Name in Sinhala (සිංහල)
            </label>
            <input
              autoFocus
              className={input}
              value={nameSi}
              onChange={(e) => setNameSi(e.target.value)}
              placeholder="උදා: ගෑස්"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-fg-dim mb-1.5">
              Name in English
            </label>
            <input
              className={input}
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Gas"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-[#f6b100] hover:bg-yellow-400 text-black font-semibold text-sm py-2.5 rounded-xl cursor-pointer disabled:opacity-60"
          >
            {mutation.isPending ? "Saving..." : isEdit ? "Update Category" : "Add Category"}
          </button>
        </div>
      </form>
    </div>
  );
};

const AdminExpenseCategoriesView = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [formState, setFormState] = useState(null); // null | { category }
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ["expenseCategories"],
    queryFn: getExpenseCategories,
  });
  const categories = useMemo(() => res?.data?.data || [], [res]);

  const deleteMutation = useMutation({
    mutationFn: deleteExpenseCategory,
    onSuccess: () => {
      enqueueSnackbar("Category deleted!", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["expenseCategories"] });
      setDeleteTarget(null);
    },
    onError: (err) =>
      enqueueSnackbar(apiError(err, "Failed to delete category!"), { variant: "error" }),
  });

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) => c.nameEn.toLowerCase().includes(q) || c.nameSi.toLowerCase().includes(q)
    );
  }, [categories, searchTerm]);

  const renderRow = (row, index) => (
    <tr
      key={row._id || index}
      className="border-b border-line-strong hover:bg-elevated transition-colors duration-150"
    >
      <td className="p-4 font-semibold text-fg">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-lg bg-muted text-accent">
            <RiMoneyDollarCircleLine className="text-base" />
          </span>
          <span>{row.nameSi}</span>
        </div>
      </td>
      <td className="p-4 text-fg-soft">{row.nameEn}</td>
      <td className="p-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setFormState({ category: row })}
            className="p-2 rounded-lg text-blue-400 bg-blue-500/10 hover:bg-blue-500/25 transition cursor-pointer"
            title="Edit Category"
          >
            <FaEdit className="text-sm" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-2 rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/25 transition cursor-pointer"
            title="Delete Category"
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="bg-surface border border-line rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-fg tracking-wide">
              Expense Categories
            </h2>
            <span className="bg-[#f6b100]/20 text-accent border border-[#f6b100]/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {categories.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-fg-dim mt-0.5">
            Staff pick one of these when adding an expense. "Employee Advance" is
            always available and is deducted from the employee's salary.
          </p>
        </div>

        <button
          onClick={() => setFormState({ category: null })}
          className="flex items-center gap-2 self-start md:self-auto bg-[#f6b100] hover:bg-yellow-400 text-black font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer shrink-0"
        >
          <FaPlus className="text-xs" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="bg-app border border-line rounded-2xl p-3 sm:p-4">
        <div className="relative w-full sm:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories..."
            className="w-full bg-elevated text-fg text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-line-strong focus:border-[#f6b100] focus:outline-none transition"
          />
        </div>
      </div>

      <div className="flex-1 bg-app border border-line rounded-2xl overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          {isLoading ? (
            <p className="p-12 text-center text-sm text-gray-500">Loading...</p>
          ) : filtered.length > 0 ? (
            <Table
              headers={["Sinhala Name", "English Name", "Actions"]}
              data={filtered}
              renderRow={renderRow}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
              <RiMoneyDollarCircleLine className="text-4xl text-gray-600 mb-3" />
              <h3 className="text-base font-semibold text-fg-soft">
                {searchTerm ? "No matching categories" : "No expense categories yet"}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                {searchTerm
                  ? `No categories match "${searchTerm}".`
                  : "Add categories like Gas, Vegetables or Electricity so staff can record expenses in one tap."}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setFormState({ category: null })}
                  className="mt-4 bg-[#f6b100] text-black text-xs font-semibold px-4 py-2 rounded-xl hover:bg-yellow-400 transition cursor-pointer"
                >
                  + Add First Category
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {formState && (
        <CategoryFormModal category={formState.category} onClose={() => setFormState(null)} />
      )}

      {deleteTarget && (
        <ConfirmationPopup
          title="Delete expense category"
          message={`Delete "${deleteTarget.nameSi} / ${deleteTarget.nameEn}"? Past expenses keep their name.`}
          onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminExpenseCategoriesView;
