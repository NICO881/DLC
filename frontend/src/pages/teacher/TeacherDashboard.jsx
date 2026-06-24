/**
 * pages/teacher/TeacherDashboard.jsx
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Upload, FolderTree, Share2, CheckCircle2 } from "lucide-react";
import * as resourcesApi from "../../api/resources";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/ui/Badge";
import { Card, PageLoader, EmptyState } from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [myResources, setMyResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    resourcesApi
      .listResources({ uploaded_by: user.id, ordering: "-created_at" })
      .then((data) => !cancelled && setMyResources(data.results))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  if (loading) return <PageLoader />;

  const statusCounts = myResources.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-2xl font-semibold text-ink-800">
          Welcome back, {user?.first_name || user?.username}
        </h1>
        <p className="text-ink-500 text-sm mt-1">Manage your teaching materials and track their status.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Draft", status: "DRAFT" },
          { label: "Pending Review", status: "PENDING_REVIEW" },
          { label: "Published", status: "PUBLISHED" },
          { label: "Archived", status: "ARCHIVED" },
        ].map(({ label, status }) => (
          <Card key={status} className="p-4">
            <p className="text-2xl font-display font-semibold text-ink-800">
              {statusCounts[status] || 0}
            </p>
            <p className="text-xs text-ink-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 mb-8">
        <Link to="/upload">
          <Button icon={Upload}>Upload New Resource</Button>
        </Link>
        <Link to="/shares">
          <Button variant="outline" icon={Share2}>
            Shared Resources
          </Button>
        </Link>
      </div>

      <section>
        <h2 className="font-display font-semibold text-ink-800 mb-3 flex items-center gap-1.5">
          <FolderTree size={18} className="text-clay-500" /> My Resources
        </h2>
        {myResources.length === 0 ? (
          <EmptyState
            icon={Upload}
            title="No resources yet"
            message="Upload your first resource to get started."
            action={
              <Link to="/upload">
                <Button icon={Upload}>Upload Resource</Button>
              </Link>
            }
          />
        ) : (
          <div className="bg-white rounded-card border border-ink-100 divide-y divide-ink-100">
            {myResources.map((resource) => (
              <Link
                key={resource.id}
                to={`/resources/${resource.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-ink-50/50"
              >
                <div>
                  <p className="text-sm font-medium text-ink-800">{resource.title}</p>
                  <p className="text-xs text-ink-500">
                    {resource.subject_name || "Unfiled"} ·{" "}
                    {new Date(resource.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={resource.status} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
