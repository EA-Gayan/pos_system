import React, { useEffect, useRef } from "react";
import { RiDeleteBin2Fill, RiProhibitedLine } from "react-icons/ri";
import { FaNotesMedical } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { removeItem, removeAllItems } from "../../redux/slices/cartSlice";

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
    <div className="px-4 py-2">
      <div className="flex items-center justify-between">
        <h1 className="text-lg text-[#e4e4e4] font-semibold tracking-wide">
          Order Details
        </h1>
        {cartData.length > 0 && (
          <RiDeleteBin2Fill
            onClick={handleClearCart}
            className="text-[#ababab] cursor-pointer hover:text-red-500"
            size={20}
            title="Clear Cart"
          />
        )}
      </div>
      <div
        className={`mt-4 min-h-[380px] overflow-y-auto bg-gray-800 ${
          cartData.length === 0 ? "flex items-center justify-center" : ""
        }`}
        ref={scrollRef}
      >
        {cartData.length === 0 ? (
          <div className="flex flex-col items-center">
            <RiProhibitedLine className="text-[#ababab] mb-2" size={40} />
            <p className="text-[#ababab] text-sm">Your cart is empty</p>
          </div>
        ) : (
          cartData.map((item) => (
            <div
              key={item.id}
              className="bg-[#1f1f1f] rounded-lg px-4 py-4 mb-2"
            >
              <div>
                <h1 className="text-[#ababab] font-semibold tracking-wide text-md">
                  {item.name}
                </h1>
                <p className="text-[#ababab] font-semibold">x{item.quantity}</p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                  <RiDeleteBin2Fill
                    onClick={() => handleRemove(item.id)}
                    className="text-[#ababab] cursor-pointer hover:text-red-500"
                    size={20}
                    title="Remove Item"
                  />
                  {/* <FaNotesMedical
                    className="text-[#ababab] cursor-pointer"
                    size={20}
                  /> */}
                </div>
                <p className="text-[#f5f5f5] text-md font-bold">
                  Rs {item.price}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CartInfo;
