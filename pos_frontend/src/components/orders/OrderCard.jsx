import { FaCheckDouble, FaCircle, FaLongArrowAltRight } from "react-icons/fa";
import { formatDateAndTime, getAvatarName } from "../../utils";
import { OrderTypes } from "../../enum/orderTypes";

const OrderCard = ({ order }) => {
  return (
    <div className="w-full bg-[#262626] p-4 rounded-lg mb-4 mx-auto">
      <div className="flex items-center gap-5">
        <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">
          {getAvatarName(order?.customerDetails?.name ?? "N/A")}
        </button>
        <div className="flex items-center justify-between w-[100%]">
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
              {order?.customerDetails?.name ?? "N/A"}
            </h1>
            <p className="text-[#ababab] text-sm">#{order?.orderId}</p>
            {/* <p className="text-[#ababab] text-sm">
              Table{" "}
              <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" />{" "}
              {order?.table?.tableNo ?? "N/A"}
            </p> */}
          </div>
          <div className="flex flex-col items-end gap-2">
            {order?.orderStatus === OrderTypes.COMPLETE ? (
              <>
                <p className="text-green-600 bg-[#2e4a40] px-2 py-1 rounded-lg">
                  <FaCheckDouble className="inline" />
                </p>
                <p className="text-[#ababab] text-sm">
                  <FaCircle className="inline mr-2 text-green-600" /> Order
                  Delivered
                </p>
              </>
            ) : (
              <>
                <p className="text-yellow-600 bg-[#4a452e] px-2 py-1 rounded-lg">
                  <FaCircle className="inline" />
                </p>
                <p className="text-[#ababab] text-sm">
                  <FaCircle className="inline mr-2 text-yellow-600" /> Still
                  Inprogress
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 text-[#ababab]">
        <p>{formatDateAndTime(order?.createdAt)}</p>
        <p>{order?.items?.length} Items</p>
      </div>
      <hr className="w-full mt-4 border-t-1 border-gray-500" />
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-[#f5f5f5] text-lg font-semibold">Total</h1>
        <p className="text-[#f5f5f5] text-lg font-semibold">
          Rs {order?.bills?.totalPayable?.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default OrderCard;
