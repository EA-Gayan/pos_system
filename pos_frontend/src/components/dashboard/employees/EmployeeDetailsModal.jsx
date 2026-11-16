import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { IoMdClose } from "react-icons/io";
import { FaEdit, FaTrash, FaPlus, FaFilePdf } from "react-icons/fa";
import {
  addEmployeeWithdrawal,
  deleteEmployeeSalaryEntry,
  downloadEmployeePayslip,
  deleteEmployeeWithdrawal,
  getEmployeeDetails,
  markEmployeeAttendance,
} from "../../../https";
import MonthSwitcher from "./MonthSwitcher";
import {
  ATTENDANCE_STYLES,
  apiError,
  formatDays,
  formatRs,
  localToday,
  prettyDate,
} from "./employeeUtils";
import { getAvatarName } from "../../../utils";
import { getPositionLabel } from "../../../enum/employeePositions";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const NEXT_STATUS = { present: "leave", leave: "half-day", "half-day": "present" };

const StatCard = ({ label, value, sub, tone = "text-fg" }) => (
  <div className="bg-base border border-line rounded-xl p-3">
    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
    <p className={`text-lg font-extrabold mt-1 ${tone}`}>{value}</p>
    {sub && <p className="text-[11px] text-gray-500 mt-0.5">{sub}</p>}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between gap-3 py-1.5 border-b border-line-soft last:border-0">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-xs text-fg font-medium text-right break-words">{value || "—"}</span>
  </div>
);

const balanceTone = (n) => (n < 0 ? "text-red-400" : "text-accent");

const earnedSub = (breakdown = []) => {
  if (breakdown.length === 0) return "No days counted yet";
  if (breakdown.length === 1) {
    const [seg] = breakdown;
    return `${formatDays(seg.workingDays)} × ${formatRs(seg.dailySalary)}`;
  }
  return `At ${breakdown.length} rates — see breakdown`;
};

/* --------------------------- Salary history ---------------------------- */

const SalaryHistory = ({ history = [], asOf, onDelete, deletingId }) => {
  const [confirmId, setConfirmId] = useState(null);
  // Newest first; the opening rate (earliest entry) cannot be removed
  const rows = [...history].reverse();
  const openingId = history[0]?._id;
  const currentFrom = [...history].reverse().find((h) => h.effectiveFrom <= asOf)?.effectiveFrom;

  return (
    <div className="mt-4">
      <h3 className="text-sm font-bold text-fg mb-2">Salary History</h3>
      <div className="space-y-1.5">
        {rows.map((h) => {
          const isFuture = h.effectiveFrom > asOf;
          const isCurrent = h.effectiveFrom === currentFrom;
          const canDelete = h._id && h._id !== openingId;
          return (
            <div
              key={h._id || h.effectiveFrom}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 border ${
                isCurrent ? "border-[#f6b100]/40 bg-[#f6b100]/5" : "border-line-soft bg-surface"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-fg">{formatRs(h.dailySalary)} / day</p>
                <p className="text-[11px] text-gray-500">
                  {h._id === openingId ? "Starting rate · " : "From "}
                  {prettyDate(h.effectiveFrom)}
                  {isCurrent && <span className="text-accent"> · current</span>}
                  {isFuture && <span className="text-blue-300"> · scheduled</span>}
                </p>
              </div>
              {canDelete &&
                (confirmId === h._id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDelete(h._id)}
                      disabled={deletingId === h._id}
                      className="text-[10px] font-semibold text-white bg-red-600 hover:bg-red-500 px-2 py-1 rounded-md cursor-pointer"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="text-[10px] font-semibold text-fg-soft bg-muted px-2 py-1 rounded-md cursor-pointer"
                    >
                      Keep
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(h._id)}
                    className="p-1.5 rounded-md text-red-400 bg-red-500/10 hover:bg-red-500/25 cursor-pointer"
                    title="Remove this salary change (if entered by mistake)"
                  >
                    <FaTrash className="text-[10px]" />
                  </button>
                ))}
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-gray-500 mt-2">
        To change the salary, use Edit Profile and choose the date it takes effect.
      </p>
    </div>
  );
};

/* ------------------------- Attendance calendar ------------------------- */

const AttendanceCalendar = ({ employee, month, asOf, attendance, onToggle, pendingDate }) => {
  const statusByDate = useMemo(() => {
    const map = {};
    for (const a of attendance) map[a.date] = a.status;
    return map;
  }, [attendance]);

  const cells = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const leading = (new Date(y, m - 1, 1).getDay() + 6) % 7; // Monday-first
    const list = Array.from({ length: leading }, () => null);
    for (let d = 1; d <= daysInMonth; d++) {
      list.push(`${month}-${String(d).padStart(2, "0")}`);
    }
    return list;
  }, [month]);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAYS.map((w) => (
          <span key={w} className="text-[10px] font-bold text-gray-500 text-center uppercase">
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((date, i) => {
          if (!date) return <span key={`b${i}`} />;

          const outOfEmployment =
            date < employee.joinDate || (employee.endDate && date > employee.endDate);
          const isFuture = date > asOf;
          const status = statusByDate[date] || "present";
          const style = ATTENDANCE_STYLES[status];
          const isToday = date === asOf;
          const isPending = pendingDate === date;

          if (outOfEmployment) {
            return (
              <span
                key={date}
                className="aspect-square sm:aspect-auto sm:h-12 rounded-lg border border-dashed border-line text-gray-700 text-xs flex items-center justify-center"
                title="Not employed on this day"
              >
                {Number(date.slice(8))}
              </span>
            );
          }

          return (
            <button
              key={date}
              disabled={isPending}
              onClick={() => onToggle(date, NEXT_STATUS[status])}
              title={`${prettyDate(date)} — ${style.label}${isFuture ? " (upcoming)" : ""}. Click to change.`}
              className={`aspect-square sm:aspect-auto sm:h-12 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center cursor-pointer transition hover:scale-105 ${
                isFuture && status === "present"
                  ? "border-line text-gray-500 bg-base"
                  : style.cell
              } ${isToday ? "ring-2 ring-[#f6b100]" : ""} ${isPending ? "opacity-50 animate-pulse" : ""}`}
            >
              <span>{Number(date.slice(8))}</span>
              {status !== "present" && (
                <span className="hidden sm:block text-[9px] font-bold uppercase leading-none mt-0.5">
                  {status === "leave" ? "Leave" : "Half"}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-fg-dim">
        {Object.entries(ATTENDANCE_STYLES).map(([key, s]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded border ${s.cell}`} /> {s.label}
          </span>
        ))}
        <span className="text-gray-500">· Click a day to cycle Working → Leave → Half Day</span>
      </div>
    </div>
  );
};

/* ---------------------------- Withdrawals ------------------------------ */

const WithdrawalForm = ({ onSubmit, isPending }) => {
  const [form, setForm] = useState({ amount: "", date: localToday(), type: "advance", note: "" });
  const input =
    "bg-elevated text-fg text-sm px-3 py-2 rounded-xl border border-line-strong focus:border-[#f6b100] focus:outline-none";

  const submit = (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return enqueueSnackbar("Enter an amount greater than zero!", { variant: "warning" });
    }
    onSubmit({ ...form, amount }, () => setForm((f) => ({ ...f, amount: "", note: "" })));
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_1.4fr_auto] gap-2">
      <input
        type="number"
        min="0"
        step="0.01"
        placeholder="Amount (Rs.)"
        className={input}
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
      />
      <input
        type="date"
        className={input}
        value={form.date}
        max={localToday()}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
      />
      <select
        className={input}
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
      >
        <option value="advance">Advance</option>
        <option value="salary">Salary Payment</option>
      </select>
      <input
        placeholder="Note (optional)"
        className={input}
        value={form.note}
        onChange={(e) => setForm({ ...form, note: e.target.value })}
      />
      <button
        type="submit"
        disabled={isPending}
        className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 bg-[#f6b100] hover:bg-yellow-400 text-black text-sm font-semibold px-4 py-2 rounded-xl cursor-pointer disabled:opacity-60"
      >
        <FaPlus className="text-xs" /> {isPending ? "Saving..." : "Add"}
      </button>
    </form>
  );
};

const WithdrawalList = ({ withdrawals, onDelete, deletingId }) => {
  const [confirmId, setConfirmId] = useState(null);

  if (withdrawals.length === 0) {
    return (
      <p className="text-xs text-gray-500 text-center py-6">
        No withdrawals recorded for this month.
      </p>
    );
  }

  return (
    <div className="divide-y divide-line">
      {withdrawals.map((w) => (
        <div key={w._id} className="flex items-center gap-3 py-2.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-fg">{formatRs(w.amount)}</span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  w.type === "salary"
                    ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                    : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                }`}
              >
                {w.type === "salary" ? "Salary" : "Advance"}
              </span>
              {w.expense && (
                <span
                  className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border bg-[#f6b100]/10 text-accent border-[#f6b100]/30"
                  title="Recorded from the Expenses screen — deleting it also removes that expense"
                >
                  Expense
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 truncate">
              {prettyDate(w.date)}
              {w.note ? ` · ${w.note}` : ""}
            </p>
          </div>
          {confirmId === w._id ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onDelete(w._id)}
                disabled={deletingId === w._id}
                className="text-[11px] font-semibold text-white bg-red-600 hover:bg-red-500 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                {w.expense ? "Delete + expense" : "Delete"}
              </button>
              <button
                onClick={() => setConfirmId(null)}
                className="text-[11px] font-semibold text-fg-soft bg-muted px-2.5 py-1 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmId(w._id)}
              className="p-2 rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/25 cursor-pointer"
              title="Delete withdrawal"
            >
              <FaTrash className="text-xs" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

/* ------------------------------ Modal ---------------------------------- */

const EmployeeDetailsModal = ({ employeeId, initialMonth, onClose, onEdit }) => {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(initialMonth);
  const [pendingDate, setPendingDate] = useState(null);
  const asOf = localToday();

  const { data: res, isLoading, isError, error } = useQuery({
    queryKey: ["employee", employeeId, month, asOf],
    queryFn: () => getEmployeeDetails({ employeeId, month, asOf }),
    placeholderData: keepPreviousData,
  });
  const details = res?.data?.data;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
    queryClient.invalidateQueries({ queryKey: ["employees"] });
  };

  const attendanceMutation = useMutation({
    mutationFn: markEmployeeAttendance,
    onMutate: ({ date }) => setPendingDate(date),
    onSuccess: refresh,
    onError: (err) =>
      enqueueSnackbar(apiError(err, "Failed to update attendance!"), { variant: "error" }),
    onSettled: () => setPendingDate(null),
  });

  const addWithdrawalMutation = useMutation({
    mutationFn: addEmployeeWithdrawal,
    onSuccess: () => {
      enqueueSnackbar("Withdrawal recorded!", { variant: "success" });
      refresh();
    },
    onError: (err) =>
      enqueueSnackbar(apiError(err, "Failed to add withdrawal!"), { variant: "error" }),
  });

  const deleteWithdrawalMutation = useMutation({
    mutationFn: deleteEmployeeWithdrawal,
    onSuccess: () => {
      enqueueSnackbar("Withdrawal deleted!", { variant: "success" });
      refresh();
      // A linked expense may have been removed too
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
    onError: (err) =>
      enqueueSnackbar(apiError(err, "Failed to delete withdrawal!"), { variant: "error" }),
  });

  const payslipMutation = useMutation({
    mutationFn: downloadEmployeePayslip,
    onSuccess: (response, { month: slipMonth }) => {
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      const safeName = (details?.name || "employee").replace(/[^a-z0-9]+/gi, "_");
      link.download = `payslip_${safeName}_${slipMonth}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      enqueueSnackbar("Payslip downloaded!", { variant: "success" });
    },
    onError: async (err) => {
      // Blob responses hide the JSON error message — read it back out
      let message = "Failed to download payslip!";
      try {
        const text = await err?.response?.data?.text?.();
        message = JSON.parse(text).message || message;
      } catch {
        // keep the generic message
      }
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const deleteSalaryMutation = useMutation({
    mutationFn: deleteEmployeeSalaryEntry,
    onSuccess: () => {
      enqueueSnackbar("Salary change removed!", { variant: "success" });
      refresh();
    },
    onError: (err) =>
      enqueueSnackbar(apiError(err, "Failed to remove salary change!"), { variant: "error" }),
  });

  const ms = details?.monthSummary;
  const os = details?.overallSummary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4">
      <div className="w-full max-w-5xl max-h-[95vh] flex flex-col bg-surface border border-line rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-line shrink-0">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-[#f6b100] to-amber-500 flex items-center justify-center text-black font-extrabold shrink-0">
            {getAvatarName(details?.name || "")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-fg truncate">{details?.name || "Employee"}</h2>
              {details && (
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    details.isActive
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : "bg-gray-500/15 text-fg-dim border-gray-500/30"
                  }`}
                >
                  {details.isActive ? "Active" : "Inactive"}
                </span>
              )}
            </div>
            <p className="text-xs text-fg-dim truncate">
              {getPositionLabel(details) || "Staff"} · {formatRs(details?.currentDailySalary)} / day
            </p>
          </div>
          {details && (
            <button
              onClick={() => onEdit(details)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-blue-300 bg-blue-500/10 hover:bg-blue-500/25 px-3 py-2 rounded-xl cursor-pointer"
            >
              <FaEdit /> Edit Profile
            </button>
          )}
          {details && (
            <button
              onClick={() => payslipMutation.mutate({ employeeId, month, asOf })}
              disabled={payslipMutation.isPending}
              className="flex items-center gap-1.5 text-xs font-semibold text-black bg-[#f6b100] hover:bg-yellow-400 px-3 py-2 rounded-xl cursor-pointer disabled:opacity-60"
              title={`Download salary slip for the selected month (PDF)`}
            >
              <FaFilePdf />
              <span className="hidden sm:inline">
                {payslipMutation.isPending ? "Preparing..." : "Download Payslip"}
              </span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-fg-dim hover:text-fg hover:bg-muted cursor-pointer"
          >
            <IoMdClose className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {isError && !details ? (
            <p className="text-sm text-red-400 text-center py-16">
              {apiError(error, "Failed to load employee details.")}
            </p>
          ) : isLoading || !details ? (
            <p className="text-sm text-fg-dim text-center py-16">Loading employee details...</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
              {/* Left column */}
              <div className="space-y-5 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-fg">Monthly Salary Summary</h3>
                  <MonthSwitcher month={month} onChange={setMonth} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <StatCard
                    label="Working Days"
                    value={formatDays(ms.workingDays)}
                    sub={`of ${ms.calendarDays} days counted`}
                    tone="text-emerald-300"
                  />
                  <StatCard
                    label="Leave / Half Days"
                    value={`${ms.leaveDays} / ${ms.halfDays}`}
                    sub="Half day = 0.5 day"
                    tone="text-red-300"
                  />
                  <StatCard
                    label="Earned Salary"
                    value={formatRs(ms.earned)}
                    sub={earnedSub(ms.rateBreakdown)}
                  />
                  <StatCard label="Withdrawn" value={formatRs(ms.withdrawn)} sub="Advances & payments" tone="text-purple-300" />
                </div>

                {ms.rateBreakdown.length > 1 && (
                  <div className="bg-base border border-line rounded-xl p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Salary changed this month — each period paid at its own rate
                    </p>
                    {ms.rateBreakdown.map((seg) => (
                      <div
                        key={seg.from}
                        className="flex items-center justify-between gap-3 py-1.5 border-b border-line-soft last:border-0 text-xs"
                      >
                        <span className="text-fg-dim">
                          {prettyDate(seg.from)} – {prettyDate(seg.to)}
                        </span>
                        <span className="text-fg-soft">
                          {formatDays(seg.workingDays)} × {formatRs(seg.dailySalary)}
                        </span>
                        <span className="font-semibold text-fg">{formatRs(seg.earned)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="flex-1 bg-[#f6b100]/10 border border-[#f6b100]/30 rounded-xl p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-accent/80">
                      Remaining Balance · This Month
                    </p>
                    <p className={`text-2xl font-extrabold mt-1 ${balanceTone(ms.balance)}`}>
                      {formatRs(ms.balance)}
                    </p>
                    <p className="text-[11px] text-fg-dim mt-0.5">Earned − withdrawn in this month</p>
                  </div>
                  <div className="flex-1 bg-base border border-line rounded-xl p-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Overall Balance · Since Joining
                    </p>
                    <p className={`text-2xl font-extrabold mt-1 ${balanceTone(os.balance)}`}>
                      {formatRs(os.balance)}
                    </p>
                    <p className="text-[11px] text-fg-dim mt-0.5">
                      {formatRs(os.earned)} earned − {formatRs(os.withdrawn)} withdrawn
                      {os.balance < 0 && " (advance exceeds earnings)"}
                    </p>
                  </div>
                </div>

                <div className="bg-base border border-line rounded-2xl p-3 sm:p-4">
                  <h3 className="text-sm font-bold text-fg mb-3">Attendance & Leave</h3>
                  <AttendanceCalendar
                    employee={details}
                    month={month}
                    asOf={details.asOf}
                    attendance={details.attendance}
                    pendingDate={pendingDate}
                    onToggle={(date, status) =>
                      attendanceMutation.mutate({ employeeId, date, status })
                    }
                  />
                </div>

                <div className="bg-base border border-line rounded-2xl p-3 sm:p-4 space-y-3">
                  <h3 className="text-sm font-bold text-fg">Withdrawals (Advances & Salary Payments)</h3>
                  <WithdrawalForm
                    isPending={addWithdrawalMutation.isPending}
                    onSubmit={(data, reset) =>
                      addWithdrawalMutation.mutate({ employeeId, ...data }, { onSuccess: reset })
                    }
                  />
                  <WithdrawalList
                    withdrawals={details.withdrawals}
                    deletingId={deleteWithdrawalMutation.variables?.withdrawalId}
                    onDelete={(withdrawalId) =>
                      deleteWithdrawalMutation.mutate({ employeeId, withdrawalId })
                    }
                  />
                </div>
              </div>

              {/* Right column — profile */}
              <aside className="bg-base border border-line rounded-2xl p-4 h-fit">
                <h3 className="text-sm font-bold text-fg mb-2">Profile Details</h3>
                <InfoRow label="Position" value={getPositionLabel(details)} />
                <InfoRow label="Phone" value={details.phone} />
                <InfoRow label="NIC" value={details.nic} />
                <InfoRow label="Address" value={details.address} />
                <InfoRow label="Emergency Contact" value={details.emergencyContact} />
                <InfoRow label="Join Date" value={prettyDate(details.joinDate)} />
                {!details.isActive && (
                  <InfoRow label="Last Working Day" value={prettyDate(details.endDate)} />
                )}
                <InfoRow label="Current Day Salary" value={formatRs(details.currentDailySalary)} />
                <InfoRow label="Total Days Worked" value={formatDays(os.workingDays)} />
                <InfoRow label="Total Leave Days" value={`${os.leaveDays} (+${os.halfDays} half)`} />
                <SalaryHistory
                  history={details.salaryHistory}
                  asOf={details.asOf}
                  deletingId={
                    deleteSalaryMutation.isPending
                      ? deleteSalaryMutation.variables?.entryId
                      : null
                  }
                  onDelete={(entryId) => deleteSalaryMutation.mutate({ employeeId, entryId })}
                />
                {details.notes && (
                  <p className="text-xs text-fg-dim mt-3 bg-surface rounded-lg p-2.5 whitespace-pre-wrap">
                    {details.notes}
                  </p>
                )}
                <button
                  onClick={() => onEdit(details)}
                  className="sm:hidden mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-300 bg-blue-500/10 px-3 py-2 rounded-xl cursor-pointer"
                >
                  <FaEdit /> Edit Profile
                </button>
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsModal;
