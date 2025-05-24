import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = () => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return token ? <Outlet /> : <Navigate to="/login" replace />;  
};

export default ProtectedRoute;