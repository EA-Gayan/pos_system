import { useState } from "react";
import { BiSolidDish } from "react-icons/bi";
import { MdCategory, MdTableBar } from "react-icons/md";
import Metrics from "../components/dashboard/Metrics";
import Modal from "../components/dashboard/Modal";
import WeeklyFinanceChart from "../components/dashboard/WeeklyFinanceChart";

const buttons = [
  { label: "Add Table", icon: <MdTableBar />, action: "Table" },
  { label: "Add Category", icon: <MdCategory />, action: "Category" },
  { label: "Add Products", icon: <BiSolidDish />, action: "Product" },
];

const tabs = ["Metrics", "View Report"];

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
    <div className="bg-[#1f1f1f] min-h-screen flex flex-col pb-20 md:pb-0">
      <div className="container mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between py-4 sm:py-8 px-3 sm:px-6 gap-3 sm:gap-4">
        {/* Action Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {buttons.map(({ label, icon, action, id }) => {
            return (
              <button
                id={id}
                key={action}
                onClick={() => handleOpenModal(action)}
                className="bg-[#1a1a1a] hover:bg-[#262626] px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-[#f5f5f5] font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer transition-colors shadow"
              >
                <span>{label}</span>
                <span className="text-base">{icon}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-[#1a1a1a] p-1 rounded-xl w-full md:w-auto">
          {tabs.map((tab, id) => {
            return (
              <button
                key={id}
                className={`flex-1 md:flex-none justify-center px-4 sm:px-8 py-2 sm:py-2.5 rounded-lg text-[#f5f5f5] font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all ${
                  activeTab === tab
                    ? "bg-[#262626] text-[#f6b100] shadow"
                    : "hover:bg-[#262626] text-gray-400"
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
      {activeTab === "View Report" && <WeeklyFinanceChart />}

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
