import React, { useEffect, useState } from "react";
import { itemsData, metricsData } from "../../constants";
import { getDashboardItemsData } from "../../https";
import { enqueueSnackbar } from "notistack";
import FullScreenLoader from "../shared/FullScreenLoader";

const Metrics = () => {
  const [dashboardItemDetails, setDashboardItemDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardItemDetails();
  }, []);

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
            <button className="flex items-center gap-1 px-4 py-2 rounded-md text-[#f5f5f5] bg-[#1a1a1a]">
              Last 1 Month
              <svg
                className="w-3 h-3"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="4"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {metricsData.map((metric, index) => {
              return (
                <div
                  key={index}
                  className="shadow-sm rounded-lg p-4"
                  style={{ backgroundColor: metric.color }}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-xs text-[#f5f5f5]">
                      {metric.title}
                    </p>
                    <div className="flex items-center gap-1">
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
                    </div>
                  </div>
                  <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">
                    {metric.value}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Metrics;
