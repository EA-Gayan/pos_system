import React, { useEffect, useRef } from "react";
import { RiDeleteBin2Fill, RiProhibitedLine } from "react-icons/ri";
import { FaNotesMedical } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { removeItem, removeAllItems } from "../../redux/slices/cartSlice";
import Bill from "./Bill";

const CartInfo = () => {
  const dispatch = useDispatch();
  const cartData = useSelector((state) => state.cart);
  const scrollRef = useRef();

  const handleRemove = (itemId) => {
    dispatch(removeItem(itemId));
  };

  const handleClearCart = () => {
    dispatch(removeAllItems());
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [cartData]);

  return (
    <div className="flex-1 bg-[#1a1a1a] mt-4 mr-3 rounded-2xl shadow-lg pt-4 mb-[5rem] flex flex-col px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl text-[#F6B100] font-semibold tracking-wide">
          Order Details
        </h1>
        {cartData.length > 0 && (
          <RiDeleteBin2Fill
            onClick={handleClearCart}
            className="text-[#ac1b1b] cursor-pointer hover:text-red-500 transition-all"
            size={22}
            title="Clear Cart"
          />
        )}
      </div>
      <hr className="border-[#b4b4b4] border-t mt-3 mb-3" />

      {/* Scrollable Cart Items */}
      <div
        className={`flex-1 overflow-y-auto px-5 py-3 bg-[#262626] rounded-t-xl ${
          cartData.length === 0 ? "flex items-center justify-center" : ""
        }`}
        style={{ maxHeight: "60vh" }} // responsive height
        ref={scrollRef}
      >
        {cartData.length === 0 ? (
          <div className="flex flex-col items-center py-10">
            <RiProhibitedLine className="text-[#ababab] mb-3" size={45} />
            <p className="text-[#ababab] text-sm font-medium">
              Your cart is empty
            </p>
          </div>
        ) : (
          cartData.map((item) => (
            <div
              key={item.id}
              className={`bg-[#1f1f1f] rounded-xl px-4 py-4 mb-3 shadow-sm border ${
                item.isCombo 
                  ? "border-[#f6b100]/30 bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a]" 
                  : "border-[#2c2c2c] hover:border-[#3a3a3a]"
              } transition-all`}
            >

              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-[#f5f5f5] font-semibold tracking-wide text-md">
                    {item.name}
                  </h1>
                  <p className="text-[#bcbcbc] font-medium text-sm">
                    Quantity: x{item.quantity}
                  </p>
                  {item.isCombo && item.comboProducts && (
                    <div className="mt-2 pl-2 border-l-2 border-[#f6b100]/30">
                      <p className="text-[#f6b100] text-xs font-semibold mb-1">Includes:</p>
                      {item.comboProducts.map((product, index) => (
                        <p key={index} className="text-[#9a9a9a] text-xs">
                          • {product.quantity}x {product.name}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[#F6B100] text-md font-bold">
                  Rs {item.price}
                </p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <RiDeleteBin2Fill
                  onClick={() => handleRemove(item.id)}
                  className="text-[#ac1b1b] cursor-pointer hover:text-red-500 transition-all"
                  size={20}
                  title="Remove Item"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Static Bill Section */}
      <div className="px-5 py-3 border-t border-[#3a3a3a] bg-[#1a1a1a] mb-15">
        <Bill />
      </div>
    </div>
  );
};

export default CartInfo;
