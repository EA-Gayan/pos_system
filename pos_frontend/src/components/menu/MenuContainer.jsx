import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { GrRadialSelected } from "react-icons/gr";
import { useDispatch,useSelector } from "react-redux";
import { getCategories } from "../../https";
import { addItems, addCombo } from "../../redux/slices/cartSlice";
import { addTableCartItem, addTableCombo } from "../../redux/slices/tableCartSlice";
import { setProductList } from "../../redux/slices/productSlice";
import ComboModal from "./ComboModal";
import { enqueueSnackbar } from "notistack";

const MenuContainer = ({ isWaiterMode = false }) => {
  const dispatch = useDispatch();

  const [selectedItem, setSelectedItem] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);

  const selectedStatus = parseInt(localStorage.getItem("selectedStatus"), 10);

  const searchData = useSelector((state) => state?.product?.searchList);

  const handleCreateCombo = (comboData) => {
    if (isWaiterMode) {
      dispatch(addTableCombo(comboData));
    } else {
      dispatch(addCombo(comboData));
    }
  };

  const increment = (id) => () => {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decrement = (id) => () => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      return { ...prev, [id]: current > 0 ? current - 1 : 0 };
    });
  };
  const handleAddToCart = (item) => {
    const count = quantities[item._id] || 0;
    if (count === 0) return;

    const { name, price } = item;
    const newObj = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      pricePerQuantity: price,
      quantity: count,
      price: count * price,
    };
    
    if (isWaiterMode) {
      dispatch(addTableCartItem(newObj));
    } else {
      dispatch(addItems(newObj));
    }

    // Reset quantity only for this item
    setQuantities((prev) => ({ ...prev, [item._id]: 0 }));
  };

  const { data: resData, isError } = useQuery({
    queryKey: ["category"],
    queryFn: async () => await getCategories(),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (resData) {
      dispatch(setProductList(resData?.data?.data));
    }
  }, [resData, dispatch]);

  // all categories
  const categories = resData?.data?.data || [];

  const filteredCategories = categories.filter(
    (item) =>
      item.mealType?.includes(selectedStatus) || item.mealType?.includes(4)
  );

  // Custom sort order
  const priorityOrder = [
    "rice and curry",
    "rice and curry b",
    "kottu",
    "fried rice",
    "paratha",
    "string hoppers",
  ];

  filteredCategories.sort((a, b) => {
    const normalize = (name) => name.toLowerCase().replace("&", "and").trim();
    const nameA = normalize(a.name);
    const nameB = normalize(b.name);

    const indexA = priorityOrder.indexOf(nameA);
    const indexB = priorityOrder.indexOf(nameB);

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) {
      return -1;
    }
    if (indexB !== -1) {
      return 1;
    }
    return 0;
  });

  useEffect(() => {
    if (filteredCategories.length && !selectedItem) {
      setSelectedItem(filteredCategories[0]);
    }
    if (isError) {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
    }
  }, [categories, selectedItem, isError, selectedStatus]);

  return (
    <div className="flex flex-col md:flex-row w-full h-full gap-2 sm:gap-4 p-2 sm:p-4 overflow-hidden">
      {/* Categories: Horizontal pills on mobile (< md), vertical sidebar on desktop (md+) */}
      <div className="w-full md:w-44 lg:w-48 xl:w-52 md:h-full flex flex-col bg-[#1f1f1f] rounded-2xl p-2.5 sm:p-3 shadow-xl shrink-0">
        <h2 className="hidden md:block text-base lg:text-lg font-bold text-white mb-2.5 px-1 border-l-4 border-[#f6b100] pl-2.5 sticky top-0 bg-[#1f1f1f] z-20 py-0.5">
          Categories
        </h2>

        {/* Mobile horizontal pill scroll */}
        <div className="flex md:hidden overflow-x-auto gap-2 py-1 scrollbar-none">
          {filteredCategories.map((category) => {
            const isSelected = selectedItem?._id === category._id;
            return (
              <button
                key={category._id}
                onClick={() => setSelectedItem(category)}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer min-h-[40px] flex items-center ${
                  isSelected
                    ? "bg-gradient-to-r from-[#f6b100] to-[#e0a100] text-[#1a1a1a] shadow-md font-extrabold"
                    : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333]"
                }`}
              >
                {category.name} ({category?.products?.length || 0})
              </button>
            );
          })}
        </div>

        {/* Desktop vertical sidebar with touch-friendly scrollbar & larger touch targets */}
        <div className="hidden md:flex flex-col gap-2 sm:gap-2.5 overflow-y-auto pr-1.5 pb-20 touch-scrollbar">
          {filteredCategories.map((category) => {
            const isSelected = selectedItem?._id === category._id;
            return (
              <div
                key={category._id}
                onClick={() => setSelectedItem(category)}
                className={`
                  relative overflow-hidden group cursor-pointer px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.01] active:scale-95 min-h-[52px] flex flex-col justify-center
                  ${isSelected
                    ? "bg-gradient-to-r from-[#f6b100] to-[#e0a100] shadow-lg shadow-[#f6b100]/25 border border-yellow-300/30"
                    : "bg-[#272727] hover:bg-[#303030] border border-[#333]"
                  }
                `}
              >
                <div className="flex items-center justify-between relative z-10 gap-1.5">
                  <h3
                    className={`font-bold text-xs sm:text-sm leading-snug line-clamp-2 break-words ${isSelected ? "text-[#1a1a1a]" : "text-gray-100"}`}
                    title={category.name}
                  >
                    {category.name}
                  </h3>
                  {isSelected && <GrRadialSelected className="text-[#1a1a1a] text-lg shrink-0 ml-1" />}
                </div>
                <p className={`text-[11px] sm:text-xs mt-0.5 font-semibold ${isSelected ? "text-[#1a1a1a]/80" : "text-gray-400"}`}>
                  {category?.products?.length || 0} Items
                </p>

                {/* Decorative background element */}
                <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-10 ${isSelected ? "bg-white" : "bg-white/5"}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content - Products */}
      <div className="w-full flex-1 md:h-full bg-[#1f1f1f] rounded-2xl p-3 sm:p-6 shadow-xl overflow-hidden flex flex-col min-h-0 min-w-0">
        {/* Header Area */}
        {searchData?.length > 0 ? (
          <h2 className="text-lg sm:text-2xl font-bold text-white mb-3 sm:mb-6 flex items-center gap-3">
            <span className="text-[#f6b100]">Search Results</span>
            <span className="text-xs sm:text-sm font-normal text-gray-500 bg-[#2a2a2a] px-3 py-1 rounded-full">
              Found {searchData.length} items
            </span>
          </h2>
        ) : (
          <div className="mb-3 sm:mb-6 pb-2 sm:pb-4 border-b border-[#333] flex items-center justify-between gap-2">
            <h2 className="text-lg sm:text-3xl font-bold text-white tracking-tight truncate">
              {selectedItem?.name || "Select a Category"}
            </h2>
            {!isWaiterMode && (
              <button
                onClick={() => setIsComboModalOpen(true)}
                className="bg-gradient-to-r from-[#f6b100] to-[#e0a100] hover:from-[#e0a100] hover:to-[#f6b100] text-[#1a1a1a] font-bold px-3 sm:px-6 py-1.5 sm:py-3 text-xs sm:text-sm rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer"
              >
                <FaShoppingCart size={15} />
                <span>Create Combo</span>
              </button>
            )}
          </div>
        )}

        {/* Product Grid with touch-friendly scrollbar */}
        <div className="flex-1 overflow-y-auto pr-2 sm:pr-3 touch-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 pb-24 md:pb-12">
            {(searchData?.length > 0 ? searchData : selectedItem?.products || []).map((item) => {
              const qty = quantities[item._id] || 0;
              return (
                <div
                  key={item._id}
                  onClick={() => handleAddToCart(item)}
                  className="group relative bg-[#2a2a2a] rounded-2xl p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:bg-[#333] hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 border border-transparent hover:border-[#f6b100]/30 overflow-hidden"
                >
                  <div className="flex flex-col h-full justify-between gap-3 sm:gap-4 relative z-10">
                    <div>
                      <h3 className="text-white text-base sm:text-lg font-bold leading-tight mb-1 group-hover:text-[#f6b100] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-[#f6b100] font-bold text-base sm:text-lg">
                        <span className="text-gray-500 text-xs sm:text-sm font-normal">Rs. </span>
                        {item.price}
                      </p>
                    </div>

                    <div className="flex items-center justify-between bg-[#1a1a1a] rounded-xl p-1.5 shadow-inner">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          decrement(item._id)();
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-[#333] hover:text-white transition-colors text-lg"
                      >
                        &minus;
                      </button>

                      <input
                        type="number"
                        min="0"
                        className="w-10 bg-transparent text-center text-white font-bold outline-none no-spinner text-sm sm:text-base"
                        value={qty}
                        onChange={(e) => {
                          e.stopPropagation();
                          const val = parseInt(e.target.value, 10);
                          setQuantities(p => ({ ...p, [item._id]: isNaN(val) ? 0 : val }));
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          increment(item._id)();
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#f6b100] hover:bg-[#f6b100]/20 transition-colors text-lg"
                      >
                        &#43;
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Combo Modal */}
      <ComboModal
        isOpen={isComboModalOpen}
        onClose={() => setIsComboModalOpen(false)}
        onCreateCombo={handleCreateCombo}
      />
    </div>
  );
};

export default MenuContainer;
