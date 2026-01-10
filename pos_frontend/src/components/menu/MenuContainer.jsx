import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { GrRadialSelected } from "react-icons/gr";
import { useDispatch } from "react-redux";
import { getCategories } from "../../https";
import { addItems } from "../../redux/slices/cartSlice";
import { setProductList } from "../../redux/slices/productSlice";
import { useSelector } from "react-redux";

const MenuContainer = () => {
  const dispatch = useDispatch();

  const [selectedItem, setSelectedItem] = useState(null);
  const [quantities, setQuantities] = useState({});

  const selectedStatus = parseInt(localStorage.getItem("selectedStatus"), 10);

  const searchData = useSelector((state) => state?.product?.searchList);

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
    dispatch(addItems(newObj));

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

  useEffect(() => {
    if (filteredCategories.length && !selectedItem) {
      setSelectedItem(filteredCategories[0]);
    }
    if (isError) {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
    }
  }, [categories, selectedItem, isError, selectedStatus]);

  return (
    <div className="flex flex-col md:flex-row w-full h-full gap-4 p-4 overflow-hidden">
      {/* Sidebar - Categories */}
      <div className="w-full md:w-1/4 h-[35%] md:h-full flex flex-col gap-4 bg-[#1f1f1f] rounded-2xl p-4 shadow-xl overflow-y-auto scrollbar-thin scrollbar-thumb-[#3a3a3a] scrollbar-track-transparent flex-shrink-0">
        <h2 className="text-xl font-bold text-white mb-2 px-2 border-l-4 border-[#f6b100] pl-3 sticky top-0 bg-[#1f1f1f] z-20 py-1">Categories</h2>
        <div className="flex flex-col gap-3 pb-20">
          {filteredCategories.map((category) => {
            const isSelected = selectedItem?._id === category._id;
            return (
              <div
                key={category._id}
                onClick={() => setSelectedItem(category)}
                className={`
                  relative overflow-hidden group cursor-pointer p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95
                  ${isSelected
                    ? "bg-gradient-to-r from-[#f6b100] to-[#e0a100] shadow-lg shadow-[#f6b100]/20"
                    : "bg-[#2a2a2a] hover:bg-[#333]"
                  }
                `}
              >
                <div className="flex items-center justify-between relative z-10">
                  <h3 className={`font-bold text-base ${isSelected ? "text-[#1a1a1a]" : "text-gray-100"}`}>
                    {category.name}
                  </h3>
                  {isSelected && <GrRadialSelected className="text-[#1a1a1a] text-xl" />}
                </div>
                <p className={`text-xs mt-1 font-medium ${isSelected ? "text-[#1a1a1a]/70" : "text-gray-500"}`}>
                  {category?.products?.length || 0} Items
                </p>

                {/* Decorative background element */}
                <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10 ${isSelected ? "bg-white" : "bg-white/5"}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content - Products */}
      <div className="w-full md:w-3/4 h-[65%] md:h-full bg-[#1f1f1f] rounded-2xl p-6 shadow-xl overflow-hidden flex flex-col min-h-0">
        {/* Header Area */}
        {searchData?.length > 0 ? (
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-[#f6b100]">Search Results</span>
            <span className="text-sm font-normal text-gray-500 bg-[#2a2a2a] px-3 py-1 rounded-full">
              Found {searchData.length} items
            </span>
          </h2>
        ) : (
          <div className="mb-6 pb-4 border-b border-[#333]">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {selectedItem?.name || "Select a Category"}
            </h2>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#3a3a3a] scrollbar-track-transparent">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-20">
            {(searchData?.length > 0 ? searchData : selectedItem?.products || []).map((item) => {
              const qty = quantities[item._id] || 0;
              return (
                <div
                  key={item._id}
                  onClick={() => handleAddToCart(item)}
                  className="group relative bg-[#2a2a2a] rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:bg-[#333] hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 border border-transparent hover:border-[#f6b100]/30 overflow-hidden"
                >
                  <div className="flex flex-col h-full justify-between gap-4 relative z-10">
                    <div>
                      <h3 className="text-white text-base font-bold leading-tight mb-1 group-hover:text-[#f6b100] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-[#f6b100] font-bold text-l">
                        <span className="text-gray-500">Rs. </span>
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
                        className="w-10 bg-transparent text-center text-white font-bold outline-none no-spinner"
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

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item);
                      }}
                      className="absolute top-0 right-0 p-2 text-[#02ca3a] opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0"
                    >
                      <FaShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuContainer;
