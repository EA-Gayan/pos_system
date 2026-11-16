import React from "react";
import { useNavigate } from "react-router-dom";
import { FaFire, FaTrophy, FaUtensils } from "react-icons/fa";
import { MdTableBar } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";

const PopularDishes = ({ products = [], isLoading = false }) => {
  const navigate = useNavigate();

  // Top 5 dishes
  const topProducts = (products || []).slice(0, 6);

  const getRankBadge = (index) => {
    switch (index) {
      case 0:
        return (
          <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#e5a400] to-[#f6b100] text-[#1a1a1a] text-xs font-black flex items-center justify-center shadow-md">
            1
          </span>
        );
      case 1:
        return (
          <span className="w-6 h-6 rounded-full bg-slate-300 text-[#1a1a1a] text-xs font-black flex items-center justify-center shadow-md">
            2
          </span>
        );
      case 2:
        return (
          <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-black flex items-center justify-center shadow-md">
            3
          </span>
        );
      default:
        return (
          <span className="w-6 h-6 rounded-full bg-muted text-fg-subtle text-xs font-bold flex items-center justify-center border border-line-strong">
            {index + 1}
          </span>
        );
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-line p-4 sm:p-5 shadow-xl flex flex-col justify-between h-full min-h-0">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 bg-[#f6b100] rounded-full" />
            <h2 className="text-fg text-base sm:text-lg font-bold tracking-wide flex items-center gap-2">
              <span>Top Dishes</span>
              <FaFire className="text-accent text-sm animate-pulse" />
            </h2>
          </div>
          <span className="text-[11px] text-fg-muted font-medium bg-elevated px-2.5 py-1 rounded-full border border-line-strong">
            Today
          </span>
        </div>

        {/* List of Top Selling Dishes */}
        <div className="mt-3 space-y-2.5 overflow-y-auto max-h-[300px] sm:max-h-[340px] pr-1">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-fg-subtle">Loading best sellers...</div>
          ) : topProducts.length > 0 ? (
            topProducts.map((dish, index) => (
              <div
                key={`${dish.productName || dish.name}-${index}`}
                className="bg-elevated/90 hover:bg-muted p-3 rounded-xl border border-line-strong hover:border-line-stronger transition-all flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getRankBadge(index)}
                  <div className="min-w-0">
                    <p className="text-fg text-xs sm:text-sm font-bold truncate">
                      {dish.productName || dish.name}
                    </p>
                    <p className="text-[11px] text-fg-subtle mt-0.5">
                      {dish.sellingQty || dish.orders || 0} sold
                      {dish.productPrice != null && ` • Rs ${dish.productPrice}`}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-extrabold text-accent">
                    Rs {dish.income != null ? dish.income : (dish.productPrice * dish.sellingQty) || 0}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-elevated border border-line-strong flex items-center justify-center text-fg-faint mb-2">
                <FaUtensils className="text-lg" />
              </div>
              <p className="text-fg text-xs sm:text-sm font-semibold">No sales recorded yet</p>
              <p className="text-fg-subtle text-[11px] mt-0.5">Dishes sold today will rank here</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Quick Actions matching Menu page button aesthetics */}
      <div className="mt-4 pt-4 border-t border-line space-y-2.5">
        <div className="text-[11px] font-semibold text-fg-subtle uppercase tracking-wider mb-2">
          Quick Actions
        </div>

        <button
          onClick={() => navigate("/menu")}
          className="w-full bg-gradient-to-r from-[#f6b100] to-[#e0a100] hover:from-[#ffd24d] hover:to-[#f6b100] text-[#1a1a1a] font-extrabold py-3 px-4 rounded-xl shadow-lg hover:shadow-yellow-500/20 flex items-center justify-center gap-2 text-sm cursor-pointer transition-all active:scale-98"
        >
          <BiSolidDish className="text-xl" />
          <span>Open Menu / New Order</span>
        </button>

        <button
          onClick={() => navigate("/tables")}
          className="w-full bg-elevated hover:bg-muted text-fg hover:text-accent border border-line-strong font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer transition-all active:scale-98"
        >
          <MdTableBar className="text-lg" />
          <span>View Table Layout</span>
        </button>
      </div>
    </div>
  );
};

export default PopularDishes;
