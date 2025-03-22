import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, RouteProps } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import RequestAccess from './pages/auth/RequestAccess';
import ForgotPassword from './pages/auth/ForgotPassword';
import UpdatePassword from './pages/auth/UpdatePassword';
import AcceptInvitation from './pages/auth/AcceptInvitation';
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
import AutoApiTest from './components/AutoApiTest';
import { AuthProvider, useAuth } from './contexts/AuthContext';
// Import the entire module to avoid type issues
import * as ReactHotToast from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';

//UI Reference imports
import UIReference from './pages/UIReference';
import Common from './pages/ui-reference/Common';
import PeopleReference from './pages/ui-reference/People';
import TeamReference from './pages/ui-reference/Team';
import TasksReference from './pages/ui-reference/Tasks';
import ActivitiesReference from './pages/ui-reference/Activities';
import TablesReference from './pages/ui-reference/Tables';
import RentalsReference from './pages/ui-reference/Rentals';
import RentalOverviewReference from './pages/ui-reference/RentalOverview';
import UnitsReference from './pages/ui-reference/Units';
import RentalApplicationsReference from './pages/ui-reference/RentalApplications';
import RentalActivitiesReference from './pages/ui-reference/RentalActivities';
import RentalTasksReference from './pages/ui-reference/RentalTasks';

function MainRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>      

      {/* Public Routes */}
      <Route path="/login" element={
        !isAuthenticated ? <Login /> : <Navigate to="/" replace />
      } />
      <Route path="/signup" element={
        !isAuthenticated ? <Signup /> : <Navigate to="/" replace />
      } />

      {/* UI Reference Routes */}
      <Route path="/ui-reference" element={<UIReference />} />
      <Route path="/ui-reference/common" element={<Common />} />
      <Route path="/ui-reference/people" element={<PeopleReference />} />
      <Route path="/ui-reference/team" element={<TeamReference />} />
      <Route path="/ui-reference/tasks" element={<TasksReference />} />
      <Route path="/ui-reference/activities" element={<ActivitiesReference />} />
      <Route path="/ui-reference/tables" element={<TablesReference />} />
      <Route path="/ui-reference/rentals" element={<RentalsReference />} />
      <Route path="/ui-reference/rental-overview" element={<RentalOverviewReference />} />
      <Route path="/ui-reference/units" element={<UnitsReference />} />
      <Route path="/ui-reference/rental-applications" element={<RentalApplicationsReference />} />
      <Route path="/ui-reference/rental-activities" element={<RentalActivitiesReference />} />
      <Route path="/ui-reference/rental-tasks" element={<RentalTasksReference />} />

      {/* authentication routes*/}
      <Route path="/request-access" element={<RequestAccess />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/update-password" element={<UpdatePassword />} />
      <Route path="/account/update-password" element={<Navigate to="/auth/update-password" replace />} />
      <Route path="/auth/accept-invitation" element={<AcceptInvitation />} />
      
      {/* Handle both auth/confirm and direct token links */}
      <Route path="/auth/confirm" element={<UpdatePassword />} />

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
        <Route path="rentals/:id/edit" element={<RentalDetails mode="edit" />} />
        <Route path="leases" element={<Leases />} />
        <Route path="finances" element={<Finances />} />
        <Route path="payments" element={<Payments />} />
        <Route path="documents" element={<Documents />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="communications" element={<Communications />} />
        <Route path="team" element={<Team />} />
        <Route path="people" element={<People />} />
        <Route path="auto-api-test" element={<AutoApiTest />} />

      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App(): JSX.Element {
  return (
    <ErrorBoundary>
      {/* Use ReactHotToast.Toaster to fix the type issue */}
      <ReactHotToast.Toaster position="top-right" />
      <AuthProvider>
        <Router>
          <MainRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;