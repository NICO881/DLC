/**
 * pages/shared/NotificationsPage.jsx
 */
import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import * as interactionsApi from "../../api/interactions";
import { EmptyState, PageLoader, Card } from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const TYPE_LABELS = {
  NEW_RESOURCE: "New Resource",
  UPDATE: "Update",
  RECOMMENDATION: "Recommendation",
  REVIEW_REQUEST: "Review Request",
  SHARE: "Shared With You",
  SYSTEM: "System Notice",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    interactionsApi
      .listNotifications()
      .then((data) => setNotifications(data.results ?? data))
      .finally(() => setLoading(false));
  }

  async function handleMarkAllRead() {
    await interactionsApi.markAllNotificationsRead();
    load();
  }

  async function handleMarkRead(id) {
    await interactionsApi.markNotificationRead(id);
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, is_read: true } : x)));
  }

  if (loading) return <PageLoader />;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-800 flex items-center gap-2">
            <Bell size={24} className="text-clay-500" /> Notifications
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" message="New resources and updates will show up here." />
      ) : (
        <Card className="divide-y divide-ink-100">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.is_read && handleMarkRead(n.id)}
              className={`w-full text-left px-4 py-3.5 flex items-start gap-3 ${
                !n.is_read ? "bg-clay-50/40" : ""
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  !n.is_read ? "bg-clay-500" : "bg-transparent"
                }`}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-ink-500 uppercase tracking-wide">
                    {TYPE_LABELS[n.notification_type] || n.notification_type}
                  </span>
                  <span className="text-xs text-ink-400">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm font-medium text-ink-800">{n.title}</p>
                {n.message && <p className="text-sm text-ink-500 mt-0.5">{n.message}</p>}
              </div>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}
