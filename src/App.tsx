import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ContentReview from './components/ContentReview';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import { AuthProvider } from './components/AuthContext';
import SocialMediaFetcher from './components/SocialMediaFetcher';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes with layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={
            <div className="flex h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto">
                  <Outlet />
                </main>
              </div>
            </div>
          }>
            <Route path="/fetch" element={<SocialMediaFetcher />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/content-review" element={<ContentReview />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;