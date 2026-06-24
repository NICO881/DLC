/**
 * pages/Dashboard.jsx
 *
 * Routes "/" to the right role-specific dashboard, since Student, Teacher,
 * Coordinator, and Admin all land on very different home screens.
 */
import { useAuth } from "../context/AuthContext";
import StudentDashboard from "./student/StudentDashboard";
import TeacherDashboard from "./teacher/TeacherDashboard";
import AdminDashboard from "./admin/AdminDashboard";
import { PageLoader } from "../components/ui/Card";

export default function Dashboard() {
  const { user, loading } = useAuth();
  if (loading || !user) return <PageLoader />;

  if (user.role === "TEACHER") return <TeacherDashboard />;
  if (user.role === "COORDINATOR" || user.role === "ADMIN") return <AdminDashboard />;
  return <StudentDashboard />;
}
