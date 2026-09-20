import { useQuery, useMutation } from "@tanstack/react-query";
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

const Expenses = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);

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

  const deleteRecordMutation = useMutation({
    mutationFn: (recordId) => deleteExpenseRecord(recordId),
    onSuccess: () => {
      enqueueSnackbar("Record deleted successfully!", { variant: "success" });
      refetch();
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
      label: "Description",
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

  const handleDelete = (row) => {
    deleteRecordMutation.mutate(row._id);
  };

  const handleExport = (type) => {
    setExportOpen(false);
    exportRecordMutation.mutate(type);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gradient-to-br from-[#262626] via-[#1f1f1f] to-[#1a1a1a] min-h-0">
      <div className="flex-none px-3 sm:px-10 py-3.5 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between bg-[#1a1a1a] shadow-lg gap-3">
        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3">
          <BackButton />
          <h1 className="sm:hidden text-lg font-bold text-white">Expenses</h1>
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
              <div className="absolute right-0 mt-2 w-36 sm:w-40 bg-[#1f1f1f] border border-[#333] rounded-md shadow-2xl z-20">
                <button
                  onClick={() => handleExport("today")}
                  className="block w-full px-4 py-2 text-left text-xs sm:text-sm text-white hover:bg-gray-700 cursor-pointer"
                >
                  Today
                </button>
                <button
                  onClick={() => handleExport("week")}
                  className="block w-full px-4 py-2 text-left text-xs sm:text-sm text-white hover:bg-gray-700 cursor-pointer"
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
            refetch();
            handleCloseModal();
          }}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Expenses;
