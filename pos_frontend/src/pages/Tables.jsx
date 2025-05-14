import React, { useEffect, useState } from "react";
import BottomNav from "../components/shared/BottomNav";
import TableCard from "../components/tables/TableCard";
import BackButton from "../components/shared/BackButton";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getTables } from "../https";
import { useDispatch, useSelector } from "react-redux";
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
        console.log("No status change — skipping dispatch");
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
    <section className="bg-[#1f1f1f] scroll-auto min-h-[calc(100vh-96px)]">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Tables
          </h1>
        </div>
        <div className="flex items-center justify-around gap-4">
          <button
            onClick={() => setStatus("all")}
            className={`text-[#ababab] text-lg font-semibold px-5 py-2 rounded-lg ${
              status === "all" ? "bg-[#383838]" : ""
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatus("booked")}
            className={`text-[#ababab] text-lg font-semibold px-5 py-2 rounded-lg ${
              status === "booked" ? "bg-[#383838]" : ""
            }`}
          >
            Booked
          </button>
          <button
            onClick={() => setStatus("available")}
            className={`text-[#ababab] text-lg font-semibold px-5 py-2 rounded-lg ${
              status === "available" ? "bg-[#383838]" : ""
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

      <BottomNav />
    </section>
  );
};

export default Tables;
