import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { getTotalPrice, removeAllItems } from "../../redux/slices/cartSlice";
import { useMutation } from "@tanstack/react-query";
import { addOrder, updateTable } from "../../https";
import { enqueueSnackbar } from "notistack";
import { removeCustomer } from "../../redux/slices/customerSlice";
import Invoice from "../invoice/invoice";

const Bill = () => {
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);
  const taxRate = 0;
  const tax = total * taxRate;
  const grandTotal = total + tax;
  console.log(total);

  const customerData = useSelector((state) => state.customer);
  const dispatch = useDispatch();
  const [showInvoice, setShowInvoice] = React.useState(false);
  const [orderInfo, setOrderInfo] = React.useState();

  // Place the order
  const handlePlaceOrder = async () => {
    const orderData = {
      customerDetails: {
        name: customerData.customerName,
        phone: customerData.customerPhone,
        guests: customerData.guests,
      },
      orderStatus: "In Progress",
      bills: {
        total: total,
        tax: tax,
        totalPayable: grandTotal,
      },
      items: cartData,
      table: "681adc70e2d0bdb8095fd2e4",
      paymentMethod: "Cash",
    };

    setTimeout(() => {
      orderMutation.mutate(orderData);
    }, 1500);
  };

  const orderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),

    onSuccess: (resData) => {
      const { data } = resData.data;
      console.log(data);

      setOrderInfo(data);

      // Update Table
      const tableData = {
        status: "Booked",
        orderId: data._id,
        tableId: data.table,
      };

      setTimeout(() => {
        tableUpdateMutation.mutate(tableData);
      }, 1500);

      enqueueSnackbar("Order Placed!", {
        variant: "success",
      });
      setShowInvoice(true);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const tableUpdateMutation = useMutation({
    mutationFn: (reqData) => updateTable(reqData),

    onSuccess: (resData) => {
      const { data } = resData.data;
      dispatch(removeCustomer());
      dispatch(removeAllItems());
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <>
      <div className="space-y-2 px-4 sm:px-5 mt-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#ababab] font-medium">
            Items({cartData.length})
          </p>
          <h1 className="text-[#f5f5f5] text-md font-bold">Rs {total}</h1>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#ababab] font-medium">Tax {taxRate}%</p>
          <h1 className="text-[#f5f5f5] text-md font-bold">Rs {tax}</h1>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#ababab] font-medium">Total</p>
          <h1 className="text-[#f5f5f5] text-md font-bold">Rs {grandTotal}</h1>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 px-4 sm:px-5 mt-4">
        <button className="bg-[#025cca] px-4 py-3 w-full rounded-lg text-[#ababab] text-sm sm:text-lg font-semibold break-words">
          Print Receipt
        </button>
        <button
          className="bg-[#f6b100] px-4 py-3 w-full rounded-lg text-[#1f1f1f] text-sm sm:text-lg font-semibold break-words"
          onClick={() => handlePlaceOrder()}
        >
          Place Order
        </button>
      </div>

      {showInvoice && (
        <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}
    </>
  );
};

export default Bill;
