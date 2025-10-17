import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { metricsData } from "../../constants";
import {
  exportIncomeRecord,
  getDashboardItemsData,
  getOrderEarning,
  getOrdersCount,
  getTotalExpenses,
  exportExpenseRecord,
} from "../../https";
import FullScreenLoader from "../shared/FullScreenLoader";
import { useMutation, useQuery } from "@tanstack/react-query";

const Metrics = () => {
  const [dashboardItemDetails, setDashboardItemDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [expenseExport, setExpenseExport] = useState(false);

  const navigate = useNavigate();
  const handleClick = (sectionName) => {
    if (sectionName === "Active Orders") return null;
    navigate(`/dashboard/${sectionName}`);
  };
  const periodData = { period: "today" };

  useEffect(() => {
    fetchDashboardItemDetails();
  }, []);

  const { data: earningsData, isError: isEarningsError } = useQuery({
    queryKey: ["orderEarnings", periodData],
    queryFn: () => getOrderEarning(periodData),
    onError: () => {
      enqueueSnackbar("Failed to fetch earnings!", { variant: "error" });
    },
  });

  const { data: expensesData, isError: isExpensesError } = useQuery({
    queryKey: ["orderExpenses", periodData],
    queryFn: () => getTotalExpenses(periodData),
    onError: () => {
      enqueueSnackbar("Failed to fetch expenses!", { variant: "error" });
    },
  });

  const { data: orderCountData, isError: isOrderCountError } = useQuery({
    queryKey: ["orderCount", periodData],
    queryFn: () => getOrdersCount(periodData),
    onError: () => {
      enqueueSnackbar("Failed to fetch orders count!", { variant: "error" });
    },
  });
  const totalEarning = earningsData?.data?.totalEarnings ?? 0;
  const totalExpenses = expensesData?.data?.totalExpenses ?? 0;
  const totalOrders = orderCountData?.data?.data ?? 0;

  const exportRecordMutation = useMutation({
    mutationFn: (type) => exportIncomeRecord(type),
    onSuccess: (response) => {
      const fileUrl = response?.data?.fileUrl;
      if (!fileUrl) {
        enqueueSnackbar("Exported but no file URL returned.", {
          variant: "warning",
        });
        return;
      }

      const fullUrl = fileUrl.startsWith("/")
        ? `${import.meta.env.VITE_API_URL}${fileUrl}`
        : fileUrl;

      // Trigger download
      const link = document.createElement("a");
      link.href = fullUrl;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      link.remove();

      enqueueSnackbar("Record exported successfully!", { variant: "success" });
      refetch();
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      enqueueSnackbar(errorMessage, { variant: "error" });
    },
  });

  const exportExpenseRecordMutation = useMutation({
    mutationFn: (type) => exportExpenseRecord(type), // should return JSON with fileUrl
    onSuccess: (response) => {
      const fileUrl = response?.data?.fileUrl;
      if (!fileUrl) {
        enqueueSnackbar("Exported but no file URL returned.", {
          variant: "warning",
        });
        return;
      }

      const fullUrl = fileUrl.startsWith("/")
        ? `${import.meta.env.VITE_API_URL}${fileUrl}`
        : fileUrl;

      // Trigger download
      const link = document.createElement("a");
      link.href = fullUrl;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      link.remove();

      enqueueSnackbar("Record exported successfully!", { variant: "success" });
      refetch();
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      enqueueSnackbar(errorMessage, { variant: "error" });
    },
  });

  const fetchDashboardItemDetails = async () => {
    try {
      const data = await getDashboardItemsData();
      setDashboardItemDetails(data.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      enqueueSnackbar("Something went wrong!", {
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (type) => {
    setExportOpen(false);
    exportRecordMutation.mutate(type);
  };

  const handleExpenseExport = (type) => {
    setExpenseExport(false);
    exportExpenseRecordMutation.mutate(type);
  };

  return (
    <div className="container mx-auto py-2 px-6 md:px-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-32 mt-30">
          <FullScreenLoader />
        </div>
      ) : (
        <>
          <div className="flex flex-col justify-between ">
            <div>
              <h2 className="font-semibold text-[#f5f5f5] text-xl">
                Item Details
              </h2>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {dashboardItemDetails.length > 0 &&
                dashboardItemDetails.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className="shadow-sm rounded-lg p-4"
                      style={{ backgroundColor: item.color }}
                      onClick={() => handleClick(item.title)}
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-xs text-[#f5f5f5]">
                          {item.title}
                        </p>
                      </div>
                      <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">
                        {item.count}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="flex justify-between items-center mt-12">
            <div>
              <h2 className="font-semibold text-[#f5f5f5] text-xl ">
                Overall Performance
              </h2>
            </div>
            {/* Export Dropdown */}
            <div className="flex items-center space-x-4 relative">
              {/* Export Income Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setExportOpen((prev) => !prev);
                    setExpenseExport(false);
                  }}
                  className="bg-[#f6B100] text-[#1a1a1a] font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400"
                >
                  Export Income
                </button>
                {exportOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
                    <button
                      onClick={() => handleExport("today")}
                      className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 bg-[#000]"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => handleExport("week")}
                      className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 bg-[#000]"
                    >
                      This Week
                    </button>
                  </div>
                )}
              </div>

              {/* Export Expense Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setExpenseExport((prev) => !prev);
                    setExportOpen(false);
                  }}
                  className="bg-[#f6B100] text-[#1a1a1a] font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400"
                >
                  Export Expense
                </button>
                {expenseExport && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
                    <button
                      onClick={() => handleExpenseExport("today")}
                      className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 bg-[#000]"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => handleExpenseExport("week")}
                      className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 bg-[#000]"
                    >
                      This Week
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              className="shadow-sm rounded-lg p-4"
              style={{ backgroundColor: "#025cca" }}
            >
              <div className="flex justify-between items-center">
                <p className="font-medium text-xs text-[#f5f5f5]">
                  Today Income
                </p>
                {/* <div className="flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        style={{ color: metric.isIncrease ? "#f5f5f5" : "red" }}
                      >
                        <path
                          d={
                            metric.isIncrease
                              ? "M5 15l7-7 7 7"
                              : "M19 9l-7 7-7-7"
                          }
                        />
                      </svg>
                      <p
                        className="font-medium text-xs"
                        style={{ color: metric.isIncrease ? "#f5f5f5" : "red" }}
                      >
                        {metric.percentage}
                      </p>
                    </div> */}
              </div>
              <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">
                {totalEarning}
              </p>
            </div>
            <div
              className="shadow-sm rounded-lg p-4"
              style={{ backgroundColor: "#02ca3a" }}
            >
              <div className="flex justify-between items-center">
                <p className="font-medium text-xs text-[#f5f5f5]">
                  Today Expense
                </p>
              </div>
              <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">
                {totalExpenses}
              </p>
            </div>
            <div
              className="shadow-sm rounded-lg p-4"
              style={{ backgroundColor: "#be3e3f" }}
            >
              <div className="flex justify-between items-center">
                <p className="font-medium text-xs text-[#f5f5f5]">
                  Today Orders Count
                </p>
              </div>
              <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">
                {totalOrders}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Metrics;
