import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { BsCashCoin } from "react-icons/bs";
import { GrBasket } from "react-icons/gr";
import { MdOutlineTrendingUp } from "react-icons/md";
import { FaHome } from "react-icons/fa";
import Greetings from "../components/home/Greetings";
import MiniCard from "../components/home/MiniCard";
import RecentOrders from "../components/home/RecentOrders";
import { getOrderEarning, getOrdersCount, getRecentOrders } from "../https";

const Home = () => {
  const periodData = { period: "today" };

  const { data: earningsData } = useQuery({
    queryKey: ["orderEarnings", periodData],
    queryFn: () => getOrderEarning(periodData),
    onError: () => {
      enqueueSnackbar("Failed to fetch earnings!", { variant: "error" });
    },
  });

  const { data: orderCountData } = useQuery({
    queryKey: ["orderCount", periodData],
    queryFn: () => getOrdersCount(periodData),
    onError: () => {
      enqueueSnackbar("Failed to fetch orders count!", { variant: "error" });
    },
  });

  const { data: recentOrdersData } = useQuery({
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

  // Average order value
  const avgOrderValue =
    orderCount > 0 ? Math.round(totalEarning / orderCount) : 0;

  return (
    <section className="bg-gradient-to-br from-[#1c1c1c] via-[#171717] to-[#222222] h-full flex flex-col min-h-0 overflow-hidden">
      {/* Sub-Header matching Menu Page structure & alignment */}
      <div className="flex items-center justify-between px-3 sm:px-8 md:px-10 py-3 sm:py-4 flex-none bg-[#1a1a1a] shadow-md border-b border-[#2c2c2c]">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-[#f6b100] text-[#1a1a1a] p-2 sm:p-2.5 rounded-xl text-lg sm:text-xl font-bold flex items-center justify-center shadow-md">
            <FaHome />
          </div>
          <h1 className="text-[#f5f5f5] text-lg sm:text-2xl font-bold tracking-wider">
            Home
          </h1>
        </div>

        {/* Live Status indicator badge */}
        <div className="flex items-center gap-2 bg-[#222] border border-[#333] px-3.5 py-1.5 rounded-full text-xs text-[#ababab] shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 font-semibold">Live POS</span>
        </div>
      </div>

      {/* Main Content Area - perfectly aligned with sub-header and top header */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-8 md:px-10 py-4 sm:py-6 pb-28 md:pb-24">
        <div className="w-full space-y-4 sm:space-y-6">
          {/* Greetings Banner with realtime clock */}
          <Greetings />

          {/* 3 Balanced Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            <MiniCard
              title="Today's Earnings"
              icon={<BsCashCoin />}
              number={totalEarning}
              isCurrency
              footerNum={percentage}
              variant="gold"
            />
            <MiniCard
              title="Today's Orders"
              icon={<GrBasket />}
              number={orderCount}
              subtitle={`${orderCount} orders recorded today`}
              variant="green"
            />
            <MiniCard
              title="Avg Order Value"
              icon={<MdOutlineTrendingUp />}
              number={avgOrderValue}
              isCurrency
              subtitle="Calculated per order"
              variant="blue"
            />
          </div>

          {/* Recent Orders Panel matching Menu page styling */}
          <RecentOrders orders={recentOrders} />
        </div>
      </div>
    </section>
  );
};

export default Home;
