import React from "react";
import { BiSolidDish } from "react-icons/bi";
import {
  FaHome,
  FaStar,
} from "react-icons/fa";
import { HiOutlineDocumentReport } from "react-icons/hi";
import {
  MdCategory,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdDashboard,
  MdOutlineFoodBank,
  MdOutlineReorder,
  MdTableBar,
} from "react-icons/md";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const AdminSidebar = ({
  activeSection,
  onSelectSection,
  counts = {},
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const navigate = useNavigate();

  const navItems = [
    {
      group: "MAIN",
      items: [
        {
          id: "overview",
          label: "Dashboard Overview",
          shortLabel: "Overview",
          icon: <MdDashboard className="text-xl" />,
          path: "/dashboard",
        },
      ],
    },
    {
      group: "CATALOG & MENU",
      items: [
        {
          id: "categories",
          label: "Categories",
          shortLabel: "Categories",
          icon: <MdCategory className="text-xl" />,
          count: counts.categories,
          path: "/dashboard/categories",
        },
        {
          id: "items",
          label: "Products & Items",
          shortLabel: "Products",
          icon: <BiSolidDish className="text-xl" />,
          count: counts.products,
          path: "/dashboard/items",
        },
        {
          id: "tables",
          label: "Dining Tables",
          shortLabel: "Tables",
          icon: <MdTableBar className="text-xl" />,
          count: counts.tables,
          path: "/dashboard/tables",
        },
      ],
    },
    {
      group: "REPORTS & SALES",
      items: [
        {
          id: "session-sales",
          label: "Today's Session Sales",
          shortLabel: "Session Sales",
          icon: <MdOutlineFoodBank className="text-xl" />,
          count: counts.todaySessionSold,
          path: "/dashboard/session-sales",
        },
        {
          id: "reports",
          label: "Reports & Downloads",
          shortLabel: "Reports",
          icon: <HiOutlineDocumentReport className="text-xl" />,
          path: "/dashboard/reports",
        },
        {
          id: "best-selling",
          label: "Best Selling Items",
          shortLabel: "Best Sellers",
          icon: <FaStar className="text-lg" />,
          path: "/dashboard/best-selling",
        },
      ],
    },
    {
      group: "QUICK ACCESS",
      items: [
        {
          id: "expenses",
          label: "Expenses Record",
          shortLabel: "Expenses",
          icon: <RiMoneyDollarCircleLine className="text-xl" />,
          action: () => navigate("/expenses"),
        },
        {
          id: "orders",
          label: "Live Orders",
          shortLabel: "Orders",
          icon: <MdOutlineReorder className="text-xl" />,
          action: () => navigate("/orders"),
        },
      ],
    },
  ];

  const handleNavClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      onSelectSection(item.id);
    }
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#181818] border-r border-[#2d2d2d] text-gray-300 select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#2d2d2d] flex items-center justify-between shrink-0">
        <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? "justify-center w-full" : ""}`}>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#f6b100] to-amber-500 flex items-center justify-center text-black font-extrabold text-lg shadow-md shrink-0">
            A
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white tracking-wide truncate">
                Admin Panel
              </h2>
              <p className="text-[11px] text-gray-400 truncate">
                Jayanthi Hotel POS
              </p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#262626] cursor-pointer"
          title="Close Navigation"
        >
          <MdClose className="text-xl" />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-4 scrollbar-thin scrollbar-thumb-[#333]">
        {navItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2.5 mb-1.5">
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const isSelected = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-150 cursor-pointer text-left group ${
                    isSelected
                      ? "bg-[#282828] text-[#f6b100] font-semibold shadow-inner border-l-4 border-[#f6b100]"
                      : "text-gray-400 hover:text-gray-100 hover:bg-[#222222]"
                  } ${isCollapsed ? "justify-center px-2" : ""}`}
                >
                  <span
                    className={`shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                      isSelected ? "text-[#f6b100]" : "text-gray-400 group-hover:text-gray-200"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!isCollapsed && item.count !== undefined && item.count !== null && (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        isSelected
                          ? "bg-[#f6b100]/20 text-[#f6b100]"
                          : "bg-[#262626] text-gray-400 group-hover:text-gray-200"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-[#2d2d2d] shrink-0 space-y-2 bg-[#141414]">
        {/* Return to POS button */}
        <button
          onClick={() => navigate("/tables")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#222222] transition cursor-pointer ${
            isCollapsed ? "justify-center px-2" : ""
          }`}
          title="Return to Cashier / Dining Tables"
        >
          <FaHome className="text-base text-[#f6b100] shrink-0" />
          {!isCollapsed && <span className="truncate">Back to POS</span>}
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex w-full items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-[#1f1f1f] transition cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <MdChevronRight className="text-lg" />
          ) : (
            <>
              <MdChevronLeft className="text-lg" />
              <span className="text-[11px] font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block h-full transition-all duration-300 ease-in-out shrink-0 z-20 ${
          isCollapsed ? "w-18" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-xs z-50 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Off-canvas Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default AdminSidebar;
