/**
 * pages/student/BookmarksPage.jsx
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Trash2 } from "lucide-react";
import * as interactionsApi from "../../api/interactions";
import { EmptyState, PageLoader, Card } from "../../components/ui/Card";
import { getResourceTypeMeta } from "../../utils/resourceTypes";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    interactionsApi
      .listBookmarks()
      .then((data) => setBookmarks(data.results ?? data))
      .finally(() => setLoading(false));
  }

  async function handleRemove(id) {
    await interactionsApi.removeBookmark(id);
    setBookmarks((b) => b.filter((bm) => bm.id !== id));
  }

  if (loading) return <PageLoader />;

  // Group by collection_name to mirror "organize revision materials" from the spec.
  const grouped = bookmarks.reduce((acc, b) => {
    const key = b.collection_name || "My Bookmarks";
    acc[key] = acc[key] || [];
    acc[key].push(b);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-800 flex items-center gap-2">
          <Bookmark size={24} className="text-clay-500" /> Bookmarks
        </h1>
        <p className="text-ink-500 text-sm mt-1">Resources you've saved for revision.</p>
      </div>

      {bookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks yet"
          message="Save resources while browsing to find them quickly here."
        />
      ) : (
        Object.entries(grouped).map(([collection, items]) => (
          <section key={collection} className="mb-6">
            <h2 className="font-display font-semibold text-ink-800 mb-3">{collection}</h2>
            <div className="bg-white rounded-card border border-ink-100 divide-y divide-ink-100">
              {items.map((b) => {
                const meta = getResourceTypeMeta(b.resource_type);
                return (
                  <div key={b.id} className="flex items-center justify-between px-4 py-3">
                    <Link
                      to={`/resources/${b.resource}`}
                      className="flex items-center gap-3 min-w-0 flex-1"
                    >
                      <div className={`w-1.5 h-8 rounded-full ${meta.spine}`} />
                      <span className="text-sm font-medium text-ink-800 truncate">
                        {b.resource_title}
                      </span>
                    </Link>
                    <button
                      onClick={() => handleRemove(b.id)}
                      className="text-ink-400 hover:text-clay-600 p-1"
                      aria-label="Remove bookmark"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
