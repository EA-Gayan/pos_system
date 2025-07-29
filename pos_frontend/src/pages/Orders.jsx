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
    <section className="bg-[#1f1f1f]">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Orders
          </h1>
        </div>
        <div className="flex items-center justify-around gap-4">
          <button
            onClick={() => setStatus(OrderTypes.ALL)}
            className={`text-[#ababab] text-lg ${
              status === OrderTypes.ALL ? "bg-[#383838]" : ""
            } rounded-lg px-5 py-2 font-semibold`}
          >
            All
          </button>
          <button
            onClick={() => setStatus(OrderTypes.INPROGRESS)}
            className={`text-[#ababab] text-lg ${
              status === OrderTypes.INPROGRESS ? "bg-[#383838]" : ""
            } rounded-lg px-5 py-2 font-semibold`}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatus(OrderTypes.COMPLETE)}
            className={`text-[#ababab] text-lg ${
              status === OrderTypes.COMPLETE ? "bg-[#383838]" : ""
            } rounded-lg px-5 py-2 font-semibold`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 sm:px-8 lg:px-16 py-4 pb-20 overflow-y-auto">
        {displayOrders?.length > 0 ? (
          displayOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))
        ) : (
          <p className="col-span-3 text-gray-500">No orders available</p>
        )}
      </div>
    </section>
  );
};

export default Orders;
