/**
 * pages/student/DownloadsPage.jsx
 *
 * Download Manager view: shows offline downloads with status, supporting
 * the "resume interrupted downloads" feature by surfacing IN_PROGRESS/
 * PAUSED entries distinctly from COMPLETED ones.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, CheckCircle2, Loader2, XCircle } from "lucide-react";
import * as interactionsApi from "../../api/interactions";
import { EmptyState, PageLoader, Card } from "../../components/ui/Card";
import { getResourceTypeMeta } from "../../utils/resourceTypes";

const STATUS_META = {
  COMPLETED: { icon: CheckCircle2, color: "text-leaf-500", label: "Completed" },
  IN_PROGRESS: { icon: Loader2, color: "text-gold-500", label: "In Progress" },
  PAUSED: { icon: Loader2, color: "text-ink-400", label: "Paused" },
  FAILED: { icon: XCircle, color: "text-clay-500", label: "Failed" },
};

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interactionsApi
      .listDownloads()
      .then((data) => setDownloads(data.results ?? data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-800 flex items-center gap-2">
          <Download size={24} className="text-clay-500" /> Downloads
        </h1>
        <p className="text-ink-500 text-sm mt-1">
          Resources you've downloaded for offline access.
        </p>
      </div>

      {downloads.length === 0 ? (
        <EmptyState
          icon={Download}
          title="No downloads yet"
          message="Download resources to access them without an internet connection."
        />
      ) : (
        <Card className="divide-y divide-ink-100">
          {downloads.map((d) => {
            const meta = getResourceTypeMeta(d.resource_type);
            const statusMeta = STATUS_META[d.status] || STATUS_META.IN_PROGRESS;
            const StatusIcon = statusMeta.icon;
            return (
              <div key={d.id} className="flex items-center justify-between px-4 py-3">
                <Link to={`/resources/${d.resource}`} className="flex items-center gap-3 min-w-0">
                  <div className={`w-1.5 h-8 rounded-full shrink-0 ${meta?.spine}`} />
                  <span className="text-sm font-medium text-ink-800 truncate">
                    {d.resource_title}
                  </span>
                </Link>
                <span className={`flex items-center gap-1.5 text-xs font-medium ${statusMeta.color}`}>
                  <StatusIcon size={14} className={d.status === "IN_PROGRESS" ? "animate-spin" : ""} />
                  {statusMeta.label}
                </span>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
