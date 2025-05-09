import React from "react";
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import Greetings from "../components/home/Greetings";
import MiniCard from "../components/home/MiniCard";
import PopularDishes from "../components/home/PopularDishes";
import BottomNav from "../components/shared/BottomNav";
import RecentOrders from "../components/home/RecentOrders";

const Home = () => {
  return (
    <section className="bg-[#1f1f1f] flex gap-3">
      {/* Left Div */}
      <div className="flex-[3]">
        <Greetings />
        <div className="flex items-center w-full gap-3 px-8 mt-8">
          <MiniCard
            title="Total Earnings"
            icon={<BsCashCoin />}
            number={512}
            footerNum={1.6}
          />
          <MiniCard
            title="In Progress"
            icon={<GrInProgress />}
            number={16}
            footerNum={3.6}
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
