import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getWeeklyData } from "../../https";
import FullScreenLoader from "../shared/FullScreenLoader";

const WeeklyFinanceChart = () => {
  const {
    data: resData,
    isLoading,
  } = useQuery({
    queryKey: ["weeklyOrders"],
    queryFn: getWeeklyData,
    keepPreviousData: true,
    onError: () => {
      enqueueSnackbar("Failed to fetch data", { variant: "error" });
    },
  });

  const data = resData?.data?.data || [];

  return (
    <div className="container mx-auto bg-[#262626] p-2 sm:p-4 rounded-lg mb-20 md:mb-0">
      {isLoading ? (
        <div className="flex justify-center items-center h-32 mt-20 sm:mt-30">
          <FullScreenLoader />
        </div>
      ) : (
        <>
          <div className="w-full h-[280px] sm:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#4CAF50"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#F44336"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default WeeklyFinanceChart;
