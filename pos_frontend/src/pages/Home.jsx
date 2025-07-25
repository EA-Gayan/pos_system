import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { BsCashCoin } from "react-icons/bs";
import { GrBasket } from "react-icons/gr";
import Greetings from "../components/home/Greetings";
import MiniCard from "../components/home/MiniCard";
import RecentOrders from "../components/home/RecentOrders";
import { getOrderEarning, getOrdersCount } from "../https";

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
    <section className="bg-[#1f1f1f] h-screen p-6">
      {/* Left Section */}
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
        <RecentOrders />
      </div>

      {/* Right Section (optional) */}
      {/* <div className="flex-[2] pb-20">
          <PopularDishes />
        </div> */}
    </section>
  );
};

export default Home;
