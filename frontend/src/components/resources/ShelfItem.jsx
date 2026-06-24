/**
 * components/resources/ShelfItem.jsx
 *
 * Compact file-tile used in "Recent Resources" and "Past Papers" shelves —
 * a stacked icon-over-label card, matching the small file-icon tiles in
 * the dashboard reference design (PDF icon, doc icon, headphone icon, etc.)
 */
import { Link } from "react-router-dom";
import { getResourceTypeMeta } from "../../utils/resourceTypes";

export default function ShelfItem({ resource }) {
  const meta = getResourceTypeMeta(resource.resource_type);
  const Icon = meta.icon;

  return (
    <Link
      to={`/resources/${resource.id}`}
      className="flex flex-col items-center text-center gap-2 p-2 rounded-card hover:bg-ink-50 transition-colors w-24 shrink-0"
    >
      <div className={`w-12 h-12 rounded-card flex items-center justify-center ${meta.spine} bg-opacity-15`}>
        <Icon size={22} className={meta.spine.replace("bg-", "text-")} strokeWidth={1.75} />
      </div>
      <p className="text-xs font-medium text-ink-700 leading-tight line-clamp-2">
        {resource.title}
      </p>
    </Link>
  );
}
