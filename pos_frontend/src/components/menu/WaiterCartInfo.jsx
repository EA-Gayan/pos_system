import React, { useEffect, useRef, useState } from "react";
import { RiDeleteBin2Fill, RiProhibitedLine } from "react-icons/ri";
import { HiMinusCircle, HiPlusCircle } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import {
  removeTableCartItem,
  clearTableCartItems,
  incrementTableQuantity,
  decrementTableQuantity,
  getTableTotalPrice,
} from "../../redux/slices/tableCartSlice";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { addOrder, updateTable, updateTableCart, clearTableCart } from "../../https";
import { OrderTypes } from "../../enum/orderTypes";
import Invoice from "../invoice/invoice";
import { useNavigate } from "react-router-dom";

const WaiterCartInfo = ({ tableId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartData = useSelector((state) => state.tableCart.items);
  const total = useSelector(getTableTotalPrice);
  const scrollRef = useRef();
  
  const customerData = useSelector((state) => state.customer);
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleRemove = (itemId) => {
    dispatch(removeTableCartItem(itemId));
  };

  const handleClearCart = () => {
    dispatch(clearTableCartItems());
  };

  const handleIncrement = (itemId) => {
    dispatch(incrementTableQuantity(itemId));
  };

  const handleDecrement = (itemId) => {
    dispatch(decrementTableQuantity(itemId));
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [cartData]);

  const draftTableUpdateMutation = useMutation({
    mutationFn: (reqData) => updateTable(reqData),
  });

  const handleSaveDraft = async () => {
    if (!tableId) return;
    setIsSaving(true);
    try {
      await updateTableCart(tableId, cartData);
      
      // Change table status to indicate it has a draft
      await draftTableUpdateMutation.mutateAsync({
        tableId: tableId,
        status: "Draft",
      });

      enqueueSnackbar("Draft saved successfully!", { variant: "success" });
      // Removed navigate so the user stays on the page
    } catch (error) {
      console.error("Save draft error:", error);
      enqueueSnackbar("Failed to save draft", { variant: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const orderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),
    onSuccess: async (resData) => {
      const { data } = resData.data;
      setOrderInfo(data);

      // Make table status Available again or Booked? Normally after Complete it should be Available? 
      // Actually, if a waiter completes the order, they are done taking it. So it should probably stay Booked if they are eating, but if they paid, it's Available. Let's set it to Booked as before.
      const tableUpdateData = {
        status: "Booked",
        orderId: data._id,
        tableId: data.table,
      };
      if (tableUpdateData.tableId != null) {
        tableUpdateMutation.mutate(tableUpdateData);
      }
      
      // Clear the temporary cart from DB
      if (tableId) {
        await clearTableCart(tableId);
      }

      enqueueSnackbar("Order Placed!", {
        variant: "success",
      });
    },
    onError: (error) => {
      enqueueSnackbar("Failed to place order", {
        variant: "error",
      });
      console.error("Order placement error:", error);
    },
  });

  const tableUpdateMutation = useMutation({
    mutationFn: (reqData) => updateTable(reqData),
    onSuccess: () => {
      dispatch(clearTableCartItems());
    },
    onError: (error) => {
      enqueueSnackbar("Table update failed", {
        variant: "error",
      });
    },
  });

  const handleCompleteOrder = async () => {
    if (!cartData.length) {
      enqueueSnackbar("Cart is empty. Please add items before placing an order.", { variant: "warning" });
      return;
    }

    const orderData = {
      customerDetails: {
        name: customerData.customerName,
        phone: customerData.customerPhone,
        guests: customerData.guests,
      },
      orderStatus: OrderTypes.COMPLETE,
      bills: {
        total: total,
        tax: 0,
        totalPayable: total,
      },
      items: cartData,
      table: tableId,
      paymentMethod: "Cash",
    };

    try {
      await orderMutation.mutateAsync(orderData);
      setShowInvoice(true);
    } catch (error) {
      console.error("Order creation failed:", error);
    }
  };

  return (
    <div className="flex-1 bg-[#1a1a1a] mt-4 mr-3 rounded-2xl shadow-lg pt-4 mb-[5rem] flex flex-col px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl text-[#F6B100] font-semibold tracking-wide">
          Table {customerData?.table?.tableNo} Order
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
        className={`flex-1 overflow-y-auto px-5 py-3 bg-[#262626] rounded-t-xl ${cartData.length === 0 ? "flex items-center justify-center" : ""
          }`}
        style={{ maxHeight: "60vh" }}
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
                <p className="text-[#F6B100] text-md font-bold ml-4">
                  Rs {item.price}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4 bg-[#262626] rounded-lg px-4 py-2.5">
                  <HiMinusCircle
                    onClick={() => handleDecrement(item.id)}
                    className={`cursor-pointer transition-all ${item.quantity <= 1
                      ? "text-[#4a4a4a] cursor-not-allowed"
                      : "text-[#F6B100] hover:text-[#ffcc33]"
                      }`}
                    size={32}
                  />
                  <span className="text-[#f5f5f5] font-semibold text-base min-w-[40px] text-center">
                    x{item.quantity}
                  </span>
                  <HiPlusCircle
                    onClick={() => handleIncrement(item.id)}
                    className="text-[#F6B100] cursor-pointer hover:text-[#ffcc33] transition-all"
                    size={32}
                  />
                </div>

                <RiDeleteBin2Fill
                  onClick={() => handleRemove(item.id)}
                  className="text-[#ac1b1b] cursor-pointer hover:text-red-500 transition-all"
                  size={28}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Buttons Section */}
      <div className="px-5 py-3 border-t border-[#3a3a3a] bg-[#1a1a1a] mb-15">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#ababab] font-medium">Items({cartData.length})</p>
            <h1 className="text-[#f5f5f5] text-md font-bold">Rs {total}</h1>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#ababab] font-medium">Total</p>
            <h1 className="text-[#f5f5f5] text-md font-bold">Rs {total}</h1>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            className="flex-1 bg-gray-600 hover:bg-gray-500 py-3 rounded-lg text-white font-semibold transition-all"
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
          
          <button
            className="flex-1 bg-[#f6b100] hover:bg-[#e5a400] py-3 rounded-lg text-[#1f1f1f] font-semibold transition-all"
            onClick={handleCompleteOrder}
            disabled={orderMutation.isLoading}
          >
            {orderMutation.isLoading ? "Placing..." : "Complete Order"}
          </button>
        </div>
      </div>
      
      {showInvoice && (
        <Invoice 
          orderInfo={orderInfo} 
          setShowInvoice={setShowInvoice} 
          onClose={() => navigate("/tables")} 
        />
      )}
    </div>
  );
};

export default WaiterCartInfo;
