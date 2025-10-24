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
function ProtectedRoute({ children, adminOnly, redirectTo }) {
  const { isAuth, role } = useSelector((state) => state.user);

  if (isAuth === null) return null; // Wait for state to settle
  if (!isAuth) return <Navigate to="/auth" replace />;
  if (adminOnly && role !== "Admin")
    return <Navigate to={redirectTo || "/menu"} replace />;

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
