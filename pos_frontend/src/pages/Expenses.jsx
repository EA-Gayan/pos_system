import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import BackButton from "../components/shared/BackButton";
import CommonTable from "../components/shared/CommonTable";
import { getExpenseRecords } from "../https";

const Expenses = () => {
  const { data: recordsData } = useQuery({
    queryKey: ["recentOrders"],
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
    <div>
      <main className="flex-1 overflow-auto">
        <div className="bg-[#262626] p-4 w-full h-full overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-10 py-4">
            <div className="flex items-center gap-4">
              <BackButton />
            </div>
          </div>
          <div className="h-[calc(100%-80px)]">
            <CommonTable
              data={records}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Expenses;
