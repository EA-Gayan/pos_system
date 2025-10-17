import { Link } from "react-router-dom";
import OrderList from "./OrderList";

const RecentOrders = ({ orders }) => {
  return (
    <div className="bg-[#1a1a1a] w-full rounded-lg overflow-hidden px-4 sm:px-6 md:px-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-[#f5f5f5] text-base sm:text-lg font-semibold tracking-wide">
          Recent Orders
        </h1>

        <Link
          to="/orders"
          className="text-[#025cca] text-sm font-semibold hover:underline"
        >
          View all
        </Link>
      </div>

      {/* Optional: Search bar (uncomment if needed) */}
      {/*
        <div className="flex items-center gap-3 bg-[#1f1f1f] rounded-[15px] px-4 py-3 mx-4 sm:mx-6">
          <FaSearch className="text-[#f5f5f5]" />
          <input
            type="text"
            placeholder="Search recent orders"
            className="bg-[#1f1f1f] outline-none text-[#f5f5f5] w-full"
          />
        </div>
        */}

      {/* Order list */}
      <div className="mt-3 max-h-[400px] overflow-y-auto scrollbar-hide">
        {orders?.length > 0 ? (
          orders.map((order) => <OrderList key={order._id} order={order} />)
        ) : (
          <p className="text-gray-500 text-sm">No orders available</p>
        )}
      </div>
    </div>
  );
};

export default RecentOrders;
