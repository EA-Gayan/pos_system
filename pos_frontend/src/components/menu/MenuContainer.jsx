import React, { useState } from "react";
import { menus } from "../../constants";
import { GrRadialSelected } from "react-icons/gr";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addItems } from "../../redux/slices/cartSlice";

const MenuContainer = () => {
  const dispatch = useDispatch();

  const [selected, setSelected] = useState(menus[0]);
  const [itemCount, setItemCount] = useState(0);
  const [itemId, setItemId] = useState(0);

  const incerement = (id) => () => {
    setItemCount(itemCount + 1);
    setItemId(id);
  };

  const decrement = (id) => () => {
    setItemCount(itemCount - 1);
    setItemId(id);
  };

  const handleAddToCart = (item) => {
    if (itemCount === 0) return;
    const { name, price } = item;
    const newObj = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      pricePerQuantity: price,
      quantity: itemCount,
      price: itemCount * price,
    };
    dispatch(addItems(newObj));
    setItemCount(0);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 py-6 w-full">
        {menus.map((menu) => {
          return (
            <div
              key={menu.id}
              className="flex flex-col justify-between p-4 rounded-lg min-h-[100px] cursor-pointer hover:opacity-90 transition duration-200"
              style={{ backgroundColor: menu.bgColor }}
              onClick={() => {
                setSelected(menu);
                setItemId(0);
                setItemCount(0);
              }}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <h1 className="text-[#f5f5f5] text-lg font-semibold flex items-center gap-2">
                  {menu.icon}
                  {menu.name}
                </h1>
                {selected.id === menu.id && (
                  <GrRadialSelected className="text-white" size={20} />
                )}
              </div>
              <p className="text-[#ababab] text-sm font-semibold">
                {menu.items.length} Items
              </p>
            </div>
          );
        })}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-4" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 py-6 w-full">
        {selected?.items.map((item) => {
          return (
            <div
              key={item.id}
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
                    onClick={decrement(item.id)}
                    className="text-yellow-500 text-xl"
                  >
                    &minus;
                  </button>
                  <span className="text-white">
                    {item.id === itemId ? itemCount : 0}
                  </span>
                  <button
                    onClick={incerement(item.id)}
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
