import { useState } from "react";
import { BiSolidDish } from "react-icons/bi";
import { MdCategory, MdTableBar } from "react-icons/md";
import Metrics from "../components/dashboard/Metrics";
import Modal from "../components/dashboard/Modal";
import RecentOrders from "../components/dashboard/RecentOrders";

const buttons = [
  { label: "Add Table", icon: <MdTableBar />, action: "Table" },
  { label: "Add Category", icon: <MdCategory />, action: "Category" },
  { label: "Add Products", icon: <BiSolidDish />, action: "Product" },
];

const tabs = ["Metrics", "Orders"];

const Dashboard = () => {
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Metrics");
  const [modalAction, setModalAction] = useState(null);

  const handleOpenModal = (action) => {
    setModalAction(action);
    if (action === "Table" || action === "Category" || action === "Product") {
      setIsTableModalOpen(true);
    }
  };

  return (
    <div className="bg-[#1f1f1f] md:h-full">
      <div className="container mx-auto flex items-center justify-between py-14 px-6 md:px-4">
        <div className="flex items-center gap-3">
          {buttons.map(({ label, icon, action, id }) => {
            return (
              <button
                id={id}
                key={action}
                onClick={() => handleOpenModal(action)}
                className="bg-[#1a1a1a] hover:bg-[#262626] px-8 py-3 rounded-lg text-[#f5f5f5] font-semibold text-md flex items-center gap-2"
              >
                {label} {icon}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {tabs.map((tab, id) => {
            return (
              <button
                key={id}
                className={`
            px-8 py-3 rounded-lg text-[#f5f5f5] font-semibold text-md flex items-center gap-2 ${
              activeTab === tab
                ? "bg-[#262626]"
                : "bg-[#1a1a1a] hover:bg-[#262626]"
            }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "Metrics" && <Metrics />}
      {activeTab === "Orders" && <RecentOrders />}

      {isTableModalOpen && (
        <Modal
          setIsTableModalOpen={setIsTableModalOpen}
          labelType={modalAction}
        />
      )}
    </div>
  );
};

export default Dashboard;
