import React, { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { MdMenu } from "react-icons/md";

// Sub-components
import AdminSidebar from "../components/dashboard/AdminSidebar";
import AdminOverviewView from "../components/dashboard/AdminOverviewView";
import AdminCategoriesView from "../components/dashboard/AdminCategoriesView";
import AdminProductsView from "../components/dashboard/AdminProductsView";
import AdminTablesView from "../components/dashboard/AdminTablesView";
import AdminReportsView from "../components/dashboard/AdminReportsView";
import AdminSessionSalesView from "../components/dashboard/AdminSessionSalesView";
import WeeklyFinanceChart from "../components/dashboard/WeeklyFinanceChart";
import BestSelling from "../components/dashboard/BestSelling";
import Modal from "../components/dashboard/Modal";
import EditModal from "../components/dashboard/EditModal";
import ConfirmationPopup from "../components/shared/ConfirmationPopup";
import FullScreenLoader from "../components/shared/FullScreenLoader";

// APIs
import {
  deleteCategory,
  deleteProduct,
  deleteTable,
  exportExpenseRecord,
  exportIncomeRecord,
  getBestSellingProducts,
  getCategories,
  getDashboardItemsData,
  getOrderEarning,
  getOrdersCount,
  getTables,
  getTodaySessionSales,
  getTotalExpenses,
} from "../https";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { section: urlSection } = useParams();
  const queryClient = useQueryClient();

  // Layout & UI State
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("admin_sidebar_collapsed") === "true";
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState(null); // "Table" | "Category" | "Product"
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalType, setEditModalType] = useState(null);
  const [selectedEditRow, setSelectedEditRow] = useState(null);

  // Delete Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    type: null, // "category" | "product" | "table"
    id: null,
    title: "",
  });

  // Persist sidebar collapsed state
  useEffect(() => {
    localStorage.setItem("admin_sidebar_collapsed", isCollapsed ? "true" : "false");
  }, [isCollapsed]);

  // Determine active section from URL
  const activeSection = useMemo(() => {
    const pathname = location.pathname.toLowerCase();

    if (pathname.includes("best-selling")) return "best-selling";
    if (pathname.includes("session-sales")) return "session-sales";
    if (pathname.includes("total-categories") || pathname.includes("/categories"))
      return "categories";
    if (
      pathname.includes("total-items") ||
      pathname.includes("/items") ||
      pathname.includes("/products")
    )
      return "items";
    if (pathname.includes("total-tables") || pathname.includes("/tables"))
      return "tables";
    if (pathname.includes("reports") || pathname.includes("view-report"))
      return "reports";

    if (urlSection === "session-sales") return "session-sales";
    if (urlSection === "total-categories" || urlSection === "categories")
      return "categories";
    if (urlSection === "total-items" || urlSection === "items")
      return "items";
    if (urlSection === "total-tables" || urlSection === "tables")
      return "tables";
    if (urlSection === "best-selling") return "best-selling";
    if (urlSection === "reports") return "reports";

    return "overview";
  }, [location.pathname, urlSection]);

  // Navigation handler
  const handleSelectSection = (sectionId) => {
    if (sectionId === "overview") {
      navigate("/dashboard");
    } else if (sectionId === "categories") {
      navigate("/dashboard/categories");
    } else if (sectionId === "items") {
      navigate("/dashboard/items");
    } else if (sectionId === "tables") {
      navigate("/dashboard/tables");
    } else if (sectionId === "session-sales") {
      navigate("/dashboard/session-sales");
    } else if (sectionId === "reports") {
      navigate("/dashboard/reports");
    } else if (sectionId === "best-selling") {
      navigate("/dashboard/best-selling");
    } else if (sectionId === "orders") {
      navigate("/orders");
    } else if (sectionId === "expenses") {
      navigate("/expenses");
    }
  };

  // Switch to products view filtered by a specific category
  const handleViewCategoryProducts = (categoryId) => {
    setProductCategoryFilter(categoryId);
    navigate("/dashboard/items");
  };

  // Queries
  const { data: categoriesRes, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: tablesRes, isLoading: isTablesLoading } = useQuery({
    queryKey: ["total-tables"],
    queryFn: getTables,
  });

  const { data: dashboardItemsRes, isLoading: isItemsLoading } = useQuery({
    queryKey: ["dashboardItemsData"],
    queryFn: getDashboardItemsData,
  });

  const periodData = { period: "today" };

  const { data: earningsData } = useQuery({
    queryKey: ["orderEarnings", periodData],
    queryFn: () => getOrderEarning(periodData),
  });

  const { data: expensesData } = useQuery({
    queryKey: ["orderExpenses", periodData],
    queryFn: () => getTotalExpenses(periodData),
  });

  const { data: orderCountData } = useQuery({
    queryKey: ["orderCount", periodData],
    queryFn: () => getOrdersCount(periodData),
  });

  const { data: bestSellingRes } = useQuery({
    queryKey: ["bestSelling", periodData],
    queryFn: () => getBestSellingProducts("today"),
  });

  const {
    data: sessionSalesRes,
    isLoading: isSessionSalesLoading,
    refetch: refetchSessionSales,
  } = useQuery({
    queryKey: ["todaySessionSales"],
    queryFn: getTodaySessionSales,
  });

  // Extracted Data
  const categories = useMemo(
    () => categoriesRes?.data?.data || [],
    [categoriesRes]
  );
  const tables = useMemo(() => tablesRes?.data?.data || [], [tablesRes]);
  const dashboardItemDetails = useMemo(
    () => dashboardItemsRes?.data?.data || dashboardItemsRes?.data || [],
    [dashboardItemsRes]
  );
  const bestSellingList = useMemo(
    () => bestSellingRes?.data?.data || [],
    [bestSellingRes]
  );
  const sessionSalesData = useMemo(
    () => sessionSalesRes?.data?.data || null,
    [sessionSalesRes]
  );

  // Counts for sidebar badges
  const counts = useMemo(() => {
    const rawCategoriesCount =
      dashboardItemDetails.find((d) => d.key === "categories")?.count ??
      categories.length;
    const rawProductsCount =
      dashboardItemDetails.find((d) => d.key === "products")?.count ??
      categories.flatMap((c) => c.products || []).length;
    const rawTablesCount =
      dashboardItemDetails.find((d) => d.key === "tables")?.count ??
      tables.length;
    const rawActiveOrders =
      dashboardItemDetails.find((d) => d.key === "inProgressOrders")?.count ??
      0;
    const rawSessionSold =
      sessionSalesData?.summary?.totalItemsSold ?? 0;

    return {
      categories: rawCategoriesCount,
      products: rawProductsCount,
      tables: rawTablesCount,
      inProgressOrders: rawActiveOrders,
      todaySessionSold: rawSessionSold,
    };
  }, [dashboardItemDetails, categories, tables, sessionSalesData]);

  const totalEarnings = earningsData?.data?.totalEarnings ?? 0;
  const totalExpenses = expensesData?.data?.totalExpenses ?? 0;
  const totalOrders = orderCountData?.data?.data ?? 0;

  // Add Modal Handler
  const handleOpenAddModal = (type) => {
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  // Edit Modal Handler
  const handleOpenEditModal = (type, rowData) => {
    setEditModalType(type);
    setSelectedEditRow(rowData);
    setIsEditModalOpen(true);
  };

  // Delete Request Handler
  const handleRequestDelete = (type, id, title) => {
    setDeleteConfirmation({
      isOpen: true,
      type,
      id,
      title: title || `${type} #${id}`,
    });
  };

  // Delete Mutations
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      enqueueSnackbar("Category deleted successfully!", { variant: "success" });
      setDeleteConfirmation({ isOpen: false, type: null, id: null, title: "" });
      queryClient.invalidateQueries(["categories"]);
      queryClient.invalidateQueries(["dashboardItemsData"]);
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to delete category!",
        { variant: "error" }
      );
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      enqueueSnackbar("Product deleted successfully!", { variant: "success" });
      setDeleteConfirmation({ isOpen: false, type: null, id: null, title: "" });
      queryClient.invalidateQueries(["categories"]);
      queryClient.invalidateQueries(["dashboardItemsData"]);
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to delete product!",
        { variant: "error" }
      );
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      enqueueSnackbar("Table deleted successfully!", { variant: "success" });
      setDeleteConfirmation({ isOpen: false, type: null, id: null, title: "" });
      queryClient.invalidateQueries(["total-tables"]);
      queryClient.invalidateQueries(["dashboardItemsData"]);
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to delete table!",
        { variant: "error" }
      );
    },
  });

  const handleConfirmDelete = () => {
    const { type, id } = deleteConfirmation;
    if (!id) return;

    if (type === "category") {
      deleteCategoryMutation.mutate(id);
    } else if (type === "product") {
      deleteProductMutation.mutate(id);
    } else if (type === "table") {
      deleteTableMutation.mutate(id);
    }
  };

  // Export Mutations
  const exportIncomeMutation = useMutation({
    mutationFn: (type) => exportIncomeRecord(type),
    onSuccess: (response) => {
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-");
      link.download = `income_report_${dateStr}_${timeStr}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      enqueueSnackbar("Income report exported successfully!", {
        variant: "success",
      });
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to export income record",
        { variant: "error" }
      );
    },
  });

  const exportExpenseMutation = useMutation({
    mutationFn: (type) => exportExpenseRecord(type),
    onSuccess: (response) => {
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-");
      link.download = `expense_report_${dateStr}_${timeStr}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      enqueueSnackbar("Expense report exported successfully!", {
        variant: "success",
      });
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to export expense record",
        { variant: "error" }
      );
    },
  });

  const isDataLoading =
    isCategoriesLoading || isTablesLoading || isItemsLoading;

  return (
    <div className="flex h-full w-full bg-[#121212] overflow-hidden">
      {/* Left Navigation Sidebar */}
      <AdminSidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        counts={counts}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-[#121212]">
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#181818] border-b border-[#2d2d2d] shrink-0">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="flex items-center gap-2 text-gray-300 hover:text-white p-1 rounded-lg bg-[#242424] px-2.5 py-1.5 cursor-pointer"
          >
            <MdMenu className="text-lg text-[#f6b100]" />
            <span className="text-xs font-semibold">Admin Nav</span>
          </button>
          <span className="text-xs font-bold text-[#f6b100] uppercase tracking-wider">
            {activeSection.replace("-", " ")}
          </span>
        </div>

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 min-h-0 scrollbar-thin scrollbar-thumb-[#2d2d2d]">
          {isDataLoading && activeSection === "overview" ? (
            <div className="flex items-center justify-center h-64">
              <FullScreenLoader />
            </div>
          ) : (
            <>
              {activeSection === "overview" && (
                <AdminOverviewView
                  counts={counts}
                  earnings={totalEarnings}
                  expenses={totalExpenses}
                  ordersCount={totalOrders}
                  bestSellingCount={bestSellingList.length}
                  sessionSalesSummary={sessionSalesData?.summary}
                  onSelectSection={handleSelectSection}
                />
              )}

              {activeSection === "session-sales" && (
                <AdminSessionSalesView
                  sessionSalesData={sessionSalesData}
                  isLoading={isSessionSalesLoading}
                  onRefresh={refetchSessionSales}
                />
              )}

              {activeSection === "categories" && (
                <AdminCategoriesView
                  categories={categories}
                  isLoading={isCategoriesLoading}
                  onOpenAddModal={handleOpenAddModal}
                  onOpenEditModal={handleOpenEditModal}
                  onRequestDelete={handleRequestDelete}
                  onViewCategoryProducts={handleViewCategoryProducts}
                />
              )}

              {activeSection === "items" && (
                <AdminProductsView
                  categories={categories}
                  initialCategoryFilter={productCategoryFilter}
                  onOpenAddModal={handleOpenAddModal}
                  onOpenEditModal={handleOpenEditModal}
                  onRequestDelete={handleRequestDelete}
                />
              )}

              {activeSection === "tables" && (
                <AdminTablesView
                  tables={tables}
                  isLoading={isTablesLoading}
                  onOpenAddModal={handleOpenAddModal}
                  onOpenEditModal={handleOpenEditModal}
                  onRequestDelete={handleRequestDelete}
                />
              )}

              {activeSection === "reports" && (
                <AdminReportsView
                  onExportIncome={(type) => exportIncomeMutation.mutate(type)}
                  onExportExpense={(type) => exportExpenseMutation.mutate(type)}
                  isExportingIncome={exportIncomeMutation.isPending}
                  isExportingExpense={exportExpenseMutation.isPending}
                  earnings={totalEarnings}
                  expenses={totalExpenses}
                  ordersCount={totalOrders}
                />
              )}

              {activeSection === "best-selling" && (
                <div className="flex flex-col space-y-4">
                  <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-2xl p-4 sm:p-5 shadow-sm">
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                      Best Selling Products
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                      Top performing items ranked by sales volume and income.
                    </p>
                  </div>
                  <BestSelling products={bestSellingList} />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <Modal
          setIsTableModalOpen={setIsAddModalOpen}
          labelType={addModalType}
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedEditRow && (
        <EditModal
          setIsTableModalOpen={setIsEditModalOpen}
          labelType={editModalType}
          currentData={selectedEditRow}
        />
      )}

      {/* Delete Confirmation Popup */}
      {deleteConfirmation.isOpen && (
        <ConfirmationPopup
          title={`Delete ${deleteConfirmation.type}`}
          message={`Are you sure you want to delete "${deleteConfirmation.title}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() =>
            setDeleteConfirmation({
              isOpen: false,
              type: null,
              id: null,
              title: "",
            })
          }
        />
      )}
    </div>
  );
};

export default Dashboard;
