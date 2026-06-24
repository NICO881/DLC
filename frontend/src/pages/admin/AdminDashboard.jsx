/**
 * pages/admin/AdminDashboard.jsx
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, HardDrive, BarChart3, ClipboardCheck, BookOpen, AlertTriangle } from "lucide-react";
import * as analyticsApi from "../../api/analytics";
import { Card, PageLoader } from "../../components/ui/Card";

export default function AdminDashboard() {
  const [usage, setUsage] = useState(null);
  const [storage, setStorage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.fetchUsageAnalytics(), analyticsApi.fetchStorageMonitoring()])
      .then(([u, s]) => {
        setUsage(u);
        setStorage(s);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const totalResources = usage?.resources_by_status?.reduce((sum, s) => sum + s.count, 0) || 0;
  const published = usage?.resources_by_status?.find((s) => s.status === "PUBLISHED")?.count || 0;
  const pending = usage?.resources_by_status?.find((s) => s.status === "PENDING_REVIEW")?.count || 0;

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-2xl font-semibold text-ink-800">System Overview</h1>
        <p className="text-ink-500 text-sm mt-1">
          Administration dashboard for the Digital Library.
        </p>
      </div>

      {storage?.disk?.warning && (
        <div className="flex items-center gap-2 bg-gold-50 text-gold-600 rounded-card px-4 py-3 mb-6 text-sm font-medium">
          <AlertTriangle size={16} />
          Storage usage is at {storage.disk.percent_used}% — consider freeing up space or
          expanding storage soon.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <BookOpen size={18} className="text-clay-500 mb-2" />
          <p className="text-2xl font-display font-semibold text-ink-800">{totalResources}</p>
          <p className="text-xs text-ink-500">Total resources</p>
        </Card>
        <Card className="p-4">
          <ClipboardCheck size={18} className="text-leaf-500 mb-2" />
          <p className="text-2xl font-display font-semibold text-ink-800">{published}</p>
          <p className="text-xs text-ink-500">Published</p>
        </Card>
        <Card className="p-4">
          <ClipboardCheck size={18} className="text-gold-500 mb-2" />
          <p className="text-2xl font-display font-semibold text-ink-800">{pending}</p>
          <p className="text-xs text-ink-500">Pending review</p>
        </Card>
        <Card className="p-4">
          <HardDrive size={18} className="text-ink-500 mb-2" />
          <p className="text-2xl font-display font-semibold text-ink-800">
            {storage?.disk?.percent_used ?? "—"}%
          </p>
          <p className="text-xs text-ink-500">Disk used</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/users">
          <Card className="p-5 h-full hover:-translate-y-0.5 transition-transform">
            <Users size={20} className="text-clay-500 mb-2" />
            <h3 className="font-display font-semibold text-ink-800 mb-1">Manage Users</h3>
            <p className="text-sm text-ink-500">Add, edit, or deactivate accounts.</p>
          </Card>
        </Link>
        <Link to="/analytics">
          <Card className="p-5 h-full hover:-translate-y-0.5 transition-transform">
            <BarChart3 size={20} className="text-clay-500 mb-2" />
            <h3 className="font-display font-semibold text-ink-800 mb-1">Usage Analytics</h3>
            <p className="text-sm text-ink-500">Most viewed, downloaded, and popular subjects.</p>
          </Card>
        </Link>
        <Link to="/storage">
          <Card className="p-5 h-full hover:-translate-y-0.5 transition-transform">
            <HardDrive size={20} className="text-clay-500 mb-2" />
            <h3 className="font-display font-semibold text-ink-800 mb-1">Storage Monitoring</h3>
            <p className="text-sm text-ink-500">Disk space, resource sizes, server health.</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
