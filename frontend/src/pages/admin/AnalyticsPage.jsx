/**
 * pages/admin/AnalyticsPage.jsx
 */
import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import * as analyticsApi from "../../api/analytics";
import { Card, PageLoader } from "../../components/ui/Card";

const COLORS = ["#C96E40", "#1B3A4B", "#D4A256", "#2F5233", "#7C9BAA"];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.fetchUsageAnalytics().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!data) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-800 flex items-center gap-2">
          <BarChart3 size={24} className="text-clay-500" /> Usage Analytics
        </h1>
        <p className="text-ink-500 text-sm mt-1">
          Most viewed resources, downloads, and popular subjects across the library.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <Card className="p-5">
          <h2 className="font-display font-semibold text-ink-800 mb-4">Most Viewed Resources</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.most_viewed_resources} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EEF3F5" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#7C9BAA" }} allowDecimals={false} />
              <YAxis
                dataKey="title"
                type="category"
                width={140}
                tick={{ fontSize: 11, fill: "#2A2A28" }}
                tickFormatter={(v) => (v.length > 18 ? v.slice(0, 18) + "…" : v)}
              />
              <Tooltip />
              <Bar dataKey="view_count" radius={[0, 4, 4, 0]}>
                {data.most_viewed_resources.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-semibold text-ink-800 mb-4">Most Downloaded</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.most_downloaded_resources} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EEF3F5" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#7C9BAA" }} allowDecimals={false} />
              <YAxis
                dataKey="title"
                type="category"
                width={140}
                tick={{ fontSize: 11, fill: "#2A2A28" }}
                tickFormatter={(v) => (v.length > 18 ? v.slice(0, 18) + "…" : v)}
              />
              <Tooltip />
              <Bar dataKey="download_count" fill="#1B3A4B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-semibold text-ink-800 mb-4">Popular Subjects</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.popular_subjects}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF3F5" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#2A2A28" }} />
              <YAxis tick={{ fontSize: 11, fill: "#7C9BAA" }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="resource_count" fill="#D4A256" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-semibold text-ink-800 mb-4">Resources by Type</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.resources_by_type}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF3F5" />
              <XAxis dataKey="resource_type" tick={{ fontSize: 11, fill: "#2A2A28" }} />
              <YAxis tick={{ fontSize: 11, fill: "#7C9BAA" }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2F5233" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {data.overall_average_rating != null && (
        <Card className="p-5">
          <p className="text-sm text-ink-500">Overall average resource rating</p>
          <p className="text-3xl font-display font-semibold text-ink-800">
            {data.overall_average_rating.toFixed(1)} / 5
          </p>
        </Card>
      )}
    </div>
  );
}
