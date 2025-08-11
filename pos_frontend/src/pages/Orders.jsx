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

  const searchData = useSelector((state) => state.order.searchList);

  const { data: resData, isError } = useQuery({
    queryKey: ["orders", status],
    queryFn: () => getfindOrders({ id: "", status }),
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
    <section className="bg-[#1f1f1f] h-full flex flex-col">
      {/* Header with filter buttons */}
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Orders
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setStatus(OrderTypes.ALL)}
            className={`text-[#ababab] text-lg ${
              status === OrderTypes.ALL ? "bg-[#383838]" : ""
            } rounded-lg px-3 sm:px-5 py-2 font-semibold`}
          >
            All
          </button>
          {/* Other filter buttons */}
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
    </section>
  );
};

export default Orders;
