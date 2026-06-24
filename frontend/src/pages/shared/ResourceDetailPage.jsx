/**
 * pages/shared/ResourceDetailPage.jsx
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Bookmark,
  BookmarkCheck,
  Download as DownloadIcon,
  Star,
  ArrowLeft,
  User,
  Calendar,
  Tag,
  Pencil,
  Archive,
  Send,
  CheckCircle,
  Share2,
} from "lucide-react";
import * as resourcesApi from "../../api/resources";
import * as interactionsApi from "../../api/interactions";
import { useAuth } from "../../context/AuthContext";
import ResourceViewer from "../../components/resources/ResourceViewer";
import { StatusBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Card, PageLoader } from "../../components/ui/Card";
import { getResourceTypeMeta, formatFileSize, LANGUAGE_LABELS } from "../../utils/resourceTypes";

export default function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    resourcesApi
      .getResource(id)
      .then((data) => {
        if (cancelled) return;
        setResource(data);
        setIsBookmarked(data.is_bookmarked);
      })
      .catch((err) => console.error(err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  async function handleBookmark() {
    try {
      if (isBookmarked) {
        showToast("Manage removals from the Bookmarks page");
        return;
      }
      await interactionsApi.addBookmark(resource.id);
      setIsBookmarked(true);
      showToast("Saved to your bookmarks");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDownload() {
    try {
      await resourcesApi.recordDownload(resource.id);
      window.open(resource.file, "_blank");
      showToast("Download started");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRate(score) {
    try {
      await interactionsApi.rateResource(resource.id, score);
      setMyRating(score);
      showToast("Thanks for rating this resource!");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleStatusChange(newStatus) {
    setActionLoading(true);
    try {
      const updated = await resourcesApi.changeResourceStatus(resource.id, newStatus);
      setResource(updated);
      showToast(`Status updated to ${updated.status.replace("_", " ").toLowerCase()}`);
    } catch (err) {
      showToast(err.response?.data?.detail || "Couldn't update status.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <PageLoader />;
  if (!resource) {
    return (
      <div className="text-center py-16 text-ink-500">
        Resource not found, or you don't have access to view it.
      </div>
    );
  }

  const meta = getResourceTypeMeta(resource.resource_type);
  const isOwner = resource.uploaded_by_name && user?.role === "TEACHER";
  const canManage = ["TEACHER", "COORDINATOR", "ADMIN"].includes(user?.role);
  const canApprove = ["COORDINATOR", "ADMIN"].includes(user?.role);

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700 mb-4"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* Breadcrumb: Education Level > Class > Subject > Topic > Subtopic */}
      {resource.subject_name && (
        <p className="text-xs text-ink-500 mb-3">
          {resource.subject_name}
          {resource.topic_name && ` › ${resource.topic_name}`}
          {resource.subtopic_name && ` › ${resource.subtopic_name}`}
        </p>
      )}

      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="font-display text-2xl font-semibold text-ink-800">{resource.title}</h1>
        <StatusBadge status={resource.status} />
      </div>

      <div className="flex items-center gap-3 text-sm text-ink-500 mb-6 flex-wrap">
        <span className="flex items-center gap-1">
          <meta.icon size={14} /> {meta.label}
        </span>
        {resource.author && (
          <span className="flex items-center gap-1">
            <User size={14} /> {resource.author}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar size={14} /> {new Date(resource.created_at).toLocaleDateString()}
        </span>
        <span>{LANGUAGE_LABELS[resource.language] || resource.language}</span>
        <span>{formatFileSize(resource.file_size_bytes)}</span>
      </div>

      <ResourceViewer resource={resource} />

      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <Button icon={DownloadIcon} onClick={handleDownload}>
          Download
        </Button>
        <Button
          variant="outline"
          icon={isBookmarked ? BookmarkCheck : Bookmark}
          onClick={handleBookmark}
        >
          {isBookmarked ? "Bookmarked" : "Bookmark"}
        </Button>
        {canManage && (
          <Button variant="outline" icon={Share2} onClick={() => navigate(`/resources/${id}/share`)}>
            Share
          </Button>
        )}

        {/* Lifecycle controls */}
        {isOwner && resource.status === "DRAFT" && (
          <Button
            variant="secondary"
            icon={Send}
            disabled={actionLoading}
            onClick={() => handleStatusChange("PENDING_REVIEW")}
          >
            Submit for Review
          </Button>
        )}
        {canApprove && resource.status === "PENDING_REVIEW" && (
          <Button
            variant="success"
            icon={CheckCircle}
            disabled={actionLoading}
            onClick={() => handleStatusChange("PUBLISHED")}
          >
            Approve & Publish
          </Button>
        )}
        {canManage && resource.status === "PUBLISHED" && (
          <Button
            variant="outline"
            icon={Archive}
            disabled={actionLoading}
            onClick={() => handleStatusChange("ARCHIVED")}
          >
            Archive
          </Button>
        )}
        {canManage && (
          <Link to={`/resources/${id}/edit`}>
            <Button variant="ghost" icon={Pencil}>
              Edit
            </Button>
          </Link>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-ink-800 text-white text-sm px-4 py-2.5 rounded-card shadow-shelf z-50">
          {toast}
        </div>
      )}

      {/* Description */}
      {resource.description && (
        <Card className="p-5 mt-6">
          <h2 className="font-display font-semibold text-ink-800 mb-2">About this resource</h2>
          <p className="text-sm text-ink-600 leading-relaxed">{resource.description}</p>
        </Card>
      )}

      {/* Rating */}
      <Card className="p-5 mt-4">
        <h2 className="font-display font-semibold text-ink-800 mb-2">Rate this resource</h2>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => handleRate(n)} aria-label={`Rate ${n} stars`}>
              <Star
                size={22}
                className={n <= myRating ? "text-gold-500" : "text-ink-200"}
                fill={n <= myRating ? "currentColor" : "none"}
              />
            </button>
          ))}
          {resource.average_rating != null && (
            <span className="text-sm text-ink-500 ml-2">
              Average: {resource.average_rating} / 5
            </span>
          )}
        </div>
      </Card>

      {/* Keywords / competencies */}
      {(resource.keywords || resource.competency_names?.length > 0) && (
        <Card className="p-5 mt-4">
          <h2 className="font-display font-semibold text-ink-800 mb-2 flex items-center gap-1.5">
            <Tag size={16} /> Tags & Competencies
          </h2>
          <div className="flex flex-wrap gap-2">
            {resource.keywords
              ?.split(",")
              .map((k) => k.trim())
              .filter(Boolean)
              .map((k) => (
                <span key={k} className="text-xs bg-ink-50 text-ink-600 px-2.5 py-1 rounded-full">
                  {k}
                </span>
              ))}
            {resource.competency_names?.map((c) => (
              <span key={c} className="text-xs bg-leaf-50 text-leaf-600 px-2.5 py-1 rounded-full">
                {c}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
