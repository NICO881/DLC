/**
 * components/layout/ProtectedRoute.jsx
 *
 * Wraps routes that require authentication, and optionally restricts them
 * to a set of roles (mirroring the backend permission matrix — this is a
 * UX convenience, not a security boundary; the API enforces it for real).
 */
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PageLoader } from "../ui/Card";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
