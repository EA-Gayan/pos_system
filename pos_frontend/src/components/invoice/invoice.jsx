import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { removeAllItems } from "../../redux/slices/cartSlice";
import { enqueueSnackbar } from "notistack";

const Invoice = ({ orderInfo, setShowInvoice }) => {
  const dispatch = useDispatch();
  const hasPrintedRef = useRef(false);

  const handleInvoiceClose = () => {
    setShowInvoice(false);
    dispatch(removeAllItems());
  };

  useEffect(() => {
    if (hasPrintedRef.current) return; // 🔐 BLOCK second run
    hasPrintedRef.current = true;

    const autoPrint = async () => {
      try {
        const response = await fetch("http://localhost:3001/print", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderInfo }),
        });

        const result = await response.json();

        if (result.success) {
          enqueueSnackbar("✓ Receipt printed successfully", {
            variant: "success",
          });

          setTimeout(() => {
            handleInvoiceClose();
          }, 1500);
        } else {
          enqueueSnackbar("Print failed", { variant: "error" });
        }
      } catch {
        enqueueSnackbar("Printer not reachable. Check print server.", {
          variant: "error",
        });
      }
    };

    if (orderInfo) {
      autoPrint();
    }
  }, [orderInfo]);

  return null;
};

export default Invoice;
