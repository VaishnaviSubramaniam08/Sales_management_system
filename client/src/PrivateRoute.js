import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Not logged in
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Admin-only route protection
  if (adminOnly && role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return children;
}
