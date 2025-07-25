import { MdRestaurantMenu } from "react-icons/md";
import { useSelector } from "react-redux";
import Bill from "../components/menu/Bill";
import CartInfo from "../components/menu/CartInfo";
import CustomerInfo from "../components/menu/CustomerInfo";
import MenuContainer from "../components/menu/MenuContainer";
import BackButton from "../components/shared/BackButton";

const Menu = () => {
  // Redux state to get customer data
  const customerData = useSelector((state) => state.customer);

  return (
    <section className="bg-[#1f1f1f] flex gap-3 overflow-y-auto">
      {/* left side */}
      <div className="flex-[3]">
        <div className=" flex items-center justify-between px-10 py-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
              Menu
            </h1>
          </div>
          {/* customer details */}
          <div className="flex items-center justify-around gap-4">
            <div className="flex items-center gap-3 cursor-pointer">
              <MdRestaurantMenu className="text-[#f5f5f5] text-4xl" />
              <div className="flex flex-col items-start">
                <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
                  {customerData.customerName || "Customer Name"}
                </h1>
                <p className="text-xs text-[#ababab] font-medium">
                  Table : {customerData.table?.tableNo || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <MenuContainer />
      </div>
      {/* Right side */}
      <div className="flex-[1] bg-[#1a1a1a] mt-4 mr-3 rounded-lg pt-2 mb-[5rem] ">
        {/* customer Info */}
        <CustomerInfo />
        <hr className="border-[#2a2a2a] border-t-2 " />
        {/* cart items */}
        <hr className="border-[#2a2a2a] border-t-2 " />
        <CartInfo />
        {/* Bills */}
        <Bill />
      </div>
    </section>
  );
};

export default Menu;
