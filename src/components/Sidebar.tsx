import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LucideDownload,
  LayoutDashboard, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  HeartHandshake, 
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { label: 'Data Fetch', icon: <LucideDownload size={20} />, path: '/fetch' },
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { label: 'Content Review', icon: <MessageSquare size={20} />, path: '/content-review' },
    { label: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
    { label: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
      <div className={`bg-indigo-900 text-white ${collapsed ? 'w-20' : 'w-64'} flex flex-col h-screen transition-all duration-300`}>
      
      
      {/* Top section */}
      <div className="p-5 border-b border-indigo-800 flex justify-between items-center">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <HeartHandshake size={28} className="text-indigo-300" />
            <h1 className="text-xl font-bold">HopeNet</h1>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-indigo-300 hover:text-white"
        >
          {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors border-l-4 ${
                    isActive
                      ? 'bg-indigo-700 border-indigo-300 text-white font-semibold'
                      : 'border-transparent text-indigo-300 hover:bg-indigo-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-indigo-800">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 p-3 rounded-lg text-indigo-300 hover:bg-indigo-800 hover:text-white transition-colors w-full text-left"
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
