import { useSelector } from "react-redux";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import DashBoardTable from "./components/dashboard/DashBoardTable";
import BottomNav from "./components/shared/BottomNav";
import Header from "./components/shared/Header";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Orders from "./pages/Orders";
import Tables from "./pages/Tables";
import BestSelling from "./components/dashboard/BestSelling";

function Layout() {
  const location = useLocation();
  const hideHeader = ["/auth"];
  const { isAuth } = useSelector((state) => state.user);

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

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {!hideHeader.includes(location.pathname) && <Header />}
      <main className="flex-1 min-h-0">
        <Routes>
          {/* Only Admin can view Home, else go to Menu */}
          <Route
            path="/"
            element={
              <ProtectedRoute adminOnly redirectTo="/menu">
                <Home />
              </ProtectedRoute>
            }
          />

          <Route path="/auth" element={<Auth />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
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
              <ProtectedRoute>
                <Menu />
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
              <ProtectedRoute>
                <Expenses />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!shouldHideBottomNav() && <BottomNav />}
    </div>
  );
}
function ProtectedRoute({ children, adminOnly = false, redirectTo = "/auth" }) {
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

  // If adminOnly route and role doesn’t match, redirect
  if (adminOnly && userRole !== "Admin") {
    return <Navigate to={redirectTo || "/menu"} replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
