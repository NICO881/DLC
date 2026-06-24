/**
 * pages/coordinator/ReviewQueuePage.jsx
 *
 * Subject Coordinators "review/approve resources" — this is the queue of
 * everything sitting at PENDING_REVIEW, with quick approve/reject actions.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, Eye, ClipboardCheck } from "lucide-react";
import * as resourcesApi from "../../api/resources";
import { EmptyState, PageLoader, Card } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { getResourceTypeMeta } from "../../utils/resourceTypes";

export default function ReviewQueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadQueue();
  }, []);

  function loadQueue() {
    setLoading(true);
    resourcesApi
      .listResources({ status: "PENDING_REVIEW", ordering: "submitted_for_review_at" })
      .then((data) => setQueue(data.results))
      .finally(() => setLoading(false));
  }

  async function handleDecision(id, status) {
    setProcessingId(id);
    try {
      await resourcesApi.changeResourceStatus(id, status);
      setQueue((q) => q.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-800 flex items-center gap-2">
          <ClipboardCheck size={24} className="text-clay-500" /> Review Queue
        </h1>
        <p className="text-ink-500 text-sm mt-1">
          Resources submitted by teachers, waiting for your approval before publishing.
        </p>
      </div>

      {queue.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All caught up"
          message="There's nothing waiting for review right now."
        />
      ) : (
        <div className="space-y-3">
          {queue.map((resource) => {
            const meta = getResourceTypeMeta(resource.resource_type);
            return (
              <Card key={resource.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-1.5 h-10 rounded-full ${meta.spine}`} />
                  <div className="min-w-0">
                    <p className="font-medium text-ink-800 truncate">{resource.title}</p>
                    <p className="text-xs text-ink-500">
                      {meta.label} · by {resource.uploaded_by_name || "Unknown"} ·{" "}
                      {resource.subject_name || "Unfiled"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/resources/${resource.id}`}>
                    <Button variant="ghost" size="sm" icon={Eye}>
                      Preview
                    </Button>
                  </Link>
                  <Button
                    variant="success"
                    size="sm"
                    icon={CheckCircle2}
                    disabled={processingId === resource.id}
                    onClick={() => handleDecision(resource.id, "PUBLISHED")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={XCircle}
                    disabled={processingId === resource.id}
                    onClick={() => handleDecision(resource.id, "DRAFT")}
                  >
                    Send back
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
