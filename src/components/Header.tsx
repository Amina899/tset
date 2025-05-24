import React, { useState, useEffect } from 'react';
import { Bell, User } from 'lucide-react';
import { useAuth } from './AuthContext';

interface Notification {
  _id: string;
  source: string;
  content: string;
  created_at: string;
  type: string;
  user_read_ids: string[];
}

// Fetch all notifications (not just count)
const fetchNotifications = async () => {
  const response = await fetch('http://127.0.0.1:8000/api/settings/notifications', {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    },
  });
  if (!response.ok) {
    console.error('Error fetching notifications');
    return [];
  }
  const data = await response.json();
  return data.notifications || [];
};

const Header: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load notifications on mount
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      const notifs = await fetchNotifications();
      setNotifications(notifs);
      setLoading(false);
    };
    loadNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/settings/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ notification_id: id })
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      alert('Error marking notification as read');
    }
  };

  const notificationsCount = notifications.length;

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center relative">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Crisis Monitoring Dashboard</h1>
        <p className="text-sm text-gray-500">Real-time social media monitoring for suicide prevention</p>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-6">
        {/* Notifications Bell */}
        <div className="relative">
          <Bell
            size={22}
            className="text-gray-600 cursor-pointer"
            onClick={() => setShowNotifications((v) => !v)}
            aria-label="Toggle notifications"
          />
          {notificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notificationsCount}
            </span>
          )}

          {/* Dropdown notifications panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 max-h-96 overflow-auto bg-white border border-gray-300 rounded shadow-lg z-50 p-4">
              <h2 className="text-lg font-semibold mb-3">Notifications</h2>
              {loading && <p>Loading...</p>}
              {!loading && notifications.length === 0 && <p>No new notifications</p>}
              <ul>
                {notifications.map(({ _id, source, content, created_at }) => (
                  <li
                    key={_id}
                    className="border-b border-gray-200 py-2 flex justify-between items-center"
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
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-2">
          <div className="h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium">{user?.email || 'Unknown User'}</p>
            <p className="text-xs text-gray-500">{user?.role || 'Moderator'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
