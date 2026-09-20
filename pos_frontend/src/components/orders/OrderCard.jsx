import { useState } from "react";
import { FaCheckDouble, FaCircle } from "react-icons/fa";
import { OrderTypes } from "../../enum/orderTypes";
import { formatDateAndTime, getAvatarName } from "../../utils";
import Invoice from "../invoice/invoice";

const OrderCard = ({ order }) => {
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);

  const handleorderclick = () => {
    setOrderInfo(order);
    setShowInvoice(true);
  };

  return (
    <>
      <div
        className="w-full bg-gradient-to-br from-[#262626] to-[#1f1f1f] p-3.5 sm:p-5 rounded-xl mb-3 sm:mb-4 mx-auto shadow-lg hover:shadow-2xl hover:scale-102 active:scale-98 transition-all duration-300 cursor-pointer border border-[#333]"
        onClick={handleorderclick}
      >
        <div className="flex items-center gap-3 sm:gap-5">
          <button className="bg-gradient-to-br from-[#f6b100] to-[#e5a400] p-2.5 sm:p-3 text-base sm:text-xl font-bold rounded-xl cursor-pointer hover:scale-105 transition-transform duration-200 shadow-md shrink-0">
            {getAvatarName(order?.customerDetails?.name ?? "N/A")}
          </button>
          <div className="flex items-center justify-between w-full min-w-0">
            <div className="flex flex-col items-start gap-0.5 sm:gap-1 min-w-0 pr-2">
              <h1 className="text-[#f5f5f5] text-sm sm:text-lg font-semibold tracking-wide truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none">
                {order?.customerDetails?.name ?? "N/A"}
              </h1>
              <p className="text-[#ababab] text-xs sm:text-sm truncate">#{order?.orderId}</p>
            </div>
            <div className="flex flex-col items-end gap-1 sm:gap-2 shrink-0">
              {order?.orderStatus === OrderTypes.COMPLETE ? (
                <>
                  <p className="text-green-400 bg-green-500/20 px-2 sm:px-3 py-1 rounded-lg font-semibold text-xs sm:text-sm">
                    <FaCheckDouble className="inline" />
                  </p>
                  <p className="text-[#ababab] text-[11px] sm:text-sm">
                    <FaCircle className="inline mr-1 text-green-400 text-[9px] sm:text-xs" /> Order Delivered
                  </p>
                </>
              ) : (
                <>
                  <p className="text-yellow-400 bg-yellow-500/20 px-2 sm:px-3 py-1 rounded-lg font-semibold text-xs sm:text-sm">
                    <FaCircle className="inline text-[9px]" />
                  </p>
                  <p className="text-[#ababab] text-[11px] sm:text-sm">
                    <FaCircle className="inline mr-1 text-yellow-400 text-[9px] sm:text-xs" /> In Progress
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-3 sm:mt-4 text-[#ababab] text-xs sm:text-sm">
          <p>{formatDateAndTime(order?.createdAt)}</p>
          <p>{order?.items?.length} Items</p>
        </div>
        <hr className="w-full mt-3 sm:mt-4 border-t border-[#333]" />
        <div className="flex items-center justify-between mt-3 sm:mt-4">
          <h1 className="text-[#f5f5f5] text-sm sm:text-lg font-semibold">Total</h1>
          <p className="text-[#f6b100] text-sm sm:text-lg font-bold">
            Rs {order?.bills?.totalPayable?.toFixed(2)}
          </p>
        </div>
      </div>
      {showInvoice && (
        <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}
    </>
  );
};

export default OrderCard;
