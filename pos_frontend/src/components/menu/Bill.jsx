import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { getTotalPrice, removeAllItems } from "../../redux/slices/cartSlice";
import { useMutation } from "@tanstack/react-query";
import { addOrder, updateTable } from "../../https";
import { enqueueSnackbar } from "notistack";
import { removeCustomer } from "../../redux/slices/customerSlice";
import Invoice from "../invoice/invoice";
import { OrderTypes } from "../../enum/orderTypes";

const Bill = () => {
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);
  const taxRate = 0;
  const tax = total * taxRate;
  const grandTotal = total + tax;

  const customerData = useSelector((state) => state.customer);
  const dispatch = useDispatch();
  const [showInvoice, setShowInvoice] = React.useState(false);
  const [orderInfo, setOrderInfo] = React.useState(null);

  const orderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),
    onSuccess: (resData) => {
      const { data } = resData.data;
      setOrderInfo(data);

      // Update table status
      const tableData = {
        status: "Booked",
        orderId: data._id,
        tableId: data.table,
      };
      if (tableData.tableId != null) {
        tableUpdateMutation.mutate(tableData);
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
      dispatch(removeCustomer());
      dispatch(removeAllItems());
    },
    onError: (error) => {
      enqueueSnackbar("Table update failed", {
        variant: "error",
      });
      console.error("Table update error:", error);
    },
  });

  const handlePlaceOrder = async () => {
    if (!cartData.length) {
      enqueueSnackbar(
        "Cart is empty. Please add items before placing an order.",
        {
          variant: "warning",
        }
      );
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
        tax: tax,
        totalPayable: grandTotal,
      },
      items: cartData,
      table: customerData.table,
      paymentMethod: "Cash",
    };

    try {
      // Wait for the order mutation to complete
      await orderMutation.mutateAsync(orderData);

      // After successful order creation, show invoice
      setShowInvoice(true);
    } catch (error) {
      console.error("Order creation failed:", error);
    }
  };

  const handlePrintReceipt = async () => {
    if (!cartData.length) {
      enqueueSnackbar(
        "Cart is empty. Please add items before placing an order.",
        {
          variant: "warning",
        }
      );
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
        tax: tax,
        totalPayable: grandTotal,
      },
      items: cartData,
      table: customerData.table,
      paymentMethod: "Cash",
    };

    try {
      // Wait for the order mutation to complete
      const response = await orderMutation.mutateAsync(orderData);
      const { data } = response.data;

      // After successful order creation, send to print
      const printResponse = await fetch("http://localhost:3001/print", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderInfo: data }),
      });

      const result = await printResponse.json();

      if (result.success) {
        enqueueSnackbar("Print sent successfully!", { variant: "success" });
        dispatch(removeAllItems());
      } else {
        enqueueSnackbar("Print failed: " + (result.error || "Unknown error"), {
          variant: "error",
        });
        dispatch(removeAllItems());
      }
    } catch (error) {
      console.error("Print error:", error);
      enqueueSnackbar(
        "Failed to connect to print server. Make sure the print server is running.",
        {
          variant: "error",
        }
      );
      dispatch(removeAllItems());
    }
  };

  return (
    <>
      {/* Bill Section (Sticky at Bottom) */}
      <div className="py-3 bg-[#1a1a1a] relative">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#ababab] font-medium">
              Items({cartData.length})
            </p>
            <h1 className="text-[#f5f5f5] text-md font-bold">Rs {total}</h1>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#ababab] font-medium">Total</p>
            <h1 className="text-[#f5f5f5] text-md font-bold">
              Rs {grandTotal}
            </h1>
          </div>
        </div>

        <button
          className={`
    bg-[#f6b100] py-3 w-full rounded-lg
    text-[#1f1f1f] text-sm sm:text-lg font-semibold mt-4
    transition-all duration-150 cursor-pointer
    hover:bg-[#e5a400]
    active:bg-[#d99a00]
    active:scale-95
    ${
      orderMutation.isLoading
        ? "opacity-50 cursor-not-allowed active:scale-100 hover:bg-[#f6b100]"
        : ""
    }
  `}
          onClick={handlePrintReceipt}
          disabled={orderMutation.isLoading}
        >
          {orderMutation.isLoading ? "Printing..." : "Print Order"}
        </button>
        <button
          className={`
    bg-[#f6b100] py-3 w-full rounded-lg
    text-[#1f1f1f] text-sm sm:text-lg font-semibold mt-4
    transition-all duration-150 cursor-pointer
    hover:bg-[#e5a400]
    active:bg-[#d99a00]
    active:scale-95
    ${
      orderMutation.isLoading
        ? "opacity-50 cursor-not-allowed active:scale-100 hover:bg-[#f6b100]"
        : ""
    }
  `}
          onClick={handlePlaceOrder}
          disabled={orderMutation.isLoading}
        >
          {orderMutation.isLoading ? "Placing..." : "Place Order"}
        </button>
      </div>

      {showInvoice && (
        <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}
    </>
  );
};

export default Bill;
