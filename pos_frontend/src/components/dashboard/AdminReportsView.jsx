import React from "react";
import {
  FaCalendarDay,
  FaCalendarWeek,
  FaDownload,
  FaFileExcel,
  FaSpinner,
} from "react-icons/fa";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import WeeklyFinanceChart from "./WeeklyFinanceChart";

const AdminReportsView = ({
  onExportIncome,
  onExportExpense,
  isExportingIncome = false,
  isExportingExpense = false,
  earnings = 0,
  expenses = 0,
  ordersCount = 0,
}) => {
  const netProfit = Number(earnings || 0) - Number(expenses || 0);

  return (
    <div className="flex flex-col space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#2a2a2a] text-[#f6b100]">
              <HiOutlineDocumentReport className="text-xl" />
            </span>
            <h1 className="text-lg sm:text-2xl font-bold text-white tracking-wide">
              Reports & Downloads
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Download financial records in Excel (.xlsx) format and review weekly performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#262626] text-gray-300 border border-[#383838]">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Excel Export Ready
          </span>
        </div>
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-4">
          <p className="text-xs text-gray-400 font-medium">Today's Gross Sales</p>
          <p className="text-2xl font-bold text-[#025cca] mt-1">
            Rs. {Number(earnings || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">From {ordersCount} processed orders</p>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-4">
          <p className="text-xs text-gray-400 font-medium">Today's Recorded Expenses</p>
          <p className="text-2xl font-bold text-[#02ca3a] mt-1">
            Rs. {Number(expenses || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Operational & purchase costs</p>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-4">
          <p className="text-xs text-gray-400 font-medium">Today's Net Balance</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              netProfit >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            Rs. {netProfit.toLocaleString()}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Gross sales minus expenses</p>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-4">
          <p className="text-xs text-gray-400 font-medium">Completed Orders</p>
          <p className="text-2xl font-bold text-[#f6b100] mt-1">{ordersCount}</p>
          <p className="text-[11px] text-gray-500 mt-1">Total orders billed today</p>
        </div>
      </div>

      {/* Export & Download Cards Grid */}
      <div>
        <h2 className="font-bold text-white text-base sm:text-lg tracking-wide mb-3">
          Download Reports
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Income Records Export Card */}
          <div className="bg-[#1a1a1a] border border-[#2d2d2d] hover:border-emerald-500/40 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 shadow-md">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <FaFileExcel className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base sm:text-lg">
                      Income / Sales Report
                    </h3>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      Excel Spreadsheet (.xlsx)
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mt-2 mb-6">
                Export complete order records including receipt numbers, order types, customer details, payment breakdowns, and gross revenues.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-4 border-t border-[#2a2a2a]">
              <button
                disabled={isExportingIncome}
                onClick={() => onExportIncome("today")}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
              >
                {isExportingIncome ? (
                  <FaSpinner className="animate-spin text-sm" />
                ) : (
                  <FaCalendarDay className="text-sm" />
                )}
                <span>Download Today's Income</span>
              </button>

              <button
                disabled={isExportingIncome}
                onClick={() => onExportIncome("week")}
                className="flex-1 flex items-center justify-center gap-2 bg-[#262626] hover:bg-[#333] hover:text-[#f6b100] text-gray-200 border border-[#383838] font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                {isExportingIncome ? (
                  <FaSpinner className="animate-spin text-sm" />
                ) : (
                  <FaCalendarWeek className="text-sm text-[#f6b100]" />
                )}
                <span>Download This Week's</span>
              </button>
            </div>
          </div>

          {/* Expense Records Export Card */}
          <div className="bg-[#1a1a1a] border border-[#2d2d2d] hover:border-amber-500/40 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 shadow-md">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <FaFileExcel className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base sm:text-lg">
                      Expense Records Report
                    </h3>
                    <span className="text-[11px] text-amber-400 font-medium">
                      Excel Spreadsheet (.xlsx)
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mt-2 mb-6">
                Export operational restaurant expenditures, inventory purchases, billings, notes, and categorized daily expense entries.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-4 border-t border-[#2a2a2a]">
              <button
                disabled={isExportingExpense}
                onClick={() => onExportExpense("today")}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
              >
                {isExportingExpense ? (
                  <FaSpinner className="animate-spin text-sm" />
                ) : (
                  <FaCalendarDay className="text-sm" />
                )}
                <span>Download Today's Expenses</span>
              </button>

              <button
                disabled={isExportingExpense}
                onClick={() => onExportExpense("week")}
                className="flex-1 flex items-center justify-center gap-2 bg-[#262626] hover:bg-[#333] hover:text-[#f6b100] text-gray-200 border border-[#383838] font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                {isExportingExpense ? (
                  <FaSpinner className="animate-spin text-sm" />
                ) : (
                  <FaCalendarWeek className="text-sm text-[#f6b100]" />
                )}
                <span>Download This Week's</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Visual Trends Chart */}
      <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="font-bold text-white text-base sm:text-lg tracking-wide">
            Weekly Financial Trend Analysis
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Graphical comparison of daily revenue (green) vs. expenses (red) for the current week.
          </p>
        </div>

        <WeeklyFinanceChart />
      </div>
    </div>
  );
};

export default AdminReportsView;

