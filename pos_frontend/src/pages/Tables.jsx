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
    refetchOnWindowFocus: true,
    staleTime: 0,
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
        // future improvements
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
    <section className="bg-gradient-to-br from-surface via-base to-elevated h-full flex flex-col min-h-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-10 py-4 sm:py-6 bg-bar shadow-lg border-b border-bar-line gap-3 shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <BackButton />
          <h1 className="text-fg text-xl sm:text-3xl font-bold tracking-wider">
            Tables
          </h1>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto sm:overflow-visible overflow-y-hidden scrollbar-none py-1">
          <button
            onClick={() => setStatus("all")}
            className={`flex-1 sm:flex-none text-xs sm:text-sm font-semibold px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
              status === "all"
                ? "bg-gradient-to-r from-[#f6b100] to-[#e5a400] text-[#1a1a1a] shadow-lg font-bold"
                : "bg-muted text-fg hover:bg-strong"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatus("booked")}
            className={`flex-1 sm:flex-none text-xs sm:text-sm font-semibold px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
              status === "booked"
                ? "bg-gradient-to-r from-[#f6b100] to-[#e5a400] text-[#1a1a1a] shadow-lg font-bold"
                : "bg-muted text-fg hover:bg-strong"
            }`}
          >
            Booked
          </button>
          <button
            onClick={() => setStatus("available")}
            className={`flex-1 sm:flex-none text-xs sm:text-sm font-semibold px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
              status === "available"
                ? "bg-gradient-to-r from-[#f6b100] to-[#e5a400] text-[#1a1a1a] shadow-lg font-bold"
                : "bg-muted text-fg hover:bg-strong"
            }`}
          >
            Available
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 p-3 sm:p-6 pb-28">
          {filteredTables.map((table) => (
            <TableCard
              key={table._id}
              id={table._id}
              status={table.status}
              name={table.tableNo}
              initials={table.initial}
              seats={table.noOfSeats}
              draftTotal={table.draftTotal}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Tables;
