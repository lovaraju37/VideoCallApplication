import { Navigate, Outlet } from 'react-router-dom';
import { loadAuth } from '../services/auth';

export default function ProtectedRoute() {
  const auth = loadAuth();
  if (!auth?.token) {
    return <Navigate to="/auth" replace />;
  }
  return <Outlet />;
}
