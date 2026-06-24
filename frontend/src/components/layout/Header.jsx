/**
 * components/layout/Header.jsx
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Wifi, WifiOff, LogOut, ChevronDown, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

const ROLE_LABELS = {
  STUDENT: "Student",
  TEACHER: "Teacher",
  COORDINATOR: "Subject Coordinator",
  ADMIN: "Administrator",
};

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/browse?search=${encodeURIComponent(query.trim())}`);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || user.username[0].toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-20 bg-paper/95 backdrop-blur-sm border-b border-ink-100">
      <div className="flex items-center gap-3 px-4 lg:px-6 py-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-ink-700"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resources, subjects, topics..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-card border border-ink-100 bg-white focus:outline-none focus:border-clay-500 placeholder:text-ink-300"
            />
          </div>
        </form>

        <div className="flex-1" />

        {/* Connectivity indicator — Offline Access is core to the spec */}
        <div
          className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
            isOnline ? "bg-leaf-50 text-leaf-600" : "bg-gold-50 text-gold-600"
          }`}
          title={isOnline ? "Connected to the network" : "Offline — showing locally available resources"}
        >
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          {isOnline ? "Online" : "Offline"}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-ink-50 transition-colors"
          >
            <span className="w-8 h-8 rounded-full bg-ink-700 text-white text-xs font-semibold flex items-center justify-center">
              {initials}
            </span>
            <span className="hidden md:block text-left">
              <span className="block text-sm font-medium text-ink-800 leading-tight">
                {user?.first_name || user?.username}
              </span>
              <span className="block text-[11px] text-ink-500 leading-tight">
                {ROLE_LABELS[user?.role] || user?.role}
              </span>
            </span>
            <ChevronDown size={15} className="text-ink-400" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-card border border-ink-100 shadow-shelf py-1.5 z-20">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-ink-700 hover:bg-ink-50"
                >
                  My Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-clay-600 hover:bg-clay-50"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
