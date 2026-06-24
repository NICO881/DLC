/**
 * pages/admin/AuditLogsPage.jsx
 */
import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import * as analyticsApi from "../../api/analytics";
import { Card, PageLoader } from "../../components/ui/Card";
import Select from "../../components/ui/Select";

const ACTION_OPTIONS = [
  "UPLOAD", "UPDATE", "DELETE", "RESTORE", "ARCHIVE", "PUBLISH", "APPROVE", "REJECT",
  "LOGIN", "LOGOUT", "DOWNLOAD", "SHARE", "OTHER",
].map((a) => ({ value: a, label: a.charAt(0) + a.slice(1).toLowerCase() }));

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    analyticsApi
      .listAuditLogs(actionFilter ? { action: actionFilter } : {})
      .then((data) => setLogs(data.results ?? data))
      .finally(() => setLoading(false));
  }, [actionFilter]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-800 flex items-center gap-2">
          <ScrollText size={24} className="text-clay-500" /> Audit Logs
        </h1>
        <p className="text-ink-500 text-sm mt-1">
          Uploads, updates, deletions, and user activity across the library.
        </p>
      </div>

      <div className="mb-4 max-w-xs">
        <Select label="Filter by action" value={actionFilter} onChange={setActionFilter} options={ACTION_OPTIONS} />
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Time</th>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Action</th>
                <th className="text-left px-4 py-3 font-medium">Resource</th>
                <th className="text-left px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-ink-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{log.user_name || "System"}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium bg-ink-50 text-ink-600 px-2 py-0.5 rounded-full">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{log.resource_title || "—"}</td>
                  <td className="px-4 py-3 text-ink-500">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
