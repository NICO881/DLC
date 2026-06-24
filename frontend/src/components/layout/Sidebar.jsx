/**
 * components/layout/Sidebar.jsx
 */
import { NavLink } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { getNavItems } from "../../utils/navigation";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const navItems = getNavItems(user?.role);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-ink-900/40 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-ink-700 text-paper flex flex-col z-40 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-ink-500/40">
          <div className="w-9 h-9 rounded-card bg-clay-500 flex items-center justify-center shrink-0">
            <BookOpen size={19} className="text-white" strokeWidth={2.25} />
          </div>
          <div className="leading-tight">
            <p className="font-display font-semibold text-[15px] text-white">Digital Library</p>
            <p className="text-[11px] text-ink-300">Learning Centre</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-card text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-clay-500 text-white"
                    : "text-ink-100 hover:bg-ink-500/40 hover:text-white"
                }`
              }
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-ink-500/40 text-[11px] text-ink-300">
          <p>Digital Learning Centre</p>
          <p>Term I · 2026</p>
        </div>
      </aside>
    </>
  );
}
