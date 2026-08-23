import { MdRestaurantMenu } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import WaiterCartInfo from "../components/menu/WaiterCartInfo";
import MenuContainer from "../components/menu/MenuContainer";
import BackButton from "../components/shared/BackButton";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTableCart } from "../https";
import { setTableCartItems, setTableId } from "../redux/slices/tableCartSlice";

const WaiterMenu = () => {
  const { tableId } = useParams();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  // Fetch the draft cart for this table on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (tableId) {
          dispatch(setTableId(tableId));
          const res = await getTableCart(tableId);
          if (res.data.success) {
            dispatch(setTableCartItems(res.data.data.items || []));
          }
        }
      } catch (error) {
        console.error("Failed to fetch table cart", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [tableId, dispatch]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#1f1f1f] via-[#1a1a1a] to-[#262626]">
        <p className="text-[#f6b100] text-xl font-bold">Loading Menu...</p>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-br from-[#1f1f1f] via-[#1a1a1a] to-[#262626] flex gap-3 h-screen">
      {/* Left side */}
      <div className="flex-[3] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-10 py-6 flex-none bg-[#1a1a1a] shadow-lg">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-[#f5f5f5] text-3xl font-bold tracking-wider">
              Waiter Menu
            </h1>
          </div>

          <div className="flex items-center justify-around gap-4">
            <div className="flex items-center gap-3 cursor-pointer">
              <MdRestaurantMenu className="text-[#f5f5f5] text-4xl" />
              <div className="flex flex-col items-start"></div>
            </div>
          </div>
        </div>

        {/* MenuContainer fills the rest */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <MenuContainer isWaiterMode={true} />
        </div>
      </div>

      {/* Right side */}
      <WaiterCartInfo tableId={tableId} />
    </section>
  );
};

export default WaiterMenu;
