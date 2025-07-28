import React, { useState } from "react";
import { BiSolidDish } from "react-icons/bi";
import { CiCircleMore } from "react-icons/ci";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { useDispatch } from "react-redux";
import { setCustomer } from "../../redux/slices/customerSlice";
import { useMutation } from "@tanstack/react-query";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const isActive = (path) => location.pathname === path;

  const handleCreateOrderMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) {
        throw new Error("Customer name is required.");
      }

      return { name, phone };
    },
    onSuccess: (data) => {
      dispatch(setCustomer(data));
      navigate("/tables");
      closeModal();
      setError("");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleCreateRecord = () => {
    // handleCreateOrderMutation.mutate();
  };
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#262626] p-2 h-16 flex justify-around">
      <button
        onClick={() => navigate("/")}
        className={`flex items-center justify-center font-bold ${
          isActive("/") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
        } w-[300px] rounded-[20px]`}
      >
        <FaHome className="inline mr-2" size={20} /> <p>Home</p>
      </button>
      <button
        onClick={() => {
          navigate("/expenses");
          openModal();
        }}
        className={`flex items-center justify-center font-bold ${
          isActive("/expenses")
            ? "text-[#f5f5f5] bg-[#343434]"
            : "text-[#ababab]"
        } w-[300px] rounded-[20px]`}
      >
        <CiCircleMore className="inline mr-2" size={20} /> <p>Expenses</p>
      </button>
      <button
        onClick={() => navigate("/orders")}
        className={`flex items-center justify-center font-bold ${
          isActive("/orders") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
        } w-[300px] rounded-[20px]`}
      >
        <MdOutlineReorder className="inline mr-2" size={20} /> <p>Orders</p>
      </button>
      <button
        onClick={() => navigate("/tables")}
        className={`flex items-center justify-center font-bold ${
          isActive("/tables") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
        } w-[300px] rounded-[20px]`}
      >
        <MdTableBar className="inline mr-2" size={20} /> <p>Tables</p>
      </button>

      <button
        // disabled={isActive("/tables") || isActive("/menu")} // Disable button on menu and tables page
        onClick={() => navigate("/menu")}
        className="absolute bottom-6 bg-[#F6B100] text-[#f5f5f5] rounded-full p-4 items-center"
      >
        <BiSolidDish size={40} />
      </button>
      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Create Record">
        <div>
          <label className="block text-[#ababab] mb-2 text-sm font-medium">
            Description
          </label>
          <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
            <input
              type="text"
              onChange={(e) => setName(e.target.value)}
              placeholder="Description"
              id=""
              className="bg-transparent flex-1 text-white foucus:outline-none"
              required={true}
            />
          </div>
        </div>
        <div>
          <label className="block text-[#ababab] mb-2 text-sm font-medium">
            Amount
          </label>
          <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
            <input
              type="number"
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              id=""
              className="bg-transparent flex-1 text-white foucus:outline-none"
              required={true}
            />
          </div>
        </div>
        <button
          onClick={handleCreateRecord}
          className="w-full bg-[#f6B100] py-3 mt-8 rounded-lg text-[#f5f5f5] hover:text-yellow-700"
        >
          Create Record
        </button>
      </Modal>
    </div>
  );
};

export default BottomNav;
