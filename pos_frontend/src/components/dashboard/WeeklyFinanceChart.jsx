import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getWeeklyData } from "../../https";
import FullScreenLoader from "../shared/FullScreenLoader";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { FaArrowTrendUp } from "react-icons/fa6";

const WeeklyFinanceChart = () => {
  const {
    data: resData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["weeklyOrders"],
    queryFn: getWeeklyData,
    keepPreviousData: true,
    onError: () => {
      enqueueSnackbar("Failed to fetch weekly financial data", {
        variant: "error",
      });
    },
  });

  const rawData = resData?.data?.data || [];

  // Format and enrich chart items
  const chartData = useMemo(() => {
    return rawData.map((item) => {
      let displayLabel = item.dayLabel;
      if (!displayLabel && item.date) {
        // Fallback if backend returned only raw date
        try {
          const [y, m, d] = item.date.split("-").map(Number);
          const dt = new Date(y, m - 1, d);
          const dayName = dt.toLocaleDateString("en-US", { weekday: "short" });
          displayLabel = `${dayName} (${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")})`;
        } catch {
          displayLabel = item.date;
        }
      }

      return {
        ...item,
        displayLabel: displayLabel || item.date,
        income: Number(item.income || 0),
        expenses: Number(item.expenses || 0),
      };
    });
  }, [rawData]);

  // Aggregate week totals
  const weekSummary = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    let bestDay = { label: "N/A", income: 0 };

    chartData.forEach((d) => {
      totalIncome += d.income;
      totalExpenses += d.expenses;
      if (d.income > bestDay.income) {
        bestDay = { label: d.displayLabel, income: d.income };
      }
    });

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      bestDay,
    };
  }, [chartData]);

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const dataItem = payload[0]?.payload || {};
    const inc = dataItem.income || 0;
    const exp = dataItem.expenses || 0;
    const net = inc - exp;

    return (
      <div className="bg-[#1f1f1f] border border-[#383838] p-3 rounded-xl shadow-2xl text-xs min-w-[190px]">
        <div className="border-b border-[#2d2d2d] pb-2 mb-2">
          <p className="font-bold text-white text-sm">{label}</p>
          {dataItem.date && (
            <p className="text-[11px] text-gray-400">{dataItem.date}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Revenue:
            </span>
            <span className="font-bold text-emerald-400">
              Rs. {inc.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-red-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Expenses:
            </span>
            <span className="font-bold text-red-400">
              Rs. {exp.toLocaleString()}
            </span>
          </div>
          <div className="border-t border-[#2d2d2d] pt-1.5 mt-1.5 flex items-center justify-between gap-4">
            <span className="text-gray-400 font-medium">Net Profit:</span>
            <span
              className={`font-bold ${
                net >= 0 ? "text-[#f6b100]" : "text-red-400"
              }`}
            >
              Rs. {net.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-[#1b1b1b] border border-[#2a2a2a] rounded-2xl p-4 sm:p-5 shadow-sm">
      {/* Quick Trend Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-[#242424] border border-[#333] rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">
              7-Day Total Revenue
            </p>
            <p className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5">
              Rs. {weekSummary.totalIncome.toLocaleString()}
            </p>
          </div>
          <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FaArrowTrendUp className="text-sm" />
          </span>
        </div>

        <div className="bg-[#242424] border border-[#333] rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">
              7-Day Total Expenses
            </p>
            <p className="text-base sm:text-lg font-bold text-red-400 mt-0.5">
              Rs. {weekSummary.totalExpenses.toLocaleString()}
            </p>
          </div>
          <span className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <RiMoneyDollarCircleLine className="text-sm" />
          </span>
        </div>

        <div className="bg-[#242424] border border-[#333] rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">
              7-Day Net Profit
            </p>
            <p
              className={`text-base sm:text-lg font-bold mt-0.5 ${
                weekSummary.netBalance >= 0 ? "text-[#f6b100]" : "text-red-400"
              }`}
            >
              Rs. {weekSummary.netBalance.toLocaleString()}
            </p>
          </div>
          <span className="text-[11px] font-semibold text-gray-400 bg-[#1c1c1c] px-2 py-1 rounded-md border border-[#303030]">
            Mon - Sun
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <FullScreenLoader />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm">
          <p>No financial data recorded for this week.</p>
        </div>
      ) : (
        <div className="w-full h-[280px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 15, left: 10, bottom: 5 }}
            >
              <CartesianGrid stroke="#2c2c2c" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="displayLabel"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={{ stroke: "#3d3d3d" }}
                tickLine={{ stroke: "#3d3d3d" }}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={{ stroke: "#3d3d3d" }}
                tickLine={{ stroke: "#3d3d3d" }}
                tickFormatter={(val) =>
                  val >= 1000
                    ? `Rs. ${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`
                    : `Rs. ${val}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: "12px", fontSize: "12px" }}
              />
              <Line
                type="monotone"
                name="Revenue / Income"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                activeDot={{
                  r: 7,
                  fill: "#10b981",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
              <Line
                type="monotone"
                name="Expenses"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4, fill: "#ef4444", strokeWidth: 0 }}
                activeDot={{
                  r: 7,
                  fill: "#ef4444",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default WeeklyFinanceChart;
