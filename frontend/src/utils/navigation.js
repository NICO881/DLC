/**
 * utils/navigation.js
 *
 * Role-aware nav items. Each role sees a different slice of the app,
 * matching the permission matrix in the spec.
 */
import {
  LayoutDashboard,
  Search,
  Bookmark,
  Download,
  Upload,
  FolderTree,
  CheckSquare,
  Users,
  BarChart3,
  HardDrive,
  ScrollText,
  Share2,
  Bell,
} from "lucide-react";

export function getNavItems(role) {
  const common = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/browse", label: "Browse & Search", icon: Search },
  ];

  if (role === "STUDENT") {
    return [
      ...common,
      { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
      { to: "/downloads", label: "Downloads", icon: Download },
      { to: "/notifications", label: "Notifications", icon: Bell },
    ];
  }

  if (role === "TEACHER") {
    return [
      ...common,
      { to: "/upload", label: "Upload Resource", icon: Upload },
      { to: "/my-resources", label: "My Resources", icon: FolderTree },
      { to: "/shares", label: "Shared Resources", icon: Share2 },
      { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
      { to: "/notifications", label: "Notifications", icon: Bell },
    ];
  }

  if (role === "COORDINATOR") {
    return [
      ...common,
      { to: "/review-queue", label: "Review Queue", icon: CheckSquare },
      { to: "/curriculum", label: "Manage Curriculum", icon: FolderTree },
      { to: "/upload", label: "Upload Resource", icon: Upload },
      { to: "/notifications", label: "Notifications", icon: Bell },
    ];
  }

  if (role === "ADMIN") {
    return [
      ...common,
      { to: "/review-queue", label: "Review Queue", icon: CheckSquare },
      { to: "/users", label: "Manage Users", icon: Users },
      { to: "/curriculum", label: "Manage Curriculum", icon: FolderTree },
      { to: "/analytics", label: "Usage Analytics", icon: BarChart3 },
      { to: "/storage", label: "Storage Monitoring", icon: HardDrive },
      { to: "/audit-logs", label: "Audit Logs", icon: ScrollText },
    ];
  }

  return common;
}
