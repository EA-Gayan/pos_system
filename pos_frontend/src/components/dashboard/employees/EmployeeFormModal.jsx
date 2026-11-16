import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import {
  EmployeePositionLabels,
  EmployeePositions,
} from "../../../enum/employeePositions";
import { addEmployee, updateEmployee } from "../../../https";
import { apiError, formatRs, localToday } from "./employeeUtils";

const emptyForm = () => ({
  name: "",
  position: "", // EmployeePositions value; "" until selected
  customPosition: "",
  phone: "",
  nic: "",
  address: "",
  emergencyContact: "",
  joinDate: localToday(),
  dailySalary: "",
  salaryEffectiveFrom: localToday(),
  isActive: true,
  endDate: "",
  notes: "",
});

const inputClass =
  "w-full bg-[#242424] text-white text-sm px-3 py-2.5 rounded-xl border border-[#383838] focus:border-[#f6b100] focus:outline-none transition";

// Dropdown options, built from the enum — "Other" is rendered separately last
const POSITION_OPTIONS = Object.entries(EmployeePositionLabels)
  .map(([value, label]) => ({ value: Number(value), label }))
  .filter((o) => o.value !== EmployeePositions.OTHER);

const Field = ({ label, required, children, hint }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-semibold text-gray-300">
      {label} {required && <span className="text-[#f6b100]">*</span>}
    </span>
    {children}
    {hint && <span className="text-[11px] text-gray-500">{hint}</span>}
  </label>
);

const EmployeeFormModal = ({ employee, onClose }) => {
  const isEdit = Boolean(employee);
  const queryClient = useQueryClient();

  const [form, setForm] = useState(() =>
    isEdit
      ? {
          ...emptyForm(),
          ...employee,
          dailySalary: String(employee.dailySalary ?? ""),
          endDate: employee.endDate || "",
        }
      : emptyForm(),
  );

  const isOther = Number(form.position) === EmployeePositions.OTHER;
  // Editing the rate creates a new effective-dated entry instead of rewriting history
  const salaryChanged =
    isEdit &&
    form.dailySalary !== "" &&
    Number(form.dailySalary) !== Number(employee.dailySalary);

  const update = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const mutation = useMutation({
    mutationFn: (payload) =>
      isEdit
        ? updateEmployee({ employeeId: employee._id, ...payload })
        : addEmployee(payload),
    onSuccess: (res) => {
      enqueueSnackbar(res?.data?.message || "Saved!", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee"] });
      onClose();
    },
    onError: (error) => {
      enqueueSnackbar(apiError(error, "Failed to save employee!"), {
        variant: "error",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dailySalary = Number(form.dailySalary);
    if (!form.name.trim()) {
      return enqueueSnackbar("Employee name is required!", {
        variant: "warning",
      });
    }
    if (form.position === "") {
      return enqueueSnackbar("Please select a position!", {
        variant: "warning",
      });
    }
    if (isOther && !form.customPosition.trim()) {
      return enqueueSnackbar("Enter the role name for 'Other'!", {
        variant: "warning",
      });
    }
    if (
      !Number.isFinite(dailySalary) ||
      dailySalary < 0 ||
      form.dailySalary === ""
    ) {
      return enqueueSnackbar("Enter a valid day salary!", {
        variant: "warning",
      });
    }

    mutation.mutate({
      name: form.name.trim(),
      position: Number(form.position),
      customPosition: isOther ? form.customPosition.trim() : "",
      phone: form.phone,
      nic: form.nic,
      address: form.address,
      emergencyContact: form.emergencyContact,
      joinDate: form.joinDate,
      // On edit, only send the rate when it changed — the server then adds a
      // salary-history entry starting at salaryEffectiveFrom
      ...(!isEdit || salaryChanged
        ? { dailySalary, salaryEffectiveFrom: form.salaryEffectiveFrom }
        : {}),
      isActive: form.isActive,
      endDate: form.isActive ? null : form.endDate || null,
      notes: form.notes,
      asOf: localToday(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#1f1f1f] border border-[#2d2d2d] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d2d2d] shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">
              {isEdit ? "Edit Employee Profile" : "Create Employee Profile"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a2a2a] cursor-pointer"
          >
            <IoMdClose className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 space-y-5"
        >
          <section className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Full Name" required>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={update("name")}
                  placeholder="e.g. Kasun Perera"
                />
              </Field>
              <Field label="Position / Role" required>
                <select
                  className={`${inputClass} cursor-pointer`}
                  value={form.position}
                  onChange={update("position")}
                >
                  <option value="">Select a role</option>
                  {POSITION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                  <option value={EmployeePositions.OTHER}>
                    Other (type below)
                  </option>
                </select>
                {isOther && (
                  <input
                    className={inputClass}
                    value={form.customPosition}
                    onChange={update("customPosition")}
                    placeholder="Enter role name"
                  />
                )}
              </Field>
              <Field label="Phone Number">
                <input
                  className={inputClass}
                  value={form.phone}
                  onChange={update("phone")}
                  placeholder="07X XXX XXXX"
                />
              </Field>
              <Field label="NIC Number">
                <input
                  className={inputClass}
                  value={form.nic}
                  onChange={update("nic")}
                  placeholder="National ID"
                />
              </Field>
              <Field label="Address">
                <input
                  className={inputClass}
                  value={form.address}
                  onChange={update("address")}
                />
              </Field>
              <Field label="Emergency Contact">
                <input
                  className={inputClass}
                  value={form.emergencyContact}
                  onChange={update("emergencyContact")}
                  placeholder="Name & phone"
                />
              </Field>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Employment & Salary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field
                label="Join Date"
                required
                hint="Salary is counted from this day."
              >
                <input
                  type="date"
                  className={inputClass}
                  value={form.joinDate}
                  onChange={update("joinDate")}
                  max={localToday()}
                />
              </Field>
              <Field
                label="Day Salary (Rs.)"
                required
                hint="Amount earned for one full working day."
              >
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  value={form.dailySalary}
                  onChange={update("dailySalary")}
                  placeholder="e.g. 2500"
                />
              </Field>
            </div>

            {salaryChanged && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#f6b100]/10 border border-[#f6b100]/30 rounded-xl p-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#f6b100]">
                    New salary effective from
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Days before this date stay at the old rate of{" "}
                    {formatRs(employee.dailySalary)}. Past salary is not
                    recalculated.
                  </p>
                </div>
                <input
                  type="date"
                  className={`${inputClass} sm:w-44`}
                  value={form.salaryEffectiveFrom}
                  onChange={update("salaryEffectiveFrom")}
                  min={form.joinDate}
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={update("isActive")}
                  className="w-4 h-4 accent-[#f6b100]"
                />
                <span className="text-sm text-gray-200 font-medium">
                  Currently employed (active)
                </span>
              </label>
              {!form.isActive && (
                <div className="flex items-center gap-2 sm:ml-auto">
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    Last working day
                  </span>
                  <input
                    type="date"
                    className={`${inputClass} py-1.5`}
                    value={form.endDate}
                    onChange={update("endDate")}
                    min={form.joinDate}
                    max={localToday()}
                  />
                </div>
              )}
            </div>
          </section>

          <Field label="Notes">
            <textarea
              rows={2}
              className={inputClass}
              value={form.notes}
              onChange={update("notes")}
              placeholder="Any additional details"
            />
          </Field>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 bg-[#2a2a2a] hover:bg-[#333] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black bg-[#f6b100] hover:bg-yellow-400 cursor-pointer disabled:opacity-60"
            >
              {mutation.isPending
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeFormModal;
