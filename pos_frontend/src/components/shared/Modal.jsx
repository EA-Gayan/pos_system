import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown, FaSearch, FaUserTie } from "react-icons/fa";
import {
  addExpenseRecord,
  getExpenseCategories,
  getExpenseEmployees,
  updateExpenseRecord,
} from "../../https";
import { localToday, toDateStr } from "../dashboard/employees/employeeUtils";

const EMPLOYEE = "employee";

// Which option a saved record belongs to
const initialSelection = (record) => {
  if (!record) return "";
  if (record.employee) return EMPLOYEE;
  return record.category || "";
};

const apiError = (err, fallback) => err?.response?.data?.message || fallback;

/* Searchable category dropdown — type Sinhala or English to filter,
   ↑/↓ to move, Enter to pick, Esc to close. */
const CategorySelect = ({ categories, value, onChange, loading, autoFocus }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);
  const listRef = useRef(null);

  const selectedCat = categories.find((c) => c._id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) => c.nameEn.toLowerCase().includes(q) || c.nameSi.toLowerCase().includes(q)
    );
  }, [categories, query]);

  useEffect(() => setHighlight(0), [query, open]);

  // Keep the highlighted option visible while moving with the arrow keys
  useEffect(() => {
    listRef.current?.children[highlight]?.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (!wrapRef.current?.contains(e.target)) close();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const pick = (category) => {
    onChange(category._id);
    close();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) return setOpen(true);
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && open) {
      // Pick instead of submitting the form
      e.preventDefault();
      if (filtered[highlight]) pick(filtered[highlight]);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
    }
  };

  const displayValue = open
    ? query
    : selectedCat
    ? `${selectedCat.nameSi} — ${selectedCat.nameEn}`
    : "";

  return (
    <div ref={wrapRef} className="relative">
      <div
        className={`flex items-center gap-2 rounded-lg px-4 bg-[#1f1f1f] border transition ${
          open ? "border-[#f6b100]" : selectedCat ? "border-[#f6b100]/60" : "border-[#2f2f2f]"
        }`}
      >
        <FaSearch className="text-gray-500 text-xs shrink-0" />
        <input
          type="text"
          autoFocus={autoFocus}
          value={displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={loading ? "Loading..." : "Search category / වර්ගය සොයන්න"}
          className="bg-transparent flex-1 min-w-0 py-3 text-white focus:outline-none placeholder:text-gray-500"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        <FaChevronDown
          className={`text-gray-500 text-xs shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-lg bg-[#242424] border border-[#383838] shadow-2xl py-1"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500">
              {categories.length === 0
                ? "No categories yet — an admin can add them in Admin Panel → Expense Categories."
                : `No category matches "${query}"`}
            </li>
          ) : (
            filtered.map((c, i) => (
              <li
                key={c._id}
                role="option"
                aria-selected={c._id === value}
                // mousedown keeps focus in the input, so the click isn't lost
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(c);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={`flex items-baseline justify-between gap-3 px-4 py-2.5 cursor-pointer ${
                  i === highlight ? "bg-[#f6b100]/15" : ""
                } ${c._id === value ? "text-[#f6b100]" : "text-white"}`}
              >
                <span className="text-sm font-semibold truncate">{c.nameSi}</span>
                <span className="text-xs text-gray-400 truncate">{c.nameEn}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

const Modal = ({ currentData, onRecordAdded, onClose }) => {
  const isEdit = currentData != null;
  const [selected, setSelected] = useState(() => initialSelection(currentData));
  const [employeeId, setEmployeeId] = useState(currentData?.employee || "");
  const [amount, setAmount] = useState(currentData?.amount?.toString() ?? "");
  const amountRef = useRef(null);

  const isEmployee = selected === EMPLOYEE;

  const { data: categoriesRes, isLoading: loadingCategories } = useQuery({
    queryKey: ["expenseCategories"],
    queryFn: getExpenseCategories,
  });
  const categories = useMemo(() => categoriesRes?.data?.data || [], [categoriesRes]);

  const { data: employeesRes, isLoading: loadingEmployees } = useQuery({
    queryKey: ["expenseEmployees"],
    queryFn: getExpenseEmployees,
    enabled: isEmployee,
  });
  const employees = useMemo(() => employeesRes?.data?.data || [], [employeesRes]);

  // Jump to the amount as soon as the user has chosen what the money is for
  useEffect(() => {
    if (selected && (!isEmployee || employeeId)) amountRef.current?.focus();
  }, [selected, isEmployee, employeeId]);

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? updateExpenseRecord({ recordId: currentData._id, data })
        : addExpenseRecord(data),
    onSuccess: () => {
      enqueueSnackbar(
        isEmployee
          ? "Saved — amount deducted from the employee's salary."
          : isEdit
          ? "Record updated successfully!"
          : "Record added successfully!",
        { variant: "success" }
      );
      onRecordAdded?.();
      onClose?.();
    },
    onError: (err) =>
      enqueueSnackbar(apiError(err, "Failed to save record!"), { variant: "error" }),
  });

  // Old free-text records can be edited without picking a category
  const legacyDescription =
    isEdit && !currentData.category && !currentData.employee ? currentData.description : "";

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = Number(amount);
    if (!selected && !legacyDescription) {
      return enqueueSnackbar("Select an expense category.", { variant: "warning" });
    }
    if (isEmployee && !employeeId) {
      return enqueueSnackbar("Select the employee who took the money.", { variant: "warning" });
    }
    if (!Number.isFinite(value) || value <= 0) {
      return enqueueSnackbar("Enter an amount greater than zero.", { variant: "warning" });
    }

    const data = {
      amount: value,
      // The restaurant's calendar day — used for the employee's salary record
      date: isEdit ? toDateStr(new Date(currentData.createdAt)) : localToday(),
    };
    if (isEmployee) data.employeeId = employeeId;
    else if (selected) data.categoryId = selected;
    else data.description = legacyDescription;

    saveMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="bg-[#1a1a1a] rounded-lg shadow-lg w-full max-w-lg mx-4"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-b-[#333]">
          <h2 className="text-xl text-[#f5f5f5] font-semibold">
            {isEdit ? "Update Expense" : "Add Expense"}
          </h2>
          <button
            type="button"
            className="text-gray-500 text-2xl hover:text-gray-300 cursor-pointer"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          <label className="block text-[#ababab] mb-2 text-sm font-medium">
            Category / වර්ගය
          </label>

          {legacyDescription && !selected && (
            <p className="text-xs text-gray-400 mb-2">
              Current: <span className="text-white">{legacyDescription}</span> — pick a
              category to change it, or just update the amount.
            </p>
          )}

          <CategorySelect
            categories={categories}
            value={isEmployee ? "" : selected}
            onChange={setSelected}
            loading={loadingCategories}
            autoFocus={!isEdit}
          />

          {/* Separate option: cash given to an employee */}
          <button
            type="button"
            onClick={() => setSelected(isEmployee ? "" : EMPLOYEE)}
            className={`mt-2 w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 border text-sm font-semibold transition cursor-pointer ${
              isEmployee
                ? "bg-purple-600 border-purple-500 text-white"
                : "bg-purple-500/10 border-purple-500/40 text-purple-200 hover:bg-purple-500/20"
            }`}
          >
            <FaUserTie className="text-xs" />
            සේවක අත්තිකාරම් / Employee Advance
          </button>

          {isEmployee && (
            <div className="mt-4">
              <label className="block text-[#ababab] mb-2 text-sm font-medium">
                Employee / සේවකයා
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full rounded-lg p-3 px-4 bg-[#1f1f1f] text-white focus:outline-none border border-[#2f2f2f] focus:border-[#f6b100]"
              >
                <option value="">
                  {loadingEmployees ? "Loading..." : "Select employee"}
                </option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
                {/* Keep a since-deactivated employee visible when editing */}
                {isEdit &&
                  currentData.employee &&
                  !employees.some((e) => e._id === currentData.employee) && (
                    <option value={currentData.employee}>
                      {currentData.description.replace(/^Employee Advance - /, "")}
                    </option>
                  )}
              </select>
              <p className="text-[11px] text-purple-300 mt-1.5">
                This amount will be deducted from the employee's salary.
              </p>
            </div>
          )}

          <div className="mt-4">
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Amount (Rs.) / මුදල
            </label>
            <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
              <input
                ref={amountRef}
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="bg-transparent flex-1 text-white text-lg focus:outline-none"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full bg-[#f6B100] py-3 mt-6 rounded-lg text-[#1a1a1a] font-semibold hover:bg-yellow-400 transition-colors cursor-pointer disabled:opacity-60"
          >
            {saveMutation.isPending ? "Saving..." : isEdit ? "Update Expense" : "Add Expense"}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default Modal;
