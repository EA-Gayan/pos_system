import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BackButton from "../components/shared/BackButton";
import TableCard from "../components/tables/TableCard";
import { getTables } from "../https";
import { setTable } from "../redux/slices/tableSlice";

const Tables = () => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState("all");
  const [tableData, setTableData] = useState([]);

  const { data: resData, isError } = useQuery({
    queryKey: ["table"],
    queryFn: async () => {
      return await getTables();
    },
    placeholderData: keepPreviousData,
  });

  const currentTableData = useSelector((state) => state.table.tableData);

  const hasStatusChanged = (oldList, newList) => {
    if (!oldList || oldList.length === 0) return true;

    return newList.some((newItem) => {
      const oldItem = oldList.find((item) => item.id === newItem.id);
      return oldItem && oldItem.status !== newItem.status;
    });
  };

  useEffect(() => {
    if (resData) {
      setTableData(resData.data.data);

      if (hasStatusChanged(currentTableData, tableData)) {
        dispatch(setTable(tableData));
      } else {
      }
    }
  }, [resData, dispatch, currentTableData]);

  if (isError) {
    enqueueSnackbar("Something went wrong!", {
      variant: "error",
    });
  }

  const filteredTables =
    status === "all"
      ? tableData
      : tableData.filter((table) => table.status?.toLowerCase() === status);

  return (
    <section className="bg-gradient-to-br from-[#1f1f1f] via-[#1a1a1a] to-[#262626] scroll-auto min-h-[calc(100vh-96px)]">
      <div className="flex items-center justify-between px-10 py-6 bg-[#1a1a1a] shadow-lg">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-3xl font-bold tracking-wider">
            Tables
          </h1>
        </div>
        <div className="flex items-center justify-around gap-3">
          <button
            onClick={() => setStatus("all")}
            className={`text-[#f5f5f5] text-sm font-semibold px-6 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${status === "all" ? "bg-gradient-to-r from-[#f6b100] to-[#e5a400] shadow-lg scale-105" : "bg-[#2a2a2a] hover:bg-[#333]"
              }`}
          >
            All
          </button>
          <button
            onClick={() => setStatus("booked")}
            className={`text-[#f5f5f5] text-sm font-semibold px-6 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${status === "booked" ? "bg-gradient-to-r from-[#f6b100] to-[#e5a400] shadow-lg scale-105" : "bg-[#2a2a2a] hover:bg-[#333]"
              }`}
          >
            Booked
          </button>
          <button
            onClick={() => setStatus("available")}
            className={`text-[#f5f5f5] text-sm font-semibold px-6 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${status === "available" ? "bg-gradient-to-r from-[#f6b100] to-[#e5a400] shadow-lg scale-105" : "bg-[#2a2a2a] hover:bg-[#333]"
              }`}
          >
            Available
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6 pb-20">
        {filteredTables.map((table) => (
          <TableCard
            key={table._id}
            status={table.status}
            name={table.tableNo}
            initials={table.initial}
            seats={table.noOfSeats}
          />
        ))}
      </div>
    </section>
  );
};

export default Tables;
