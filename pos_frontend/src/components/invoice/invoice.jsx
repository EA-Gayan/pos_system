import { useRef } from "react";
import { useDispatch } from "react-redux";
import { removeAllItems } from "../../redux/slices/cartSlice";
import logo from "../../assets/images/logo-modified.png";
import { enqueueSnackbar } from "notistack";

const Invoice = ({ orderInfo, setShowInvoice }) => {
  const invoiceRef = useRef(null);
  const dispatch = useDispatch();

  const handleInvoiceClose = () => {
    setShowInvoice(false);
    dispatch(removeAllItems());
  };

  const generatePrintHTML = () => {
    const formattedDate = new Date(
      orderInfo?.orderDate || new Date()
    ).toLocaleString("en-LK", {
      dateStyle: "medium",
      timeStyle: "short",
      hour12: true,
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            width: 72mm;
            padding: 5mm;
            font-size: 11px;
            line-height: 1.4;
          }
          .center {
            text-align: center;
          }
          .logo {
            width: 50px;
            margin: 0 auto 10px;
            display: block;
          }
          h2 {
            font-size: 16px;
            margin-bottom: 5px;
          }
          .thank-you {
            font-size: 9px;
            color: #666;
            margin-bottom: 10px;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          .order-id {
            font-size: 10px;
            margin: 8px 0;
          }
          .section-title {
            font-weight: bold;
            margin: 10px 0 5px;
            font-size: 11px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
            font-size: 10px;
          }
          .totals {
            margin-top: 10px;
          }
          .totals p {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
            font-size: 10px;
          }
          .grand-total {
            font-weight: bold;
            font-size: 12px !important;
            margin-top: 5px;
          }
          .footer {
            margin-top: 15px;
            text-align: center;
          }
          .date {
            font-size: 9px;
            margin-bottom: 5px;
          }
          .farewell {
            font-weight: bold;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="center">
          <img src="${logo}" class="logo" alt="Logo">
          <h2>Jayanthi Hotel</h2>
          <p class="thank-you">Thank you for your order!</p>
        </div>

        <div class="divider"></div>
        
        <div class="order-id">
          <strong>Order ID:</strong> ${orderInfo?.orderId ?? "N/A"}
        </div>

        <div class="divider"></div>

        <div class="section-title">Items Ordered</div>
        ${orderInfo?.items
          ?.map(
            (item) => `
          <div class="item">
            <span>${item?.name} x${item?.quantity}</span>
            <span>Rs ${item?.price?.toFixed(2)}</span>
          </div>
        `
          )
          .join("")}

        <div class="divider"></div>

        <div class="totals">
          <p>
            <strong>Subtotal:</strong>
            <span>Rs ${orderInfo?.bills?.total?.toFixed(2)}</span>
          </p>
          <p>
            <strong>Tax:</strong>
            <span>Rs ${orderInfo?.bills?.tax?.toFixed(2)}</span>
          </p>
          <p class="grand-total">
            <strong>Grand Total:</strong>
            <span>Rs ${orderInfo?.bills?.totalPayable?.toFixed(2)}</span>
          </p>
        </div>

        <div class="divider"></div>

        <div class="footer">
          <p class="date">${formattedDate}</p>
          <p class="farewell">See You Again!</p>
        </div>

        <div class="divider"></div>
      </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    try {
      const html = generatePrintHTML();

      // Send to local Electron print server
      const response = await fetch("http://localhost:3001/print", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ html }),
      });

      const result = await response.json();

      if (result.success) {
        enqueueSnackbar("Print sent successfully!", { variant: "success" });
      } else {
        enqueueSnackbar("Print failed: " + (result.error || "Unknown error"), {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Print error:", error);
      enqueueSnackbar(
        "Failed to connect to print server. Make sure the print server is running.",
        {
          variant: "error",
        }
      );
    }
  };

  const formattedDate = new Date(
    orderInfo?.orderDate || new Date()
  ).toLocaleString("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-[400px]">
        <div ref={invoiceRef} className="p-4">
          <div className="logo-container flex justify-center mb-4">
            <img src={logo} alt="Logo" className="w-16" />
          </div>

          <h2 className="text-xl font-bold text-center mb-2">Jayanthi Hotel</h2>
          <p className="thank-you text-gray-600 text-center text-sm">
            Thank you for your order!
          </p>

          <div className="order-id mt-4 border-t border-b py-2 text-sm text-gray-700">
            <p>
              <strong>Order ID:</strong> {orderInfo?.orderId ?? "N/A"}
            </p>
          </div>

          <div className="mt-4">
            <h3 className="section-title text-sm font-semibold">
              Items Ordered
            </h3>
            <ul className="items-list text-sm text-gray-700">
              {orderInfo?.items?.map((item, index) => (
                <li
                  key={index}
                  className="item flex justify-between items-center text-xs py-1"
                >
                  <span>
                    {item?.name} x{item?.quantity}
                  </span>
                  <span>Rs {item?.price?.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="totals mt-4 border-t pt-4 text-sm">
            <p className="flex justify-between">
              <strong>Subtotal:</strong>
              <span>Rs {orderInfo?.bills?.total?.toFixed(2)}</span>
            </p>
            <p className="flex justify-between">
              <strong>Tax:</strong>
              <span>Rs {orderInfo?.bills?.tax?.toFixed(2)}</span>
            </p>
            <p className="grand-total flex justify-between text-md font-semibold mt-2">
              <strong>Grand Total:</strong>
              <span>Rs {orderInfo?.bills?.totalPayable?.toFixed(2)}</span>
            </p>
          </div>

          <div className="footer mt-4 border-t border-b py-3 text-center">
            <p className="date text-xs text-gray-600 mb-2">{formattedDate}</p>
            <p className="farewell font-bold text-sm">See You Again!</p>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={handlePrint}
            className="text-blue-500 hover:underline hover:text-blue-600 text-xs px-4 py-2 rounded-lg cursor-pointer"
          >
            Print Receipt
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
