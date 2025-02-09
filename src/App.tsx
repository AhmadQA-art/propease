import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import RequestAccess from './pages/RequestAccess';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        !isAuthenticated ? <Login /> : <Navigate to="/" replace />
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
        {/* Add nested routes for the dashboard here */}
        <Route index element={<div>Dashboard Home</div>} />
        <Route path="rentals" element={<div>Rentals</div>} />
        {/* Add other dashboard routes */}
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;