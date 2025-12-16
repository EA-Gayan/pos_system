// INVOICE COMPONENT
import { useRef } from "react";
import { useDispatch } from "react-redux";
import { removeAllItems } from "../../redux/slices/cartSlice";
import logo from "../../assets/images/logo-modified.png";
import { useMutation } from "@tanstack/react-query";
import { printInvoice } from "../../https";
import { enqueueSnackbar } from "notistack";

const Invoice = ({ orderInfo, setShowInvoice }) => {
  const invoiceRef = useRef(null);

  const dispatch = useDispatch();

  const printInvoiceMutation = useMutation({
    mutationFn: async (value) => {
      const response = await printInvoice({ orderId: value });
      return response;
    },

    onSuccess: (result) => {
      if (result.success) {
        enqueueSnackbar("Invoice printed successfully!", {
          variant: "success",
        });
      } else {
        enqueueSnackbar(result.message || "Print failed", {
          variant: "error",
        });
      }
    },

    onError: (error) => {
      console.error("Print error:", error);
      enqueueSnackbar("Failed to print. Check if print server is running.", {
        variant: "error",
      });
    },
  });

  const handleInvoiceClose = () => {
    setShowInvoice(false);
    dispatch(removeAllItems());
  };

  const handlePrint = () => {
    printInvoiceMutation.mutate(orderInfo?.orderId ?? "N/A");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg shadow-lg w-[400px]">
        <div ref={invoiceRef} className="p-4">
          <div className="flex justify-center mb-4 px-35">
            <img src={logo} alt="Logo" />
          </div>

          <h2 className="text-xl font-bold text-center mb-2">Jayanthi Hotel</h2>
          <p className="text-gray-600 text-center">Thank you for your order!</p>

          <div className="mt-4 border-t pt-4 text-sm text-gray-700">
            <p>
              <strong>Order ID:</strong> {orderInfo?.orderId ?? "N/A"}
            </p>
          </div>

          <div className="mt-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Items Ordered</h3>
            <ul className="text-sm text-gray-700">
              {orderInfo?.items?.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center text-xs"
                >
                  <span>
                    {item?.name} x{item?.quantity}
                  </span>
                  <span>Rs {item?.price}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 border-t pt-4 text-sm">
            <p>
              <strong>Subtotal:</strong> Rs{" "}
              {orderInfo?.bills?.total?.toFixed(2)}
            </p>
            <p>
              <strong>Tax:</strong> Rs {orderInfo?.bills?.tax?.toFixed(2)}
            </p>
            <p className="text-md font-semibold">
              <strong>Grand Total:</strong> Rs{" "}
              {orderInfo?.bills?.totalPayable?.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={handlePrint}
            disabled={printInvoiceMutation.isPending}
            className="text-blue-500 hover:underline hover:text-blue-600 text-xs px-4 py-2 rounded-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {printInvoiceMutation.isPending ? "Printing..." : "Print Receipt"}
          </button>
          <button
            onClick={handleInvoiceClose}
            className="text-red-500 hover:underline hover:text-red-600 text-xs px-4 py-2 rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
