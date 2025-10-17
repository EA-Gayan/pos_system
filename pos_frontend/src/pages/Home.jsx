import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { BsCashCoin } from "react-icons/bs";
import { GrBasket } from "react-icons/gr";
import Greetings from "../components/home/Greetings";
import MiniCard from "../components/home/MiniCard";
import RecentOrders from "../components/home/RecentOrders";
import { getOrderEarning, getOrdersCount, getRecentOrders } from "../https";

const Home = () => {
  const periodData = { period: "today" };

  const { data: earningsData, isError: isEarningsError } = useQuery({
    queryKey: ["orderEarnings", periodData],
    queryFn: () => getOrderEarning(periodData),
    onError: () => {
      enqueueSnackbar("Failed to fetch earnings!", { variant: "error" });
    },
  });

  const { data: orderCountData, isError: isOrderCountError } = useQuery({
    queryKey: ["orderCount", periodData],
    queryFn: () => getOrdersCount(periodData),
    onError: () => {
      enqueueSnackbar("Failed to fetch orders count!", { variant: "error" });
    },
  });

  const { data: recentOrdersData, isError: isRecentOrdersError } = useQuery({
    queryKey: ["recentOrders"],
    queryFn: getRecentOrders,
    onError: () => {
      enqueueSnackbar("Failed to fetch recent orders!", { variant: "error" });
    },
  });

  // Safely access deeply nested values
  const totalEarning = earningsData?.data?.totalEarnings ?? 0;
  const percentage = earningsData?.data?.percentChange ?? 0;
  const orderCount = orderCountData?.data?.data ?? 0;
  const recentOrders = recentOrdersData?.data?.data ?? [];

  return (
    <section className="bg-[#1f1f1f] h-screen p-6 overflow-y-auto">
      <div className="flex-[3] space-y-6">
        <Greetings />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <MiniCard
            title="Today Earnings"
            icon={<BsCashCoin />}
            number={totalEarning}
            footerNum={
              <span style={{ color: percentage < 0 ? "red" : "inherit" }}>
                {percentage} %
              </span>
            }
          />

          <MiniCard
            title="Today Orders Count"
            icon={<GrBasket />}
            number={orderCount}
          />
        </div>

        {/* Only this section is modified for scrolling */}
        <div className="h-[calc(100vh-420px)] overflow-y-auto">
          <RecentOrders orders={recentOrders} />
        </div>
      </div>

      {/* Optional Right Section */}
      {/* <div className="flex-[2] pb-20">
        <PopularDishes />
      </div> */}
    </section>
  );
};

export default Home;
