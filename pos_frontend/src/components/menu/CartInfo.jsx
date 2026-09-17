import React, { useEffect, useRef, useState } from "react";
import { RiDeleteBin2Fill, RiProhibitedLine } from "react-icons/ri";
import { FaNotesMedical } from "react-icons/fa";
import { HiMinusCircle, HiPlusCircle } from "react-icons/hi";
import { FiEdit2, FiCheck, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { removeItem, removeAllItems, incrementQuantity, decrementQuantity, overrideItemPrice } from "../../redux/slices/cartSlice";
import Bill from "./Bill";

const CartInfo = ({ isOpen = true, onClose = () => {} }) => {
  const dispatch = useDispatch();
  const cartData = useSelector((state) => state.cart);
  const scrollRef = useRef();

  // Price override state
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [tempPrice, setTempPrice] = useState("");

  const handleRemove = (itemId) => {
    dispatch(removeItem(itemId));
  };

  const handleClearCart = () => {
    dispatch(removeAllItems());
  };

  const handleIncrement = (itemId) => {
    dispatch(incrementQuantity(itemId));
  };

  const handleDecrement = (itemId) => {
    dispatch(decrementQuantity(itemId));
  };

  const handleStartEdit = (item) => {
    setEditingPriceId(item.id);
    setTempPrice(String(item.pricePerQuantity));
  };

  const handleConfirmPrice = (itemId) => {
    const parsed = parseFloat(tempPrice);
    if (!isNaN(parsed) && parsed >= 0) {
      dispatch(overrideItemPrice({ id: itemId, newUnitPrice: parsed }));
    }
    setEditingPriceId(null);
    setTempPrice("");
  };

  const handleCancelEdit = () => {
    setEditingPriceId(null);
    setTempPrice("");
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
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <div
        className={`
          fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-[#1a1a1a] shadow-2xl flex flex-col px-4 pt-4
          transition-transform duration-300 ease-in-out
          md:relative md:inset-auto md:z-auto md:flex-1 md:mt-4 md:mr-3 md:rounded-2xl md:shadow-lg md:mb-[5rem]
          ${isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="md:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#2a2a2a] cursor-pointer"
              title="Close Cart"
            >
              <FiX size={22} />
            </button>
            <h1 className="text-lg sm:text-xl text-[#F6B100] font-semibold tracking-wide">
              Order Details
            </h1>
          </div>
          {cartData.length > 0 && (
            <RiDeleteBin2Fill
              onClick={handleClearCart}
              className="text-[#ac1b1b] cursor-pointer hover:text-red-500 transition-all"
              size={22}
              title="Clear Cart"
            />
          )}
        </div>
        <hr className="border-[#333] border-t mt-3 mb-3" />

      {/* Scrollable Cart Items */}
      <div
        className={`flex-1 overflow-y-auto px-5 py-3 bg-[#262626] rounded-t-xl touch-scrollbar ${cartData.length === 0 ? "flex items-center justify-center" : ""
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
              className={`bg-[#1f1f1f] rounded-xl px-4 py-4 mb-3 shadow-sm border ${item.isCombo
                ? "border-[#f6b100]/30 bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a]"
                : "border-[#2c2c2c] hover:border-[#3a3a3a]"
                } transition-all`}
            >

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h1 className="text-[#f5f5f5] font-semibold tracking-wide text-md">
                    {item.name}
                  </h1>
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
                {/* Price display / inline edit */}
                <div className="ml-4 flex items-center gap-1">
                  {editingPriceId === item.id ? (
                    // ── Inline edit mode ──────────────────────────────
                    <div className="flex items-center gap-1">
                      <span className="text-[#ababab] text-xs font-semibold">Rs</span>
                      <input
                        id={`price-input-${item.id}`}
                        autoFocus
                        type="number"
                        min="0"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleConfirmPrice(item.id);
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        className="w-20 bg-[#2e2e2e] text-[#f5f5f5] text-sm rounded-md px-2 py-1
                                   border border-[#f6b100] outline-none focus:ring-1 focus:ring-[#f6b100]
                                   [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                                   [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        id={`confirm-price-${item.id}`}
                        onClick={() => handleConfirmPrice(item.id)}
                        title="Confirm price"
                        className="text-green-400 hover:text-green-300 transition-all cursor-pointer"
                      >
                        <FiCheck size={16} />
                      </button>
                      <button
                        id={`cancel-price-${item.id}`}
                        onClick={handleCancelEdit}
                        title="Cancel"
                        className="text-[#ababab] hover:text-red-400 transition-all cursor-pointer"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    // ── Display mode ──────────────────────────────────
                    <div className="flex items-center gap-1.5">
                      <div className="flex flex-col items-end">
                        <p className="text-[#F6B100] text-md font-bold leading-tight">
                          Rs {item.price}
                        </p>
                        {item.isPriceOverridden && (
                          <span
                            className="text-[9px] font-semibold uppercase tracking-wider
                                       text-[#f6b100] bg-[#f6b10020] border border-[#f6b10040]
                                       px-1.5 py-0.5 rounded-full leading-tight"
                          >
                            custom
                          </span>
                        )}
                      </div>
                      {!item.isCombo && (
                        <button
                          id={`edit-price-${item.id}`}
                          onClick={() => handleStartEdit(item)}
                          title="Override price for this order"
                          className="text-[#555] hover:text-[#f6b100] transition-all cursor-pointer
                                     ml-0.5 p-1 rounded hover:bg-[#f6b10015]"
                        >
                          <FiEdit2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                {/* Quantity Controls */}
                <div className="flex items-center gap-4 bg-[#262626] rounded-lg px-4 py-2.5">
                  <HiMinusCircle
                    onClick={() => handleDecrement(item.id)}
                    className={`cursor-pointer transition-all ${item.quantity <= 1
                      ? "text-[#4a4a4a] cursor-not-allowed"
                      : "text-[#F6B100] hover:text-[#ffcc33]"
                      }`}
                    size={32}
                    title="Decrease Quantity"
                  />
                  <span className="text-[#f5f5f5] font-semibold text-base min-w-[40px] text-center">
                    x{item.quantity}
                  </span>
                  <HiPlusCircle
                    onClick={() => handleIncrement(item.id)}
                    className="text-[#F6B100] cursor-pointer hover:text-[#ffcc33] transition-all"
                    size={32}
                    title="Increase Quantity"
                  />
                </div>

                {/* Delete Button */}
                <RiDeleteBin2Fill
                  onClick={() => handleRemove(item.id)}
                  className="text-[#ac1b1b] cursor-pointer hover:text-red-500 transition-all"
                  size={28}
                  title="Remove Item"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Static Bill Section */}
      <div className="px-3 sm:px-5 py-3 border-t border-[#3a3a3a] bg-[#1a1a1a] mb-0 md:mb-15 pb-8 md:pb-3 shrink-0">
        <Bill />
      </div>
    </div>
  </>
  );
};

export default CartInfo;
