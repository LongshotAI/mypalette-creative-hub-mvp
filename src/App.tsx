
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Index from './pages/Index';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/layout/ProtectedRoute';
import NotFound from './pages/NotFound';
import Portfolios from './pages/Portfolios';
import PortfolioDetail from './pages/PortfolioDetail';
import UserProfile from './pages/UserProfile';
import UserInfo from './pages/UserInfo';
import Search from './pages/Search';
import OpenCalls from './pages/OpenCalls';
import Education from './pages/Education';
import PaymentConfirmation from './pages/PaymentConfirmation';
import Admin from './pages/Admin';
import { AuthProvider } from './contexts/AuthContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';

function App() {
  return (
    <AuthProvider>
      <AnalyticsProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/user-profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/user-info" element={<ProtectedRoute><UserInfo /></ProtectedRoute>} />
          <Route path="/portfolios" element={<Portfolios />} />
          <Route path="/portfolio/:portfolioId" element={<PortfolioDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/open-calls" element={<OpenCalls />} />
          <Route path="/education" element={<Education />} />
          <Route path="/payment/confirmation" element={<ProtectedRoute><PaymentConfirmation /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute adminOnly={true}><Admin /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnalyticsProvider>
    </AuthProvider>
  );
}

export default App;
