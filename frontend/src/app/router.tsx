import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout } from './Layout';
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Home } from '../pages/Home';
import { Feed } from '../pages/Feed';
import { Report } from '../pages/Report';
import { ComplaintDetail } from '../pages/ComplaintDetail';
import { MyComplaints } from '../pages/MyComplaints';
import { Profile } from '../pages/Profile';
import { Leaderboard } from '../pages/Leaderboard';
import { Notifications } from '../pages/Notifications';
import { OfficerQueue } from '../pages/OfficerQueue';
import { OfficerAnalytics } from '../pages/OfficerAnalytics';
import { AdminUsers } from '../pages/AdminUsers';
import { AdminDepartments } from '../pages/AdminDepartments';
import { NotFound } from '../pages/NotFound';


const PrivateRoute = ({ roles }: { roles?: string[] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-slate-blue-600 border-t-transparent rounded-full" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
};

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/complaints/:id', element: <ComplaintDetail /> },
  { path: '/leaderboard', element: <Leaderboard /> },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/map', element: <Home /> },
          { path: '/feed', element: <Feed /> },
          { path: '/report', element: <Report /> },
          { path: '/my-complaints', element: <MyComplaints /> },
          { path: '/profile', element: <Profile /> },
          { path: '/notifications', element: <Notifications /> },
          {
            element: <PrivateRoute roles={['officer', 'admin']} />,
            children: [
              { path: '/officer/queue', element: <OfficerQueue /> },
              { path: '/officer/analytics', element: <OfficerAnalytics /> },
            ],
          },
          {
            element: <PrivateRoute roles={['admin']} />,
            children: [
              { path: '/admin/users', element: <AdminUsers /> },
              { path: '/admin/departments', element: <AdminDepartments /> },
            ],
          },

        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

export const AppRouter = () => <RouterProvider router={router} />;
