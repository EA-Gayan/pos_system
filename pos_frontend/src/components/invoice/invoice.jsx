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

      // Check if response is a Blob (PDF)
      if (response instanceof Blob) {
        return response;
      }

      // If it's JSON, return as is
      return response;
    },

    onSuccess: (res) => {
      // Check if response is a PDF Blob
      if (res instanceof Blob) {
        const url = window.URL.createObjectURL(res);

        // Create hidden iframe for printing
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "none";
        iframe.src = url;

        document.body.appendChild(iframe);

        // Wait for PDF to load, then print
        iframe.onload = () => {
          setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          }, 250);
        };

        // Cleanup after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
          window.URL.revokeObjectURL(url);
        }, 2000);

        enqueueSnackbar("Invoice sent to printer!", { variant: "success" });
      } else {
        // Handle JSON response (for backward compatibility)
        enqueueSnackbar("Print successfully!", { variant: "success" });
      }
    },

    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || error?.message || "Request failed",
        {
          variant: "error",
        }
      );
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
        {/* Receipt Content for Printing */}

        <div ref={invoiceRef} className="p-4">
          {/* Receipt Header */}
          <div className="flex justify-center mb-4 px-35">
            <img src={logo} />
            {/* <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
              className="w-12 h-12 border-8 border-green-500 rounded-full flex items-center justify-center shadow-lg bg-green-500"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-2xl"
              >
                <FaCheck className="text-white" />
              </motion.span>
            </motion.div> */}
          </div>

          <h2 className="text-xl font-bold text-center mb-2">Jayanthi Hotel</h2>
          <p className="text-gray-600 text-center">Thank you for your order!</p>

          {/* Order Details */}

          <div className="mt-4 border-t pt-4 text-sm text-gray-700">
            <p>
              <strong>Order ID:</strong> {orderInfo?.orderId ?? "N/A"}
            </p>
          </div>

          {/* Items Summary */}

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

          {/* Bills Summary */}

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

          {/* Payment Details */}

          <div className="mb-2 mt-2 text-xs">
            {/* <p>
              <strong>Payment Method:</strong> {orderInfo?.paymentMethod}
            </p> */}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePrint}
            className="text-blue-500 hover:underline text-xs px-4 py-2 rounded-lg"
          >
            Print Receipt
          </button>
          <button
            onClick={handleInvoiceClose}
            className="text-red-500 hover:underline text-xs px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
