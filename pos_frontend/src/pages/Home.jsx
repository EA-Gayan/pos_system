import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BsCashCoin } from "react-icons/bs";
import { GrBasket } from "react-icons/gr";
import Greetings from "../components/home/Greetings";
import MiniCard from "../components/home/MiniCard";
import PopularDishes from "../components/home/PopularDishes";
import RecentOrders from "../components/home/RecentOrders";
import BottomNav from "../components/shared/BottomNav";
import { getOrderEarning, getOrdersCount } from "../https";
import { enqueueSnackbar } from "notistack";

const Home = () => {
  const [totalEarning, setTotalEarning] = useState(0);
  const [percentage, setpercentage] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  const orderEarningMutation = useMutation({
    mutationFn: (reqData) => getOrderEarning(reqData),
    onSuccess: (response) => {
      setTotalEarning(response.data.totalEarnings);
      setpercentage(response?.data?.percentChange);
    },
    onError: () => {
      enqueueSnackbar("Failed to fetch earnings!", {
        variant: "error",
      });
    },
  });

  const orderCountMutation = useMutation({
    mutationFn: (reqData) => getOrdersCount(reqData),
    onSuccess: (response) => {
      setOrderCount(response.data.data);
    },
    onError: () => {
      enqueueSnackbar("Failed to fetch orders count!", {
        variant: "error",
      });
    },
  });

  useEffect(() => {
    const data = {
      period: "today",
    };
    orderEarningMutation.mutate(data);
    orderCountMutation.mutate(data);
  }, []);

  return (
    <section className="bg-[#1f1f1f] flex gap-3">
      {/* Left Div */}
      <div className="flex-[3]">
        <Greetings />
        <div className="flex items-center w-full gap-3 px-8 mt-8">
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
        <RecentOrders />
      </div>
      {/* Right Div */}
      <div className="flex-[2] pb-20">
        <PopularDishes />
      </div>
      <BottomNav />
    </section>
  );
};

export default Home;
