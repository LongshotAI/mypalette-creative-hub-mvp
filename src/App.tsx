
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Portfolios from './pages/Portfolios';
import PortfolioDetail from './pages/PortfolioDetail';
import UserProfile from './pages/UserProfile';
import Education from './pages/Education';
import OpenCalls from './pages/OpenCalls';
import Search from './pages/Search';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/layout/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/portfolios" element={<Portfolios />} />
      <Route path="/portfolio/:portfolioId" element={<PortfolioDetail />} />
      <Route path="/user/:userId" element={<UserProfile />} />
      <Route path="/education" element={<Education />} />
      <Route path="/open-calls" element={<OpenCalls />} />
      <Route path="/search" element={<Search />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
