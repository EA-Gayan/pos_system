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
    isError,
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
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg">
      {isLoading ? (
        <div className="flex justify-center items-center h-32 mt-30">
          <FullScreenLoader />
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" /> {/* match backend */}
              <YAxis />
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
        </>
      )}
    </div>
  );
};

export default WeeklyFinanceChart;
