import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useState, useEffect } from "react";
import OrderCard from "../components/orders/OrderCard";
import BackButton from "../components/shared/BackButton";
import { getfindOrders } from "../https";
import { OrderTypes } from "../enum/orderTypes";
import { useSelector } from "react-redux";

const Orders = () => {
  const [status, setStatus] = useState(OrderTypes.ALL);
  const [currentPage, setCurrentPage] = useState(1);

  const searchData = useSelector((state) => state.order.searchList);

  const { data: resData, isError } = useQuery({
    queryKey: ["orders", status, currentPage],
    queryFn: () => getfindOrders({ id: "", status, page: currentPage, limit: 9, date: "today" }),
    keepPreviousData: true,
  });

  useEffect(() => {
    if (isError) {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
    }
  }, [isError]);

  const displayOrders =
    searchData && Object.keys(searchData).length > 0
      ? Array.isArray(searchData)
        ? searchData
        : [searchData]
      : resData?.data?.data || [];

  return (
    <section className="bg-gradient-to-br from-[#1f1f1f] via-[#1a1a1a] to-[#262626] h-full flex flex-col">
      {/* Header with filter buttons */}
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-10 py-6 bg-[#1a1a1a] shadow-lg">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-3xl font-bold tracking-wider">
            Orders
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStatus(OrderTypes.ALL)}
            className={`text-[#f5f5f5] text-sm rounded-lg px-6 py-2.5 font-semibold cursor-pointer transition-all duration-200 ${status === OrderTypes.ALL ? "bg-gradient-to-r from-[#f6b100] to-[#e5a400] shadow-lg scale-105" : "bg-[#2a2a2a] hover:bg-[#333]"
              }`}
          >
            All
          </button>
          <button
            onClick={() => setStatus(OrderTypes.INPROGRESS)}
            className={`text-[#f5f5f5] text-sm rounded-lg px-6 py-2.5 font-semibold cursor-pointer transition-all duration-200 ${status === OrderTypes.INPROGRESS ? "bg-gradient-to-r from-[#f6b100] to-[#e5a400] shadow-lg scale-105" : "bg-[#2a2a2a] hover:bg-[#333]"
              }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatus(OrderTypes.COMPLETE)}
            className={`text-[#f5f5f5] text-sm rounded-lg px-6 py-2.5 font-semibold cursor-pointer transition-all duration-200 ${status === OrderTypes.COMPLETE ? "bg-gradient-to-r from-[#f6b100] to-[#e5a400] shadow-lg scale-105" : "bg-[#2a2a2a] hover:bg-[#333]"
              }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-8">
          {displayOrders?.length > 0 ? (
            displayOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))
          ) : (
            <div className="col-span-3 flex items-center justify-center h-full">
              <p className="text-gray-500">No orders available</p>
            </div>
          )}
        </div>
      </div>
      {/* Pagination Controls */}
      {resData?.data?.pagination && (
        <div className="pt-4 pb-8 px-4 bg-[#1a1a1a] border-t border-[#333] flex items-center justify-center gap-4 shrink-0">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${currentPage === 1
              ? "bg-[#2a2a2a] text-gray-500 cursor-not-allowed"
              : "bg-[#2a2a2a] text-[#f5f5f5] hover:bg-[#333]"
              }`}
          >
            Previous
          </button>
          <span className="text-[#f5f5f5] text-sm font-medium">
            Page {currentPage} of {resData.data.pagination.totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage((prev) =>
              Math.min(prev + 1, resData.data.pagination.totalPages || 1)
            )}
            disabled={
              !resData.data.pagination.totalPages ||
              currentPage === resData.data.pagination.totalPages
            }
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${!resData.data.pagination.totalPages ||
              currentPage === resData.data.pagination.totalPages
              ? "bg-[#2a2a2a] text-gray-500 cursor-not-allowed"
              : "bg-[#2a2a2a] text-[#f5f5f5] hover:bg-[#333]"
              }`}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default Orders;
