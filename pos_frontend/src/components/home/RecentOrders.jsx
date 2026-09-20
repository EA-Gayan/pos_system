import { useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronRight, FaReceipt } from "react-icons/fa";
import OrderList from "./OrderList";
import { OrderTypes } from "../../enum/orderTypes";

const RecentOrders = ({ orders = [] }) => {
  const [filter, setFilter] = useState("all"); // "all" | "inprogress" | "completed"

  const filteredOrders = orders.filter((order) => {
    if (filter === "inprogress") return order.orderStatus === OrderTypes.INPROGRESS;
    if (filter === "completed") return order.orderStatus === OrderTypes.COMPLETE;
    return true;
  });

  return (
    <div className="bg-[#1f1f1f] rounded-2xl border border-[#2c2c2c] p-4 sm:p-5 shadow-xl flex-1 flex flex-col min-h-0">
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 bg-[#f6b100] rounded-full" />
          <h2 className="text-[#f5f5f5] text-base sm:text-lg font-bold tracking-wide">
            Recent Orders
          </h2>
          <span className="bg-[#2a2a2a] text-[#f6b100] text-xs font-bold px-2 py-0.5 rounded-full border border-[#f6b100]/20">
            {orders.length}
          </span>
        </div>

        <Link
          to="/orders"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#f6b100] hover:text-[#ffd24d] bg-[#f6b100]/10 hover:bg-[#f6b100]/20 border border-[#f6b100]/30 px-3 py-1.5 rounded-xl transition-all"
        >
          <span>View all</span>
          <FaChevronRight className="text-[10px]" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mt-3 pb-1 overflow-x-auto sm:overflow-visible overflow-y-hidden scrollbar-none">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            filter === "all"
              ? "bg-[#f6b100] text-[#1a1a1a] shadow-sm font-bold"
              : "bg-[#262626] text-[#a0a0a0] hover:text-white"
          }`}
        >
          All ({orders.length})
        </button>
        <button
          onClick={() => setFilter("inprogress")}
          className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            filter === "inprogress"
              ? "bg-[#f6b100] text-[#1a1a1a] shadow-sm font-bold"
              : "bg-[#262626] text-[#a0a0a0] hover:text-white"
          }`}
        >
          In Progress ({orders.filter((o) => o.orderStatus === OrderTypes.INPROGRESS).length})
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            filter === "completed"
              ? "bg-[#f6b100] text-[#1a1a1a] shadow-sm font-bold"
              : "bg-[#262626] text-[#a0a0a0] hover:text-white"
          }`}
        >
          Completed ({orders.filter((o) => o.orderStatus === OrderTypes.COMPLETE).length})
        </button>
      </div>

      {/* Order List / Items */}
      <div className="mt-3 flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1 max-h-[380px] sm:max-h-[460px]">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderList key={order._id || order.orderId} order={order} />
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#262626] border border-[#333] flex items-center justify-center text-[#666] mb-3">
              <FaReceipt className="text-xl" />
            </div>
            <p className="text-white text-sm font-semibold">No orders found</p>
            <p className="text-[#777] text-xs mt-1">
              {filter !== "all"
                ? `No orders matching "${filter}" status`
                : "Recent orders will show up here as customers order"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentOrders;
