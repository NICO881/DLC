/**
 * components/resources/VideoCard.jsx
 *
 * Thumbnail-style card for the "Popular Videos" shelf — a dark preview
 * area with a centered play icon, duration badge, and view count below,
 * matching the YouTube-like layout in the dashboard reference design.
 */
import { Link } from "react-router-dom";
import { Play, Eye } from "lucide-react";
import { formatDuration } from "../../utils/resourceTypes";

export default function VideoCard({ resource }) {
  return (
    <Link
      to={`/resources/${resource.id}`}
      className="group block bg-white rounded-card border border-ink-100 overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-150"
    >
      <div className="relative aspect-video bg-ink-800 flex items-center justify-center overflow-hidden">
        {resource.thumbnail ? (
          <img src={resource.thumbnail} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-ink-700 to-ink-900" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-clay-500 transition-colors">
            <Play size={16} className="text-ink-800 group-hover:text-white ml-0.5" fill="currentColor" />
          </div>
        </div>
        {resource.duration_seconds && (
          <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[11px] font-medium px-1.5 py-0.5 rounded">
            {formatDuration(resource.duration_seconds)}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-ink-800 leading-snug line-clamp-2 mb-1">
          {resource.title}
        </p>
        {resource.view_count != null && (
          <p className="flex items-center gap-1 text-xs text-ink-500">
            <Eye size={12} /> {resource.view_count.toLocaleString()} views
          </p>
        )}
      </div>
    </Link>
  );
}
