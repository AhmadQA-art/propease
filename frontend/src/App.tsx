import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import RequestAccess from './pages/auth/RequestAccess';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Rentals from './pages/Rentals';
import RentalDetails from './pages/RentalDetails';
import Leases from './pages/Leases';
import Finances from './pages/Finances';
import Payments from './pages/Payments';
import Documents from './pages/Documents';
import Maintenance from './pages/Maintenance';
import Communications from './pages/Communications';
import Team from './pages/Team';
import People from './pages/People';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        !isAuthenticated ? <Login /> : <Navigate to="/" replace />
      } />
      <Route path="/signup" element={
        !isAuthenticated ? <Signup /> : <Navigate to="/" replace />
      } />
      <Route path="/request-access" element={<RequestAccess />} />

      {/* Protected Routes - Wrap all dashboard routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Layout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        {/* Dashboard routes */}
        <Route index element={<Dashboard />} />
        <Route path="properties" element={<Properties />} />
        <Route path="rentals" element={<Rentals />} />
        <Route path="rentals/:id" element={<RentalDetails />} />
        <Route path="leases" element={<Leases />} />
        <Route path="finances" element={<Finances />} />
        <Route path="payments" element={<Payments />} />
        <Route path="documents" element={<Documents />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="communications" element={<Communications />} />
        <Route path="team" element={<Team />} />
        <Route path="people" element={<People />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;