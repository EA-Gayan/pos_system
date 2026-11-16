import React, { useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { FaEdit, FaEye, FaPlus, FaSearch, FaTrash, FaUsers } from "react-icons/fa";
import { MdEventBusy, MdPayments, MdAccountBalanceWallet, MdBadge } from "react-icons/md";
import Table from "../shared/Table";
import { getPositionLabel } from "../../enum/employeePositions";
import ConfirmationPopup from "../shared/ConfirmationPopup";
import { deleteEmployee, getEmployees, markEmployeeAttendance } from "../../https";
import { getAvatarName } from "../../utils";
import EmployeeFormModal from "./employees/EmployeeFormModal";
import EmployeeDetailsModal from "./employees/EmployeeDetailsModal";
import MonthSwitcher from "./employees/MonthSwitcher";
import {
  ATTENDANCE_STYLES,
  apiError,
  currentMonth,
  formatDays,
  formatRs,
  localToday,
  monthLabel,
} from "./employees/employeeUtils";

const SummaryCard = ({ icon, label, value, sub, color }) => (
  <div className="theme-dark rounded-2xl p-4 shadow-md" style={{ backgroundColor: color }}>
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-white/80 uppercase tracking-wider">{label}</p>
        <p className="text-xl sm:text-2xl font-extrabold text-fg mt-1.5 truncate">{value}</p>
      </div>
      <div className="p-2.5 rounded-xl bg-white/15 text-white shrink-0">{icon}</div>
    </div>
    {sub && <p className="text-[11px] text-white/75 mt-2">{sub}</p>}
  </div>
);

const TodayToggle = ({ employee, asOf, onChange, isPending }) => {
  const canMark =
    employee.isActive && asOf >= employee.joinDate &&
    (!employee.endDate || asOf <= employee.endDate);

  if (!canMark) return <span className="text-xs text-gray-600">—</span>;

  return (
    <div className={`inline-flex rounded-lg border border-line-strong overflow-hidden ${isPending ? "opacity-50" : ""}`}>
      {["present", "half-day", "leave"].map((status) => {
        const active = employee.todayStatus === status;
        const s = ATTENDANCE_STYLES[status];
        return (
          <button
            key={status}
            disabled={isPending || active}
            onClick={() => onChange(status)}
            className={`px-2 py-1 text-[10px] font-bold uppercase transition cursor-pointer ${
              active ? `${s.chip} border-0` : "text-gray-500 hover:text-fg hover:bg-muted"
            }`}
            title={`Mark today as ${s.label}`}
          >
            {status === "present" ? "Work" : status === "half-day" ? "Half" : "Leave"}
          </button>
        );
      })}
    </div>
  );
};

const AdminEmployeesView = () => {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(currentMonth);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [formEmployee, setFormEmployee] = useState(undefined); // undefined = closed, null = new
  const [detailsId, setDetailsId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const asOf = localToday();

  const { data: res, isLoading, isError, error } = useQuery({
    queryKey: ["employees", month, asOf],
    queryFn: () => getEmployees({ month, asOf }),
    placeholderData: keepPreviousData,
  });

  const employees = useMemo(() => res?.data?.data?.employees || [], [res]);
  const totals = res?.data?.data?.totals;

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return employees.filter((e) => {
      if (statusFilter === "active" && !e.isActive) return false;
      if (statusFilter === "inactive" && e.isActive) return false;
      if (!term) return true;
      return [e.name, getPositionLabel(e), e.phone, e.nic]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(term));
    });
  }, [employees, searchTerm, statusFilter]);

  const attendanceMutation = useMutation({
    mutationFn: markEmployeeAttendance,
    onSuccess: (r) => {
      enqueueSnackbar(r?.data?.message || "Attendance updated", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee"] });
    },
    onError: (err) =>
      enqueueSnackbar(apiError(err, "Failed to update attendance!"), { variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      enqueueSnackbar("Employee deleted successfully!", { variant: "success" });
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (err) =>
      enqueueSnackbar(apiError(err, "Failed to delete employee!"), { variant: "error" }),
  });

  const headers = [
    "Employee",
    "Day Salary",
    "Working Days",
    "Earned",
    "Withdrawn",
    "Balance",
    "Today",
    "Actions",
  ];

  const renderRow = (row) => {
    const ms = row.monthSummary;
    const os = row.overallSummary;
    return (
      <tr
        key={row._id}
        className={`border-b border-line-strong hover:bg-elevated transition-colors ${row.isActive ? "" : "opacity-60"}`}
      >
        <td className="p-4">
          <button
            onClick={() => setDetailsId(row._id)}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <span className="h-10 w-10 rounded-xl bg-muted text-accent font-bold text-sm flex items-center justify-center shrink-0">
              {getAvatarName(row.name)}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-fg group-hover:text-accent truncate">
                {row.name}
              </p>
              <p className="text-[11px] text-fg-dim truncate">
                {getPositionLabel(row)}
                {row.phone ? ` · ${row.phone}` : ""}
                {!row.isActive && " · Inactive"}
              </p>
            </div>
          </button>
        </td>
        <td className="p-4 whitespace-nowrap">
          <p className="text-sm text-fg">{formatRs(row.currentDailySalary)}</p>
          {row.dailySalary !== row.currentDailySalary && (
            <p className="text-[11px] text-accent/80">
              {formatRs(row.dailySalary)} scheduled
            </p>
          )}
        </td>
        <td className="p-4 whitespace-nowrap">
          <p className="text-sm font-bold text-emerald-300">{formatDays(ms.workingDays)}</p>
          <p className="text-[11px] text-gray-500">
            {ms.leaveDays} leave{ms.halfDays ? ` · ${ms.halfDays} half` : ""}
          </p>
        </td>
        <td className="p-4 text-sm text-fg font-semibold whitespace-nowrap">{formatRs(ms.earned)}</td>
        <td className="p-4 text-sm text-purple-300 whitespace-nowrap">{formatRs(ms.withdrawn)}</td>
        <td className="p-4 whitespace-nowrap">
          <p className={`text-sm font-extrabold ${ms.balance < 0 ? "text-red-400" : "text-accent"}`}>
            {formatRs(ms.balance)}
          </p>
          <p className={`text-[11px] ${os.balance < 0 ? "text-red-400/80" : "text-gray-500"}`}>
            Overall {formatRs(os.balance)}
          </p>
        </td>
        <td className="p-4">
          <TodayToggle
            employee={row}
            asOf={asOf}
            isPending={
              attendanceMutation.isPending &&
              attendanceMutation.variables?.employeeId === row._id
            }
            onChange={(status) =>
              attendanceMutation.mutate({ employeeId: row._id, date: asOf, status })
            }
          />
        </td>
        <td className="p-4">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setDetailsId(row._id)}
              className="p-2 rounded-lg text-accent bg-[#f6b100]/10 hover:bg-[#f6b100]/25 cursor-pointer"
              title="View attendance & salary"
            >
              <FaEye className="text-sm" />
            </button>
            <button
              onClick={() => setFormEmployee(row)}
              className="p-2 rounded-lg text-blue-400 bg-blue-500/10 hover:bg-blue-500/25 cursor-pointer"
              title="Edit profile"
            >
              <FaEdit className="text-sm" />
            </button>
            <button
              onClick={() => setDeleteTarget(row)}
              className="p-2 rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/25 cursor-pointer"
              title="Delete employee"
            >
              <FaTrash className="text-sm" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Banner */}
      <div className="bg-surface border border-line rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-fg tracking-wide">
              Employee Management
            </h2>
            <span className="bg-[#f6b100]/20 text-accent border border-[#f6b100]/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {totals?.activeEmployees ?? 0} Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-fg-dim mt-0.5">
            Staff profiles, daily attendance, leave, salary advances and remaining balances.
          </p>
        </div>
        <button
          onClick={() => setFormEmployee(null)}
          className="flex items-center gap-2 bg-[#f6b100] hover:bg-yellow-400 text-black font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer self-start md:self-auto shrink-0"
        >
          <FaPlus className="text-xs" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          color="#5b45b0"
          icon={<FaUsers className="text-xl" />}
          label="Active Staff"
          value={totals?.activeEmployees ?? 0}
          sub={`${totals?.totalEmployees ?? 0} profiles in total`}
        />
        <SummaryCard
          color="#b73e3e"
          icon={<MdEventBusy className="text-xl" />}
          label="On Leave Today"
          value={totals?.onLeaveToday ?? 0}
          sub={`${totals?.halfDayToday ?? 0} on half day`}
        />
        <SummaryCard
          color="#285430"
          icon={<MdPayments className="text-xl" />}
          label={`Salary · ${monthLabel(month)}`}
          value={formatRs(totals?.monthEarned)}
          sub={`${formatRs(totals?.monthWithdrawn)} withdrawn`}
        />
        <SummaryCard
          color="#735f32"
          icon={<MdAccountBalanceWallet className="text-xl" />}
          label="Outstanding Balance"
          value={formatRs(totals?.outstandingBalance)}
          sub="Owed to all staff, since joining"
        />
      </div>

      {/* Toolbar */}
      <div className="bg-app border border-line rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <MonthSwitcher month={month} onChange={setMonth} />
          <div className="flex bg-elevated border border-line-strong rounded-xl p-1">
            {[
              ["active", "Active"],
              ["inactive", "Inactive"],
              ["all", "All"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                  statusFilter === key ? "bg-[#f6b100] text-black" : "text-fg-dim hover:text-fg"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full lg:w-72">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, position, phone, NIC..."
            className="w-full bg-elevated text-fg text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-line-strong focus:border-[#f6b100] focus:outline-none transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-app border border-line rounded-2xl overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <p className="text-sm text-fg-dim text-center p-12">Loading employees...</p>
          ) : isError ? (
            <p className="text-sm text-red-400 text-center p-12">
              {apiError(error, "Failed to load employees.")}
            </p>
          ) : filtered.length > 0 ? (
            <Table headers={headers} data={filtered} renderRow={renderRow} />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <MdBadge className="text-4xl text-gray-600 mb-3" />
              <h3 className="text-base font-semibold text-fg-soft">
                {employees.length ? "No matching employees" : "No employee profiles yet"}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                {employees.length
                  ? "Try a different search or status filter."
                  : "Create a profile with the employee's day salary to start tracking attendance and pay."}
              </p>
              {!employees.length && (
                <button
                  onClick={() => setFormEmployee(null)}
                  className="mt-4 bg-[#f6b100] text-black text-xs font-semibold px-4 py-2 rounded-xl hover:bg-yellow-400 transition cursor-pointer"
                >
                  + Add First Employee
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-gray-500 px-1">
        Every day from the join date counts as a working day unless marked as leave (0) or half day (0.5).
        Salary = working days × day salary. Balance = salary earned − withdrawals.
      </p>

      {/* Modals — form is rendered last so it stacks above the details panel */}
      {detailsId && (
        <EmployeeDetailsModal
          employeeId={detailsId}
          initialMonth={month}
          onClose={() => setDetailsId(null)}
          onEdit={(emp) => setFormEmployee(emp)}
        />
      )}
      {formEmployee !== undefined && (
        <EmployeeFormModal employee={formEmployee} onClose={() => setFormEmployee(undefined)} />
      )}
      {deleteTarget && (
        <ConfirmationPopup
          title="Delete employee"
          message={`Delete "${deleteTarget.name}"? Their attendance and withdrawal history will also be removed. To keep the history, edit the profile and mark them inactive instead.`}
          onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminEmployeesView;
