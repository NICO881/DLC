/**
 * components/resources/ResourceCard.jsx
 *
 * The signature visual element of the app: each resource renders like a
 * book on a shelf — a colored "spine" tab on the left (keyed to resource
 * type) plus a cover area, title, and quick metadata. Designed to scan
 * quickly in a grid, the way a learner would scan a real shelf.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, Star, Download as DownloadIcon } from "lucide-react";
import { getResourceTypeMeta, formatFileSize, LANGUAGE_LABELS } from "../../utils/resourceTypes";
import { StatusBadge } from "../ui/Badge";

export default function ResourceCard({
  resource,
  onBookmarkToggle,
  showStatus = false,
  isBookmarked,
}) {
  const meta = getResourceTypeMeta(resource.resource_type);
  const Icon = meta.icon;
  const [bookmarked, setBookmarked] = useState(isBookmarked ?? resource.is_bookmarked);

  function handleBookmark(e) {
    e.preventDefault();
    e.stopPropagation();
    setBookmarked((b) => !b);
    onBookmarkToggle?.(resource, !bookmarked);
  }

  return (
    <Link
      to={`/resources/${resource.id}`}
      className="group relative flex bg-white rounded-card border border-ink-100 shadow-shelf overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-150"
    >
      {/* Spine tab */}
      <div className={`w-2.5 shrink-0 ${meta.spine}`} aria-hidden="true" />

      <div className="flex-1 p-4 flex flex-col min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-ink-500">
            <Icon size={15} strokeWidth={2} />
            <span className="text-xs font-medium uppercase tracking-wide">{meta.label}</span>
          </div>
          <button
            onClick={handleBookmark}
            aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
            className="text-ink-300 hover:text-clay-500 transition-colors shrink-0"
          >
            {bookmarked ? (
              <BookmarkCheck size={18} className="text-clay-500" fill="currentColor" fillOpacity={0.15} />
            ) : (
              <Bookmark size={18} />
            )}
          </button>
        </div>

        <h3 className="font-display font-semibold text-ink-800 leading-snug mb-1 line-clamp-2">
          {resource.title}
        </h3>

        {resource.subject_name && (
          <p className="text-xs text-ink-500 mb-2">
            {resource.subject_name}
            {resource.topic_name ? ` › ${resource.topic_name}` : ""}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <span>{LANGUAGE_LABELS[resource.language] || resource.language}</span>
            <span aria-hidden="true">·</span>
            <span>{formatFileSize(resource.file_size_bytes)}</span>
          </div>
          <div className="flex items-center gap-2">
            {resource.average_rating != null && (
              <span className="flex items-center gap-0.5 text-xs text-gold-600 font-medium">
                <Star size={13} fill="currentColor" />
                {resource.average_rating}
              </span>
            )}
            {showStatus && <StatusBadge status={resource.status} />}
          </div>
        </div>
      </div>
    </Link>
  );
}
