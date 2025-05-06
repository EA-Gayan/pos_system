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
    console.log("hi");
    if (itemCount === 0) return;
    const { name, price } = item;
    const newObj = {
      id: new Date(),
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
      <div className="grid grid-cols-4 gap-4 px-10 py-4 w-[100%]">
        {menus.map((menu) => {
          return (
            <div
              key={menu.id}
              className="flex flex-col items-start justify-between p-4 rounded-lg h-[100px] cursor-pointer"
              style={{ backgroundColor: menu.bgColor }}
              onClick={() => {
                setSelected(menu), setItemId(0), setItemCount(0);
              }}
            >
              <div className="flex items-center justify-between w-full">
                <h1 className="text-[#f5f5f5] text-lg font-semibold">
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

      <div className="grid grid-cols-4 gap-4 px-10 py-4 w-[100%]">
        {selected?.items.map((item) => {
          return (
            <div
              key={item.id}
              className="flex flex-col items-start justify-between p-4 rounded-lg h-[150px] cursor-pointer hover:bg-[#494949] bg-[#1a1a1a]"
            >
              <div className="flex items-center justify-between w-full">
                <h1 className="text-[#f5f5f5] text-lg font-semibold">
                  {item.name}
                </h1>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="bg-[#2e4a40] p-2 rounded-lg text-[#02ca3a]"
                >
                  <FaShoppingCart />
                </button>
              </div>
              <div className="flex items-center justify-between w-full">
                <p className="text-[#f5f5f5] text-lg font-bold">
                  Rs {item.price}
                </p>

                <div className="flex items-center justify-between bg-[#1f1f1f] py-3 px-4 rounded-lg gap-4">
                  <button
                    onClick={decrement(item.id)}
                    className="text-yellow-500 text-2xl"
                  >
                    &minus;
                  </button>
                  <span className="text-white">
                    {" "}
                    {item.id === itemId ? itemCount : 0}
                  </span>
                  <button
                    onClick={incerement(item.id)}
                    className="text-yellow-500 text-2xl"
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
