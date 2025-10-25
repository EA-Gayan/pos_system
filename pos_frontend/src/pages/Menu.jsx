import { MdRestaurantMenu } from "react-icons/md";
import { useSelector } from "react-redux";
import CartInfo from "../components/menu/CartInfo";
import MenuContainer from "../components/menu/MenuContainer";
import BackButton from "../components/shared/BackButton";

const Menu = () => {
  // Redux state to get customer data
  const customerData = useSelector((state) => state.customer);

  return (
    <section className="bg-[#1f1f1f] flex gap-3 h-screen">
      {/* Left side */}
      <div className="flex-[3] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-10 py-4 flex-none">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
              Menu
            </h1>
          </div>

          {/* Customer details */}
          <div className="flex items-center justify-around gap-4">
            <div className="flex items-center gap-3 cursor-pointer">
              <MdRestaurantMenu className="text-[#f5f5f5] text-4xl" />
              <div className="flex flex-col items-start"></div>
            </div>
          </div>
        </div>

        {/* MenuContainer fills the rest */}
        <div className="flex-1">
          <MenuContainer />
        </div>
      </div>

      {/* Right side */}
      <CartInfo />
    </section>
  );
};

export default Menu;
