import React, { useMemo, useState } from "react";
import { FaEdit, FaPlus, FaSearch, FaTrash } from "react-icons/fa";
import { MdTableBar } from "react-icons/md";
import Table from "../shared/Table";

const AdminTablesView = ({
  tables = [],
  isLoading,
  onOpenAddModal,
  onOpenEditModal,
  onRequestDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const tableNoStr = (table.tableNo || "").toString().toLowerCase();
      const seatsStr = (table.noOfSeats || "").toString().toLowerCase();
      const term = searchTerm.toLowerCase();

      return (
        tableNoStr.includes(term) ||
        seatsStr.includes(term) ||
        `table ${tableNoStr}`.includes(term)
      );
    });
  }, [tables, searchTerm]);

  const headers = ["Table Number", "Seating Capacity", "Actions"];

  const renderRow = (row, index) => {
    return (
      <tr
        key={row._id || index}
        className="border-b border-[#333] hover:bg-[#252525] transition-colors duration-150"
      >
        <td className="p-4 font-semibold text-white">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-[#2a2a2a] text-[#f6b100]">
              <MdTableBar className="text-xl" />
            </span>
            <div>
              <span className="text-base font-bold text-white">
                Table {row.tableNo}
              </span>
              <p className="text-[11px] text-gray-400">Dine-in Station</p>
            </div>
          </div>
        </td>
        <td className="p-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#262626] text-purple-300 border border-purple-500/20">
            <span>{row.noOfSeats} {row.noOfSeats === 1 ? "Seat" : "Seats"}</span>
          </span>
        </td>
        <td className="p-4">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => onOpenEditModal("Table", row)}
              className="p-2 rounded-lg text-blue-400 bg-blue-500/10 hover:bg-blue-500/25 transition cursor-pointer"
              title="Edit Table"
            >
              <FaEdit className="text-sm" />
            </button>
            <button
              onClick={() => onRequestDelete("table", row._id, `Table ${row.tableNo}`)}
              className="p-2 rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/25 transition cursor-pointer"
              title="Delete Table"
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
      {/* Top Banner & Actions */}
      <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
              Dining Tables Management
            </h2>
            <span className="bg-[#f6b100]/20 text-[#f6b100] border border-[#f6b100]/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {tables.length} Total Tables
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Configure dining tables and seating capacity for dine-in orders and waiter assignments.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => onOpenAddModal("Table")}
            className="flex items-center gap-2 bg-[#f6b100] hover:bg-yellow-400 text-black font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-yellow-500/20 cursor-pointer shrink-0"
          >
            <FaPlus className="text-xs" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="text-xs text-gray-400 font-medium">
          Showing <span className="text-[#f6b100] font-semibold">{filteredTables.length}</span> table(s)
        </div>

        <div className="relative w-full sm:w-72">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search table number or seats..."
            className="w-full bg-[#242424] text-white text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-[#383838] focus:border-[#f6b100] focus:outline-none transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          {filteredTables.length > 0 ? (
            <Table
              headers={headers}
              data={filteredTables}
              renderRow={renderRow}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
              <MdTableBar className="text-4xl text-gray-600 mb-3" />
              <h3 className="text-base font-semibold text-gray-300">
                {searchTerm ? "No matching tables found" : "No tables created yet"}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                {searchTerm
                  ? `No tables match "${searchTerm}".`
                  : "Add your restaurant tables so waiters and cashiers can assign customer orders."}
              </p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-3 text-xs text-[#f6b100] hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              ) : (
                <button
                  onClick={() => onOpenAddModal("Table")}
                  className="mt-4 bg-[#f6b100] text-black text-xs font-semibold px-4 py-2 rounded-xl hover:bg-yellow-400 transition cursor-pointer"
                >
                  + Add First Table
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTablesView;

