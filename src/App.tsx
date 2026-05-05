import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/Dashboard';
import { AuditsPage } from './pages/Audits';
import { RisksPage } from './pages/Risks';
import { SettingsPage } from './pages/Settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'audits', element: <AuditsPage /> },
      { path: 'risks', element: <RisksPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
