/**
 * pages/admin/StoragePage.jsx
 */
import { useEffect, useState } from "react";
import { HardDrive, AlertTriangle } from "lucide-react";
import * as analyticsApi from "../../api/analytics";
import { Card, PageLoader } from "../../components/ui/Card";
import { formatFileSize, getResourceTypeMeta } from "../../utils/resourceTypes";

export default function StoragePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.fetchStorageMonitoring().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!data) return null;

  const { disk, resources } = data;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-800 flex items-center gap-2">
          <HardDrive size={24} className="text-clay-500" /> Storage Monitoring
        </h1>
        <p className="text-ink-500 text-sm mt-1">
          Disk space, resource sizes, and server health for the school server.
        </p>
      </div>

      {disk.warning && (
        <div className="flex items-center gap-2 bg-gold-50 text-gold-600 rounded-card px-4 py-3 mb-6 text-sm font-medium">
          <AlertTriangle size={16} />
          Disk usage has crossed the {disk.warning_threshold_percent}% warning threshold.
        </div>
      )}

      <Card className="p-5 mb-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-sm text-ink-500">Disk usage</p>
            <p className="text-3xl font-display font-semibold text-ink-800">
              {disk.percent_used}%
            </p>
          </div>
          <p className="text-sm text-ink-500 text-right">
            {formatFileSize(disk.used_bytes)} used of {formatFileSize(disk.total_bytes)}
          </p>
        </div>
        <div className="h-3 bg-ink-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${disk.warning ? "bg-gold-500" : "bg-leaf-500"}`}
            style={{ width: `${Math.min(disk.percent_used, 100)}%` }}
          />
        </div>
        <p className="text-xs text-ink-400 mt-2">
          {formatFileSize(disk.free_bytes)} free
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="font-display font-semibold text-ink-800 mb-1">
          Resource storage by type
        </h2>
        <p className="text-sm text-ink-500 mb-4">
          Total: {formatFileSize(resources.total_bytes)} across all resources
        </p>
        <div className="space-y-2">
          {resources.by_type.map((row) => {
            const meta = getResourceTypeMeta(row.resource_type);
            const pct = resources.total_bytes
              ? (row.total_bytes / resources.total_bytes) * 100
              : 0;
            return (
              <div key={row.resource_type} className="flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full shrink-0 ${meta.spine}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-ink-700">{meta.label}</span>
                    <span className="text-ink-500">
                      {formatFileSize(row.total_bytes)} · {row.count} file{row.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="h-1.5 bg-ink-50 rounded-full overflow-hidden">
                    <div className={`h-full ${meta.spine}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
