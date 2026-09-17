import { useState } from "react";
import { MdRestaurantMenu } from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { useSelector } from "react-redux";
import CartInfo from "../components/menu/CartInfo";
import MenuContainer from "../components/menu/MenuContainer";
import BackButton from "../components/shared/BackButton";
import { getTotalPrice } from "../redux/slices/cartSlice";

const Menu = () => {
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <section className="bg-gradient-to-br from-[#1f1f1f] via-[#1a1a1a] to-[#262626] flex flex-col md:flex-row h-screen relative overflow-hidden">
      {/* Left side: Menu */}
      <div className="flex-1 md:flex-[3] flex flex-col min-h-0 h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-10 py-3 sm:py-6 flex-none bg-[#1a1a1a] shadow-lg">
          <div className="flex items-center gap-3 sm:gap-4">
            <BackButton />
            <h1 className="text-[#f5f5f5] text-xl sm:text-3xl font-bold tracking-wider">
              Menu
            </h1>
          </div>

          {/* Right Header / Mobile Cart Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="md:hidden relative bg-[#262626] p-2.5 rounded-xl text-[#f6b100] cursor-pointer hover:bg-[#333] transition-all"
              title="View Order"
            >
              <FaShoppingCart size={20} />
              {cartData.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#f6b100] text-[#1a1a1a] text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow">
                  {cartData.length}
                </span>
              )}
            </button>
            <div className="hidden sm:flex items-center gap-3">
              <MdRestaurantMenu className="text-[#f5f5f5] text-3xl sm:text-4xl" />
            </div>
          </div>
        </div>

        {/* MenuContainer fills the rest */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <MenuContainer />
        </div>
      </div>

      {/* Floating Bottom Cart Bar for Mobile (< md) */}
      {cartData.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 md:hidden z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-[#f6b100] to-[#e0a100] text-[#1a1a1a] font-bold py-3.5 px-5 rounded-2xl shadow-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-transform border border-yellow-300/30"
          >
            <div className="flex items-center gap-2.5">
              <span className="bg-[#1a1a1a] text-[#f6b100] text-xs font-extrabold px-2.5 py-1 rounded-full">
                {cartData.length}
              </span>
              <span className="text-sm font-bold">View Order</span>
            </div>
            <span className="text-base font-extrabold">Rs {total} &rarr;</span>
          </button>
        </div>
      )}

      {/* Right side: Cart Drawer / Sidebar */}
      <CartInfo isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </section>
  );
};

export default Menu;
