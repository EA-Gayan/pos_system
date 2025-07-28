import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { addExpenseRecord, updateExpenseRecord } from "../../https";

const Modal = ({ currentData, onRecordAdded, onClose }) => {
  const [recordId, setRecordId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  // createRecordMutation section
  const createRecordMutation = useMutation({
    mutationFn: (reqData) => addExpenseRecord(reqData),
    onSuccess: (res) => {
      setDescription("");
      setAmount("");
      onClose();
      enqueueSnackbar("Record added successfully!", { variant: "success" });
      if (onClose) onClose(); // Close the modal
      if (onRecordAdded) {
        onRecordAdded();
      }
    },
    onError: (err) => {
      enqueueSnackbar("Failed to add record!", { variant: "error" });
    },
  });

  const updateRecordMutation = useMutation({
    mutationFn: (recordId) => updateExpenseRecord(recordId),
    onSuccess: () => {
      setDescription("");
      setAmount("");
      onClose();
      enqueueSnackbar("Record updated successfully!", { variant: "success" });
      if (onClose) onClose(); // Close the modal
      if (onRecordAdded) {
        onRecordAdded();
      }
    },
    onError: () => {
      enqueueSnackbar("Failed to updated record!", { variant: "error" });
    },
  });

  const handleCreateRecord = () => {
    if (!description.trim() || !amount) {
      enqueueSnackbar("Both description and amount are required.", {
        variant: "error",
      });
      return;
    }

    const amountValue = parseInt(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      enqueueSnackbar("Amount must be a positive integer.", {
        variant: "error",
      });
      return;
    }

    const data = {
      description,
      amount: amountValue,
    };

    createRecordMutation.mutate(data);
  };

  const handleUpdateRecord = () => {
    if (!description.trim() || !amount) {
      enqueueSnackbar("Both description and amount are required.", {
        variant: "error",
      });
      return;
    }

    const amountValue = parseInt(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      enqueueSnackbar("Amount must be a positive integer.", {
        variant: "error",
      });
      return;
    }

    const data = {
      description,
      amount: amountValue,
    };

    updateRecordMutation.mutate({ recordId, data });
  };

  const handleClose = () => {
    setDescription("");
    setAmount("");
    setRecordId("");
    if (onClose) onClose();
  };

  useEffect(() => {
    if (currentData) {
      setRecordId(currentData._id ?? "");
      setDescription(currentData.description ?? "");
      setAmount(currentData.amount?.toString() ?? "");
    }
  }, [currentData]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-[#1a1a1a] rounded-lg shadow-lg w-full max-w-lg mx-4"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-b-[#333]">
          <h2 className="text-xl text-[#f5f5f5] font-semibold">
            {currentData != null ? "Update Expenses" : "Add Expenses"}
          </h2>
          <button
            className="text-gray-500 text-2xl hover:text-gray-800"
            onClick={handleClose}
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Description
            </label>
            <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="bg-transparent flex-1 text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Amount
            </label>
            <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                className="bg-transparent flex-1 text-white focus:outline-none"
                required
                min="1"
              />
            </div>
          </div>

          {currentData != null ? (
            <button
              onClick={handleUpdateRecord}
              className="w-full bg-[#f6B100] py-3 mt-8 rounded-lg text-[#1a1a1a] font-semibold hover:bg-yellow-400 transition-colors"
            >
              Update Expenses
            </button>
          ) : (
            <button
              onClick={handleCreateRecord}
              className="w-full bg-[#f6B100] py-3 mt-8 rounded-lg text-[#1a1a1a] font-semibold hover:bg-yellow-400 transition-colors"
            >
              Add Expenses
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Modal;
