import { FaCheckDouble, FaCircle, FaLongArrowAltRight } from "react-icons/fa";
import { getAvatarName } from "../../utils";
import { OrderTypes } from "../../enum/orderTypes";

const OrderList = ({ order }) => {
  if (!order) return null;

  const orderId = order.orderId || order._id?.substring?.(0, 8) || "N/A";
  const itemsCount = order.items?.length || 0;
  const totalPayable = order.bills?.totalPayable || order.bills?.total;
  const tableNo = order.table?.tableNo || (typeof order.table === "string" ? order.table : "Takeaway");
  const isComplete = order.orderStatus === OrderTypes.COMPLETE;

  return (
    <div className="bg-elevated/90 hover:bg-muted p-3 sm:p-3.5 rounded-xl border border-line-strong hover:border-line-stronger transition-all duration-200 flex items-center justify-between gap-2 sm:gap-4 shadow-sm group">
      {/* Left: Avatar + Order Details */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#e5a400] to-[#f6b100] text-[#1a1a1a] text-xs sm:text-sm font-bold flex items-center justify-center shrink-0 shadow-md">
          {getAvatarName(orderId)}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="text-fg text-xs sm:text-sm font-bold truncate max-w-[100px] xs:max-w-[130px] sm:max-w-[180px]">
            {orderId}
          </div>
          <div className="text-fg-muted text-[11px] sm:text-xs flex items-center gap-2 mt-0.5">
            <span>{itemsCount} {itemsCount === 1 ? "Item" : "Items"}</span>
            {totalPayable != null && (
              <>
                <span className="text-fg-faint">•</span>
                <span className="text-accent font-semibold">Rs {totalPayable}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Center: Table Badge */}
      <div className="flex items-center justify-center shrink-0">
        <span className="text-accent font-semibold bg-base border border-[#f6b100]/30 rounded-lg px-2.5 py-1 flex items-center whitespace-nowrap text-[11px] sm:text-xs shadow-inner">
          Table <FaLongArrowAltRight className="mx-1 sm:mx-1.5 text-fg-subtle" />
          <span className="font-bold text-fg ml-0.5">{tableNo}</span>
        </span>
      </div>

      {/* Right: Status Badge */}
      <div className="flex items-center justify-end shrink-0">
        {isComplete ? (
          <span className="text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center gap-1 shadow-sm">
            <FaCheckDouble className="text-[10px]" />
            <span className="hidden xs:inline">Completed</span>
          </span>
        ) : (
          <span className="text-accent bg-[#f6b100]/15 border border-[#f6b100]/30 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center gap-1 shadow-sm">
            <FaCircle className="text-[8px] animate-pulse" />
            <span className="hidden xs:inline">In Progress</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default OrderList;
