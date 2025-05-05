import React, { useState } from "react";
import { BiSolidDish } from "react-icons/bi";
import { CiCircleMore } from "react-icons/ci";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "./Modal";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestCount, setGuestCount] = useState(0);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const isActive = (path) => location.pathname === path;

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
        onClick={() => navigate("/menu")}
        className="flex items-center justify-center font-bold text-[#ababab] w-[300px]"
      >
        <CiCircleMore className="inline mr-2" size={20} /> <p>Menu</p>
      </button>

      <button
        disabled={isActive("/tables") || isActive("/menu")}
        onClick={openModal}
        className="absolute bottom-6 bg-[#F6B100] text-[#f5f5f5] rounded-full p-4 items-center"
      >
        <BiSolidDish size={40} />
      </button>
      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Create Order">
        <div>
          <label className="block text-[#ababab] mb-2 text-sm font-medium">
            Customer Name
          </label>
          <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
            <input
              type="text"
              name=""
              placeholder="Customer Name"
              id=""
              className="bg-transparent flex-1 text-white foucus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
            Customer Phone
          </label>
          <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
            <input
              type="text"
              name=""
              placeholder="+94 77 123 4567"
              id=""
              className="bg-transparent flex-1 text-white foucus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
            Guest
          </label>
          <div className="flex items-center justify-between bg-[#1f1f1f] rounded-lg py-3 px-4">
            <button
              onClick={() => setGuestCount((pre) => pre - 1)}
              className="text-yellow-500 text-2xl"
            >
              &minus;
            </button>
            <span className="text-white">{guestCount} Person</span>
            <button
              onClick={() => setGuestCount((pre) => pre + 1)}
              className="text-yellow-500 text-2xl"
            >
              &#43;
            </button>
          </div>
        </div>
        <button
          onClick={() => {
            navigate("/tables");
          }}
          className="w-full bg-[#f6B100] py-3 mt-8 rounded-lg text-[#f5f5f5] hover:text-yellow-700"
        >
          Create orders
        </button>
      </Modal>
    </div>
  );
};

export default BottomNav;
