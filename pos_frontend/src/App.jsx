import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import DashBoardTable from "./components/dashboard/DashBoardTable";
import BottomNav from "./components/shared/BottomNav";
import Header from "./components/shared/Header";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import WaiterMenu from "./pages/WaiterMenu";
import Orders from "./pages/Orders";
import Tables from "./pages/Tables";
import BestSelling from "./components/dashboard/BestSelling";

function Layout() {
  const location = useLocation();
  const hideHeader = ["/auth"];
  const userRole = localStorage.getItem("role");
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const hideTimerRef = useRef(null);

  // Helper function to check if current path matches any hideBottomNav pattern
  const shouldHideBottomNav = () => {
    //  paths to hide BottomNav on
    const exactHide = ["/auth", "/dashboard"];
    const prefixHide = ["/dashboard/"];
    return (
      exactHide.includes(location.pathname) ||
      prefixHide.some((prefix) => location.pathname.startsWith(prefix))
    );
  };

  useEffect(() => {
    // If mobile or touch device, keep nav visible.
    const isMobile =
      window.innerWidth < 768 || window.matchMedia?.("(hover: none)")?.matches;
    if (isMobile) {
      setIsBottomNavVisible(true);
      return;
    }

    const triggerZoneHeightPx = 48; // how close to bottom to reveal
    const hideDelayMs = 600; // slight delay like taskbar

    const clearHideTimer = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    const scheduleHide = () => {
      clearHideTimer();
      hideTimerRef.current = setTimeout(() => {
        setIsBottomNavVisible(false);
      }, hideDelayMs);
    };

    const onMouseMove = (e) => {
      const nearBottom = e.clientY >= window.innerHeight - triggerZoneHeightPx;
      if (nearBottom) {
        clearHideTimer();
        setIsBottomNavVisible(true);
      } else {
        scheduleHide();
      }
    };

    // Start hidden on desktop until user approaches the bottom.
    setIsBottomNavVisible(false);
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      clearHideTimer();
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden">
      {!hideHeader.includes(location.pathname) && <Header />}
      <main className="flex-1 min-h-0 overflow-hidden relative">
        <Routes>
          {/* Root: Admin -> Home, Waiter -> Tables, else -> Menu */}
          <Route
            path="/"
            element={
              <ProtectedRoute
                adminOnly
                redirectTo="/tables"
                waiterRedirectTo="/tables"
              >
                <Home />
              </ProtectedRoute>
            }
          />

          <Route path="/auth" element={<Auth />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute waiterForbidden>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tables"
            element={
              <ProtectedRoute>
                <Tables />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu"
            element={
              <ProtectedRoute waiterForbidden>
                <Menu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/waiter-menu/:tableId"
            element={
              <ProtectedRoute>
                <WaiterMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/best-selling"
            element={
              <ProtectedRoute>
                <BestSelling />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:section"
            element={
              <ProtectedRoute>
                <DashBoardTable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute waiterForbidden>
                <Expenses />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!shouldHideBottomNav() && userRole !== "Waiter" && (
        <BottomNav isVisible={isBottomNavVisible} />
      )}
    </div>
  );
}
function ProtectedRoute({
  children,
  adminOnly = false,
  waiterForbidden = false,
  waiterRedirectTo = "/tables",
}) {
  const { isAuth, role } = useSelector((state) => state.user);

  // Check from Redux first, then fallback to localStorage
  const isAuthorized =
    isAuth || localStorage.getItem("isAuthorized") === "true";

  // Get role from Redux or localStorage
  const userRole = role || localStorage.getItem("role");

  // Optional: wait for redux state to settle
  if (isAuth === null) return null;

  // If not authorized, redirect to login
  if (!isAuthorized) {
    return <Navigate to="/auth" replace />;
  }

  // If adminOnly route and role doesn't match, redirect
  if (adminOnly && userRole !== "Admin") {
    return <Navigate to={waiterRedirectTo || "/tables"} replace />;
  }

  // If route is forbidden for waiters
  if (waiterForbidden && userRole === "Waiter") {
    return <Navigate to="/tables" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Layout />
      <SpeedInsights />
    </Router>
  );
}

export default App;
