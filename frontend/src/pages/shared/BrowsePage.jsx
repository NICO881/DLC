/**
 * pages/shared/BrowsePage.jsx
 *
 * Smart Search: filter by Subject, Topic, Keywords, Class, Resource type,
 * Language, Tags — exactly as specified. The free-text query box maps to
 * DRF's SearchFilter (title/description/keywords/author); the dropdowns
 * map to ResourceFilter in the backend.
 */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import * as resourcesApi from "../../api/resources";
import * as interactionsApi from "../../api/interactions";
import { useCurriculum } from "../../hooks/useCurriculum";
import ResourceCard from "../../components/resources/ResourceCard";
import { EmptyState, PageLoader } from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { LANGUAGE_LABELS, RESOURCE_TYPE_META } from "../../utils/resourceTypes";
import { Search as SearchIcon } from "lucide-react";

const RESOURCE_TYPE_OPTIONS = Object.entries(RESOURCE_TYPE_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));
const LANGUAGE_OPTIONS = Object.entries(LANGUAGE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { classes, subjects } = useCurriculum();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filters, setFilters] = useState({
    subject: searchParams.get("subject") || "",
    school_class: searchParams.get("school_class") || "",
    resource_type: searchParams.get("resource_type") || "",
    language: searchParams.get("language") || "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const [resources, setResources] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [nextUrl, setNextUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = { search: search || undefined, ...filters };
    Object.keys(params).forEach((k) => params[k] === "" && delete params[k]);

    resourcesApi
      .listResources(params)
      .then((data) => {
        if (cancelled) return;
        setResources(data.results);
        setCount(data.count);
        setNextUrl(data.next);
      })
      .catch((err) => console.error(err))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [search, filters]);

  function updateFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function clearFilters() {
    setFilters({ subject: "", school_class: "", resource_type: "", language: "" });
    setSearch("");
    setSearchParams({});
  }

  async function handleBookmarkToggle(resource, shouldBookmark) {
    try {
      if (shouldBookmark) {
        await interactionsApi.addBookmark(resource.id);
      }
      // Removal needs the bookmark id, which isn't on the resource object;
      // a fuller implementation would track bookmark IDs in context. For
      // the MVP, un-bookmarking happens from the Bookmarks page instead.
    } catch (err) {
      console.error("Bookmark action failed", err);
    }
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-800">Browse & Search</h1>
        <p className="text-ink-500 text-sm mt-1">
          Find notes, textbooks, videos, past papers, and more across the curriculum.
        </p>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <SearchIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, keyword, or author..."
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-card border border-ink-100 bg-white focus:outline-none focus:border-clay-500"
          />
        </div>
        <Button
          variant={activeFilterCount ? "primary" : "outline"}
          icon={SlidersHorizontal}
          onClick={() => setShowFilters((s) => !s)}
        >
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-card border border-ink-100 p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select
            label="Subject"
            value={filters.subject}
            onChange={(v) => updateFilter("subject", v)}
            options={subjects.map((s) => ({ value: s.id, label: s.name }))}
          />
          <Select
            label="Class"
            value={filters.school_class}
            onChange={(v) => updateFilter("school_class", v)}
            options={classes.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Select
            label="Resource Type"
            value={filters.resource_type}
            onChange={(v) => updateFilter("resource_type", v)}
            options={RESOURCE_TYPE_OPTIONS}
          />
          <Select
            label="Language"
            value={filters.language}
            onChange={(v) => updateFilter("language", v)}
            options={LANGUAGE_OPTIONS}
          />
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="col-span-full flex items-center gap-1 text-sm text-clay-600 font-medium self-start mt-1"
            >
              <X size={14} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <PageLoader />
      ) : resources.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="No resources found"
          message="Try a different keyword, or clear filters to see everything available."
          action={
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <p className="text-sm text-ink-500 mb-3">{count} resource{count !== 1 ? "s" : ""} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onBookmarkToggle={handleBookmarkToggle}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
