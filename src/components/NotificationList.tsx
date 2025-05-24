import React, { useEffect, useState } from "react";

interface Notification {
  _id: string;
  source: string;
  content: string;
  created_at: string;
  type: string;
  user_read_ids: string[];
}

const NotificationsList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/settings/notifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/settings/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ notification_id: id }),
      });
      if (!response.ok) throw new Error("Failed to mark notification as read");

      // Remove notification from UI
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      alert("Error marking notification as read");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) return <div>Loading notifications...</div>;
  if (error) return <div>Error: {error}</div>;
  if (notifications.length === 0) return <div>No new notifications</div>;

  return (
    <div className="notifications-list p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      <ul>
        {notifications.map(({ _id, source, content, created_at }) => (
          <li
            key={_id}
            className="border p-3 mb-3 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{content}</p>
              <p className="text-xs text-gray-500">
                Source: {source} — {new Date(created_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => markAsRead(_id)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
              aria-label="Mark notification as read"
            >
              ✓
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsList;
