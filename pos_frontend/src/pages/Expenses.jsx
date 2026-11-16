import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import BackButton from "../components/shared/BackButton";
import CommonTable from "../components/shared/CommonTable";
import {
  getExpenseRecords,
  deleteExpenseRecord,
  exportExpenseRecord,
} from "../https";
import { useState } from "react";
import Modal from "../components/shared/Modal";
import { useSelector } from "react-redux";
import ConfirmationPopup from "../components/shared/ConfirmationPopup";

const Expenses = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const queryClient = useQueryClient();

  const {
    data: recordsData,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["records"],
    queryFn: getExpenseRecords,
    onError: () => {
      enqueueSnackbar("Failed to fetch records!", { variant: "error" });
    },
  });

  // Employee advances change salary balances shown in the admin panel
  const refreshAll = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["employees"] });
    queryClient.invalidateQueries({ queryKey: ["employee"] });
  };

  const deleteRecordMutation = useMutation({
    mutationFn: (recordId) => deleteExpenseRecord(recordId),
    onSuccess: () => {
      enqueueSnackbar("Record deleted successfully!", { variant: "success" });
      setDeleteTarget(null);
      refreshAll();
    },
    onError: () => {
      enqueueSnackbar("Failed to delete record!", { variant: "error" });
    },
  });

  const exportRecordMutation = useMutation({
    mutationFn: (type) => exportExpenseRecord(type), // should return JSON with fileUrl
    onSuccess: (response) => {
      const fileUrl = response?.data?.fileUrl;
      if (!fileUrl) {
        enqueueSnackbar("Exported but no file URL returned.", {
          variant: "warning",
        });
        return;
      }

      const fullUrl = fileUrl.startsWith("/")
        ? `${import.meta.env.VITE_API_URL}${fileUrl}`
        : fileUrl;

      // Trigger download
      const link = document.createElement("a");
      link.href = fullUrl;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      link.remove();

      enqueueSnackbar("Record exported successfully!", { variant: "success" });
      refetch();
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Unknown error";
      enqueueSnackbar(errorMessage, { variant: "error" });
    },
  });

  const records = recordsData?.data?.data ?? [];
  const searchRecords = useSelector((state) => state.expenses.searchList);

  const displayRecords =
    searchRecords && searchRecords.length > 0 ? searchRecords : records;

  const columns = [
    {
      key: "index",
      label: "No",
      render: (_val, _row, index) => index + 1,
    },
    {
      key: "description",
      label: "Category",
      render: (val, row) => (
        <div className="flex flex-col min-w-0">
          <span className="truncate font-medium">{row.descriptionSi || val}</span>
          {row.descriptionSi && (
            <span className="truncate text-xs text-fg-muted">{val}</span>
          )}
          {row.employee && (
            <span className="mt-1 self-start text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
              Salary deducted
            </span>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (val) => (val != null ? `Rs. ${val}` : "-"),
    },
  ];

  const handleCloseModal = () => {
    setModalOpen(false);
    setRowData(null);
  };

  const handleEdit = (row) => {
    setModalOpen(true);
    setRowData(row);
  };

  const handleDelete = (row) => setDeleteTarget(row);

  const handleExport = (type) => {
    setExportOpen(false);
    exportRecordMutation.mutate(type);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gradient-to-br from-elevated via-surface to-app min-h-0">
      <div className="flex-none px-3 sm:px-10 py-3.5 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between bg-bar shadow-lg border-b border-bar-line gap-3">
        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3">
          <BackButton />
          <h1 className="sm:hidden text-lg font-bold text-fg">Expenses</h1>
        </div>

        {/* Right-side Buttons */}
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end">
          {/* Add Expense Button */}
          <button
            onClick={() => {
              setModalOpen(true);
              setRowData(null);
            }}
            className="flex-1 sm:flex-none bg-gradient-to-r from-[#f6b100] to-[#e5a400] hover:from-[#e5a400] hover:to-[#d49400] text-[#1a1a1a] font-bold text-xs sm:text-sm px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-xl shadow-lg hover:shadow-2xl hover:scale-102 transition-all duration-200 cursor-pointer"
          >
            Add Expense
          </button>

          {/* Export Dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <button
              onClick={() => setExportOpen((prev) => !prev)}
              className="w-full bg-gradient-to-r from-[#f6b100] to-[#e5a400] hover:from-[#e5a400] hover:to-[#d49400] text-[#1a1a1a] font-bold text-xs sm:text-sm px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-xl shadow-lg hover:shadow-2xl hover:scale-102 transition-all duration-200 cursor-pointer"
            >
              Export Expense
            </button>

            {/* Dropdown Menu */}
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-36 sm:w-40 bg-surface border border-line-strong rounded-md shadow-2xl z-20">
                <button
                  onClick={() => handleExport("today")}
                  className="block w-full px-4 py-2 text-left text-xs sm:text-sm text-fg hover:bg-strong cursor-pointer"
                >
                  Today
                </button>
                <button
                  onClick={() => handleExport("week")}
                  className="block w-full px-4 py-2 text-left text-xs sm:text-sm text-fg hover:bg-strong cursor-pointer"
                >
                  This Week
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 px-2 sm:px-10 pb-20 md:pb-4 overflow-y-auto min-h-0">
        <CommonTable
          data={displayRecords}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={isFetching}
        />
      </div>
      {modalOpen && (
        <Modal
          currentData={rowData}
          onRecordAdded={() => {
            refreshAll();
            handleCloseModal();
          }}
          onClose={handleCloseModal}
        />
      )}
      {deleteTarget && (
        <ConfirmationPopup
          title="Delete expense"
          message={
            deleteTarget.employee
              ? `Delete "${deleteTarget.description}"? It will also be removed from the employee's salary deductions.`
              : `Delete "${deleteTarget.descriptionSi || deleteTarget.description}"?`
          }
          onConfirm={() => deleteRecordMutation.mutate(deleteTarget._id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Expenses;
