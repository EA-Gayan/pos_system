// Dates are exchanged with the API as local calendar strings ("YYYY-MM-DD"),
// so a day always means the restaurant's day regardless of server timezone.

const pad = (n) => String(n).padStart(2, "0");

export const toDateStr = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const localToday = () => toDateStr(new Date());

export const currentMonth = () => localToday().slice(0, 7);

export const shiftMonth = (month, delta) => {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

export const monthLabel = (month) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

export const prettyDate = (dateStr) => {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatRs = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

// 22.5 -> "22.5", 22 -> "22"
export const formatDays = (n) => String(Number(n || 0));

export const ATTENDANCE_STYLES = {
  present: {
    label: "Working",
    chip: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    cell: "bg-emerald-500/10 text-emerald-200 border-emerald-500/20",
  },
  "half-day": {
    label: "Half Day",
    chip: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    cell: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  },
  leave: {
    label: "Leave",
    chip: "bg-red-500/15 text-red-300 border-red-500/30",
    cell: "bg-red-500/20 text-red-200 border-red-500/40",
  },
};

export const apiError = (error, fallback) =>
  error?.response?.data?.message || fallback;
