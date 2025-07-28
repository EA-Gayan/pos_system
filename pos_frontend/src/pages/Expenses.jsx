import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import BackButton from "../components/shared/BackButton";
import CommonTable from "../components/shared/CommonTable";
import { getExpenseRecords } from "../https";
import { useState } from "react";
import Modal from "../components/shared/Modal";

const Expenses = () => {
  const [modalOpen, setModalOpen] = useState(false);

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

  const records = recordsData?.data?.data ?? [];

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

  const handleEdit = (row) => {
    console.log("Edit clicked:", row);
  };

  const handleDelete = (row) => {
    console.log("Delete clicked:", row);
  };

  return (
    <div className="flex flex-col h-full bg-[#262626]">
      <div className="flex-none px-4 sm:px-10 py-4 flex items-center justify-between">
        <BackButton />
        <button
          onClick={() => setModalOpen(true)}
          className="bg-[#f6B100] text-[#1a1a1a] font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400"
        >
          Add Expense
        </button>
      </div>

      <div className="flex-1 overflow-hidden px-4 sm:px-10 pb-4">
        <CommonTable
          data={records}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={isFetching}
        />
      </div>

      {/* Modal for adding expense */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Expense"
        onRecordAdded={() => {
          refetch(); // Refetch data after new record added
        }}
      />
    </div>
  );
};

export default Expenses;
