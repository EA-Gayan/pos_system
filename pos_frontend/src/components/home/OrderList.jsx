import { FaCheckDouble, FaCircle, FaLongArrowAltRight } from "react-icons/fa";
import { getAvatarName } from "../../utils";
import { OrderTypes } from "../../enum/orderTypes";

const OrderList = (orderList) => {
  return (
    <div className="divide-y divide-gray-800 border border-gray-800 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between gap-4 p-4 bg-[#1e1e1e]"
        key={orderList._id}
      >
        {/* Left: Avatar + Name/Items */}
        <div className="flex items-center gap-4 min-w-0">
          <button className="bg-[#f6b100] w-12 h-12 text-xl font-bold rounded-full flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#e5a400]">
            {getAvatarName(orderList?.order?.orderId || "N/A")}
          </button>
          <div className="flex flex-col">
            <h1 className="text-white text-base font-semibold leading-tight truncate max-w-[100px]">
              {orderList?.order?.orderId || "N/A"}
            </h1>
            <p className="text-[#ababab] text-sm leading-tight">
              {orderList?.order?.items?.length || 0} Items
            </p>
          </div>
        </div>

        {/* Center: Table Badge */}
        <div className="flex items-center min-w-[110px] justify-center">
          <span className="text-[#f6b100] font-semibold border border-[#f6b100] rounded-lg px-3 py-1 flex items-center whitespace-nowrap text-sm">
            Table <FaLongArrowAltRight className="mx-2 text-[#ababab]" />
            {orderList?.table?.tableNo || "N/A"}
          </span>
        </div>

        {/* Right: Status Badge */}
        <div className="flex items-center min-w-[110px] justify-end">
          {orderList?.order?.orderStatus === OrderTypes.COMPLETE ? (
            <span className="text-green-500 bg-[#2e4a40] px-3 py-1 rounded-lg text-sm font-medium flex items-center">
              <FaCheckDouble className="mr-1" />
              Complete
            </span>
          ) : (
            <span className="text-yellow-500 bg-[#4a452e] px-3 py-1 rounded-lg text-sm font-medium flex items-center">
              <FaCircle className="mr-1" />
              In Progress
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderList;
