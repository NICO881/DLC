/**
 * App.jsx
 *
 * Top-level router. Routes are grouped: public (login), then everything
 * else behind ProtectedRoute, with a subset further gated by allowedRoles
 * to mirror the backend permission matrix.
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppShell from "./components/layout/AppShell";

import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import Dashboard from "./pages/Dashboard";
import BrowsePage from "./pages/shared/BrowsePage";
import ResourceDetailPage from "./pages/shared/ResourceDetailPage";
import NotificationsPage from "./pages/shared/NotificationsPage";
import ProfilePage from "./pages/shared/ProfilePage";

import BookmarksPage from "./pages/student/BookmarksPage";
import DownloadsPage from "./pages/student/DownloadsPage";

import UploadPage from "./pages/teacher/UploadPage";
import EditResourcePage from "./pages/teacher/EditResourcePage";
import ShareResourcePage from "./pages/teacher/ShareResourcePage";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";

import ReviewQueuePage from "./pages/coordinator/ReviewQueuePage";
import CurriculumManagementPage from "./pages/coordinator/CurriculumManagementPage";

import UserManagementPage from "./pages/admin/UserManagementPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import StoragePage from "./pages/admin/StoragePage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/resources/:id" element={<ResourceDetailPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/downloads" element={<DownloadsPage />} />

            <Route
              path="/upload"
              element={
                <ProtectedRoute allowedRoles={["TEACHER", "COORDINATOR", "ADMIN"]}>
                  <UploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["TEACHER", "COORDINATOR", "ADMIN"]}>
                  <EditResourcePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources/:id/share"
              element={
                <ProtectedRoute allowedRoles={["TEACHER", "COORDINATOR", "ADMIN"]}>
                  <ShareResourcePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-resources"
              element={
                <ProtectedRoute allowedRoles={["TEACHER"]}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shares"
              element={
                <ProtectedRoute allowedRoles={["TEACHER", "COORDINATOR", "ADMIN"]}>
                  <BookmarksPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/review-queue"
              element={
                <ProtectedRoute allowedRoles={["COORDINATOR", "ADMIN"]}>
                  <ReviewQueuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/curriculum"
              element={
                <ProtectedRoute allowedRoles={["COORDINATOR", "ADMIN"]}>
                  <CurriculumManagementPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "COORDINATOR"]}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/storage"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <StoragePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
