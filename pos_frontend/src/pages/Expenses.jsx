import { useQuery, useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import BackButton from "../components/shared/BackButton";
import CommonTable from "../components/shared/CommonTable";
import { getExpenseRecords, deleteExpenseRecord } from "../https";
import { useState } from "react";
import Modal from "../components/shared/Modal";
import { useSelector } from "react-redux";

const Expenses = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [rowData, setRowData] = useState(null);

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

  return (
    <div className="flex flex-col h-full bg-[#262626]">
      <div className="flex-none px-4 sm:px-10 py-4 flex items-center justify-between">
        <BackButton />
        <button
          onClick={() => {
            setModalOpen(true), setRowData(null);
          }}
          className="bg-[#f6B100] text-[#1a1a1a] font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400"
        >
          Add Expense
        </button>
      </div>

      <div className="flex-1 overflow-hidden px-4 sm:px-10 pb-4">
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
