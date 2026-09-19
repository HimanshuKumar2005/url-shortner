import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import { AppProvider } from './context/AppContext';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';

function AppRoutes() {
  return <Routes><Route element={<AppLayout />}><Route path="/" element={<HomePage />} /><Route path="/dashboard" element={<DashboardPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Route></Routes>;
}

function App() {
  return <AppProvider><AppRoutes /></AppProvider>;
}

export default App;
