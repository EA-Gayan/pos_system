// src/components/routes/PublicRoute.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const { isAuth } = useSelector((state) => state.user);

  // Prevent render until Redux state settles (optional)
  if (isAuth === null) return null;

  return isAuth ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;
