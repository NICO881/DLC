/**
 * pages/student/StudentDashboard.jsx
 *
 * Redesigned to match the reference layout: subject tile grid, a prominent
 * search bar, and a set of content "shelves" (Recent Resources, Past
 * Papers, Favorites, Bookmarks, Popular Videos), plus a connectivity
 * status strip in the footer.
 *
 * Subjects are read live from the database (via useCurriculum), not
 * hardcoded — so swapping in the official NCDC subject list later is a
 * data change only; this page doesn't need to change.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search as SearchIcon, Star, Bookmark, MoreHorizontal } from "lucide-react";
import * as resourcesApi from "../../api/resources";
import * as interactionsApi from "../../api/interactions";
import { useAuth } from "../../context/AuthContext";
import { useCurriculum } from "../../hooks/useCurriculum";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { Card, PageLoader } from "../../components/ui/Card";
import ShelfItem from "../../components/resources/ShelfItem";
import VideoCard from "../../components/resources/VideoCard";
import { getSubjectIconMeta } from "../../utils/resourceTypes";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { subjects } = useCurriculum();

  const [search, setSearch] = useState("");
  const [recent, setRecent] = useState([]);
  const [pastPapers, setPastPapers] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      resourcesApi.listResources({ ordering: "-created_at" }),
      resourcesApi.listResources({ resource_type: "PAST_PAPER", ordering: "-created_at" }),
      interactionsApi.listBookmarks(),
      resourcesApi.listPopularResources({ resource_type: "VIDEO", limit: 4 }),
    ])
      .then(([recentData, papersData, bookmarkData, videoData]) => {
        if (cancelled) return;
        setRecent(recentData.results.slice(0, 4));
        setPastPapers(papersData.results.slice(0, 4));
        setBookmarks((bookmarkData.results ?? bookmarkData).slice(0, 4));
        setVideos(videoData);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/browse?search=${encodeURIComponent(search.trim())}`);
    }
  }

  if (loading) return <PageLoader />;

  // Favorites reuses the bookmarks collection named "Favorites"; everything
  // else lands under "My Bookmarks" (see BookmarksPage's grouping logic).
  const favorites = bookmarks.filter((b) => b.collection_name === "Favorites");
  const generalBookmarks = bookmarks.filter((b) => b.collection_name !== "Favorites");

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-5">
        <h1 className="font-display text-xl font-semibold text-ink-800">
          Welcome, {user?.first_name || user?.username}
          {user?.school_class && <span className="text-ink-500 font-normal"> — {user.school_class}</span>}
        </h1>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="relative max-w-2xl">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, videos, topics..."
            className="w-full pl-12 pr-4 py-3 text-sm rounded-card border border-ink-100 bg-white shadow-shelf focus:outline-none focus:border-clay-500"
          />
        </div>
      </form>

      {/* Subject tile grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-7">
        {subjects.map((subject) => {
          const meta = getSubjectIconMeta(subject.name);
          const Icon = meta.icon;
          return (
            <Link
              key={subject.id}
              to={`/browse?subject=${subject.id}`}
              className="flex flex-col items-center justify-center gap-2 bg-white rounded-card border border-ink-100 shadow-shelf py-5 px-2 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-150"
            >
              <Icon size={26} className={meta.color} strokeWidth={1.75} />
              <span className="text-xs font-semibold text-ink-800 text-center leading-tight">
                {subject.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Content shelves grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column: Recent Resources + Past Papers */}
        <div className="lg:col-span-1 space-y-5">
          <ShelfCard title="Recent Resources">
            {recent.length === 0 ? (
              <EmptyShelf text="No resources yet." />
            ) : (
              <div className="flex gap-1 overflow-x-auto scroll-thin pb-1">
                {recent.map((r) => (
                  <ShelfItem key={r.id} resource={r} />
                ))}
              </div>
            )}
          </ShelfCard>

          <ShelfCard title="Past Papers">
            {pastPapers.length === 0 ? (
              <EmptyShelf text="No past papers yet." />
            ) : (
              <div className="flex gap-1 overflow-x-auto scroll-thin pb-1">
                {pastPapers.map((r) => (
                  <ShelfItem key={r.id} resource={r} />
                ))}
              </div>
            )}
          </ShelfCard>
        </div>

        {/* Middle column: Favorites + Bookmarks */}
        <div className="lg:col-span-1 space-y-5">
          <ShelfCard title="Favorites">
            {favorites.length === 0 ? (
              <EmptyShelf text="Star resources to find them here." />
            ) : (
              <div className="space-y-2.5">
                {favorites.map((b) => (
                  <Link
                    key={b.id}
                    to={`/resources/${b.resource}`}
                    className="flex items-start gap-2 group"
                  >
                    <Star size={15} className="text-gold-500 mt-0.5 shrink-0" fill="currentColor" />
                    <span className="text-sm text-ink-700 group-hover:text-clay-600 leading-snug">
                      {b.resource_title}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </ShelfCard>

          <ShelfCard title="Bookmarks">
            {generalBookmarks.length === 0 ? (
              <EmptyShelf text="Save resources while browsing." />
            ) : (
              <div className="space-y-2.5">
                {generalBookmarks.map((b) => (
                  <Link
                    key={b.id}
                    to={`/resources/${b.resource}`}
                    className="flex items-start gap-2 group"
                  >
                    <Bookmark size={15} className="text-clay-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-ink-700 group-hover:text-clay-600 leading-snug">
                      {b.resource_title}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </ShelfCard>
        </div>

        {/* Right column: Popular Videos */}
        <div className="lg:col-span-1">
          <ShelfCard title="Popular Videos">
            {videos.length === 0 ? (
              <EmptyShelf text="No videos available yet." />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {videos.map((v) => (
                  <VideoCard key={v.id} resource={v} />
                ))}
              </div>
            )}
          </ShelfCard>
        </div>
      </div>

      {/* Status footer */}
      <div className="flex items-center justify-end gap-4 mt-6 text-xs text-ink-400">
        <span>{isOnline ? "Connected to school server" : "Offline mode active"}</span>
      </div>
    </div>
  );
}

function ShelfCard({ title, children }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-sm text-ink-800 uppercase tracking-wide">
          {title}
        </h2>
        <MoreHorizontal size={16} className="text-ink-300" />
      </div>
      {children}
    </Card>
  );
}

function EmptyShelf({ text }) {
  return <p className="text-xs text-ink-400 py-3">{text}</p>;
}
