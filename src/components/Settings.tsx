import React, { useState, useEffect } from 'react';
import { Bell, Lock, Database } from 'lucide-react';

// Fetch user settings
const fetchSettings = async () => {
  const response = await fetch('http://127.0.0.1:8000/api/settings', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch settings');
  const data = await response.json();
  return data;
};

// Update notification preferences
const updateNotificationPreferences = async (preferences: {
  high_risk_alert_notification_allowed: boolean;
  user_response_alert_notification_allowed: boolean;
}) => {
  const response = await fetch('http://127.0.0.1:8000/api/settings/notification/change-prefs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
    body: JSON.stringify(preferences),
  });
  if (!response.ok) throw new Error('Failed to update notification preferences');
  const data = await response.json();
  return data;
};

// Change user password
const changePassword = async (password: string) => {
  const response = await fetch('http://127.0.0.1:8000/api/settings/security', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) throw new Error('Failed to change password');
  const data = await response.json();
  return data;
};

// Export data
const exportData = async () => {
  const response = await fetch('http://127.0.0.1:8000/api/settings/export-data', { method: 'POST' });
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'high_risk_data.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } else {
    console.error('Error exporting data');
  }
};

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [notifications, setNotifications] = useState<{
    high_risk_alert_notification_allowed: boolean;
    user_response_alert_notification_allowed: boolean;
  }>({
    high_risk_alert_notification_allowed: false,
    user_response_alert_notification_allowed: false,
  });
  const [password, setPassword] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Load settings and notification preferences on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchSettings();
        setSettings(data);

        // Correctly map notification preferences keys from backend
        const prefs = data?.notification_preferences || {};
        setNotifications({
          high_risk_alert_notification_allowed: !!prefs.high_risk_alert_notification_allowed,
          user_response_alert_notification_allowed: !!prefs.user_response_alert_notification_allowed,
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Checkbox toggle handler
  const handleNotificationChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof typeof notifications
  ) => {
    setNotifications(prev => ({
      ...prev,
      [key]: e.target.checked,
    }));
  };

  // Save notification prefs, update state from server response for sync
  const handleSaveNotifications = async () => {
    setClicked(true);
    try {
      const prefsToSend = {
        high_risk_alert_notification_allowed: notifications.high_risk_alert_notification_allowed,
        user_response_alert_notification_allowed: notifications.user_response_alert_notification_allowed,
      };

      const updatedSettings = await updateNotificationPreferences(prefsToSend);

      setSettings((prev: any) => ({
        ...prev,
        notification_preferences: updatedSettings,
      }));

      // Sync checkbox state with server response to avoid mismatch
      setNotifications({
        high_risk_alert_notification_allowed: !!updatedSettings.high_risk_alert_notification_allowed,
        user_response_alert_notification_allowed: !!updatedSettings.user_response_alert_notification_allowed,
      });
    } catch (err) {
      console.error('Notification update failed:', err);
    } finally {
      setTimeout(() => setClicked(false), 500);
    }
  };

  // Change password handler
  const handleChangePassword = async () => {
    if (password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    try {
      const result = await changePassword(password);
      if (result?.msg) {
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
        setPassword('');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password');
    }
  };

  // Export data handler
  const handleExportData = async () => {
    await exportData();
  };

  const notificationOptions = [
    { label: 'High-risk alerts', key: 'high_risk_alert_notification_allowed' as const },
    { label: 'User responses', key: 'user_response_alert_notification_allowed' as const },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notification Preferences Section with synced checkbox states */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="text-indigo-600" size={24} />
            <h2 className="text-lg font-semibold">Notification Preferences</h2>
          </div>
          <div className="space-y-4">
            {notificationOptions.map(({ label, key }) => (
              <label key={key} className="flex items-center justify-between">
                <span className="text-gray-700">{label}</span>
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={(e) => handleNotificationChange(e, key)}
                />
              </label>
            ))}

            <button
              onClick={handleSaveNotifications}
              className={`mt-4 p-2 rounded text-white transition-colors duration-300 ${
                clicked ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              Save Notifications
            </button>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Lock className="text-indigo-600" size={24} />
            <h2 className="text-lg font-semibold">Security</h2>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleChangePassword}
              className="w-full text-left px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Password change success popup */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-green-500 text-white py-3 px-6 rounded-lg shadow-lg transform scale-100 transition-all duration-500 opacity-100 animate-fadeInOut">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="white"
                  className="mr-2"
                >
                  <path d="M10 17l5-5-1.4-1.4-3.6 3.6L8.4 12l-1.4 1.4L10 17z" />
                </svg>
                <span>Password Changed Successfully</span>
              </div>
            </div>
          </div>
        )}

        {/* Data Management Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="text-indigo-600" size={24} />
            <h2 className="text-lg font-semibold">Data Management</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Data Retention Period</span>
              <select className="border border-gray-300 rounded-lg px-3 py-2">
                <option>30 days</option>
                <option>60 days</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Auto-Archive</span>
              <input
                type="checkbox"
                defaultChecked
                className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
            </div>
            <button
              onClick={handleExportData}
              className="w-full text-left px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
