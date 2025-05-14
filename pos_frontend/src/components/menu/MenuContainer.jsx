import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { GrRadialSelected } from "react-icons/gr";
import { useDispatch } from "react-redux";
import { getCategories } from "../../https";
import { addItems } from "../../redux/slices/cartSlice";

const MenuContainer = () => {
  const dispatch = useDispatch();

  const [selectedItem, setSelectedItem] = useState(null);
  const [quantities, setQuantities] = useState({});

  const selectedStatus = parseInt(localStorage.getItem("selectedStatus"), 10);

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

  // all categories
  const categories = resData?.data?.data || [];

  // filtered categories
  const filteredCategories = categories.filter(
    (item) => item.mealType === selectedStatus || item.mealType === 4
  );

  useEffect(() => {
    if (filteredCategories.length && !selectedItem) {
      setSelectedItem(filteredCategories[0]);
    }
    if (isError) {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
    }
  }, [categories, filteredCategories, selectedItem, isError]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 py-6 w-full">
        {filteredCategories.map((category) => {
          const isSelected = selectedItem?.id === category.id;
          return (
            <div
              key={category.id}
              className={`flex flex-col justify-between p-4 rounded-lg min-h-[100px] cursor-pointer hover:opacity-90 transition duration-200 ${
                isSelected ? "bg-[#1d2569]" : "bg-gray-700"
              }`}
              onClick={() => {
                setSelectedItem(category);
              }}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <h1 className="text-[#f5f5f5] text-lg font-semibold flex items-center gap-2">
                  {/* {menu.icon} */}
                  {category.name}
                </h1>
                {isSelected && (
                  <GrRadialSelected className="text-white" size={20} />
                )}
              </div>
              <p className="text-[#ababab] text-sm font-semibold">
                {category?.products.length} Items
              </p>
            </div>
          );
        })}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-4" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 py-6 w-full">
        {selectedItem?.products.map((item) => {
          return (
            <div
              key={item._id}
              className="flex flex-col justify-between p-4 rounded-lg min-h-[150px] hover:bg-[#494949] bg-[#1a1a1a] transition duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-[#f5f5f5] text-lg font-semibold">
                  {item.name}
                </h1>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="bg-[#2e4a40] text-[#02ca3a] p-2 rounded-lg"
                >
                  <FaShoppingCart />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[#f5f5f5] text-lg font-bold">
                  Rs {item.price}
                </p>

                <div className="flex items-center justify-between bg-[#1f1f1f] px-3 py-2 rounded-lg gap-4 w-32">
                  <button
                    onClick={decrement(item._id)}
                    className="text-yellow-500 text-xl"
                  >
                    &minus;
                  </button>
                  <input
                    type="number"
                    min="0"
                    className="bg-transparent text-white text-center w-10 outline-none no-spinner"
                    value={quantities[item._id] || ""}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      setQuantities((prev) => ({
                        ...prev,
                        [item._id]: isNaN(value) ? 0 : value,
                      }));
                    }}
                    onClick={(e) => e.target.select()}
                    inputMode="numeric"
                  />

                  <button
                    onClick={increment(item._id)}
                    className="text-yellow-500 text-xl"
                  >
                    &#43;
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MenuContainer;
