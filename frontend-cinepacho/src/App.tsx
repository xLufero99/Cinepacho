// @ts-nocheck
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { BookingProvider, useBookingContext } from './contexts/BookingContext';
import { LoyaltyProvider } from './contexts/LoyaltyContext';
import { useAuth, AuthProvider } from './contexts/AuthContext';

import { useState } from 'react';

import Login from './pages/Login';
import Landing from './pages/Landing';
import MovieDetails from './pages/MovieDetails';
import Booking from './pages/Booking';
import Snacks from './pages/Snacks';
import MovieSurvey from './pages/MovieSurvey';
import Checkout from './pages/Checkout';
import EmployeeCheckout from './pages/employee/EmployeeCheckout';
import Loyalty from './pages/Loyalty';
import WelcomeLocationModal from './components/common/WelcomeLocationModal';
import Dashboard from './pages/admin/Dashboard';
import DailySummary from './pages/admin/DailySummary';
import DashboardEmpleado from './pages/employee/DashboardEmpleado';
import MultiplexManagement from './pages/admin/MultiplexManagement';
import EmployeeManagement from './pages/admin/EmployeeManagement';
import UserManagement from './pages/admin/UserManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import CreateFunction from './pages/admin/CreateFunction';
import CreateMovie from './pages/admin/CreateMovie';
import RemoveMovieFromBillboard from './pages/admin/RemoveMovieFromBillboard';
import FunctionSchedule from './pages/admin/FunctionSchedule';
import BookingAssisted from './components/dashboard/assisted/BookingAssisted';
import Register from './pages/Register';

function ProtectedAdminRoute({ children }) {
  const { user } = useAuth();

  // ✅ CORREGIDO: Normalizar rol a minúsculas y permitir 'administrador'
  const userRol = user?.rol?.toLowerCase();
  const allowedRoles = ['admin', 'administrador'];
  
  if (!user || !allowedRoles.includes(userRol)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function ProtectedEmployeeRoute({ children }) {
  const { user } = useAuth();

  const userRol = user?.rol?.toLowerCase();
  const allowedRoles = ['empleado', 'admin', 'administrador'];

  if (!user || !allowedRoles.includes(userRol)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppContent() {
  const {
    selectedHeadquarters,
    updateHeadquartersSelection,
    closeLocationModal
  } = useBookingContext();

  const { user } = useAuth();

  const handleLocationSelect = (cinema) => {
    updateHeadquartersSelection(cinema);
    closeLocationModal();
  };

  return (
    <>
      {/* LOCATION MODAL */}
      {!selectedHeadquarters && (
        <WelcomeLocationModal
          isOpen={!selectedHeadquarters}
          onClose={closeLocationModal}
          onLocationSelect={handleLocationSelect}
        />
      )}
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/booking/showtime/:showtimeId" element={<Booking />} />
        <Route path="/snacks" element={<Snacks />} />
        <Route path="/survey" element={<MovieSurvey />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/loyalty" element={<Loyalty />} />
        <Route path="/success" element={<Navigate to="/" replace />} />

        {/* ADMIN LAYOUT */}
        <Route path="/admin" element={<ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DailySummary />} />
          <Route path="programacion" element={<FunctionSchedule />} />
          <Route path="usuarios" element={<UserManagement />} />
          <Route path="multiplex" element={<MultiplexManagement />} />
          <Route path="personal" element={<EmployeeManagement />} />
          <Route path="inventory" element={<InventoryManagement />} />
          <Route path="create-function" element={<CreateFunction />} />
          <Route path="create-movie" element={<CreateMovie />} />
          <Route path="remove-movie" element={<RemoveMovieFromBillboard />} />
        </Route>

        {/* EMPLOYEE LAYOUT */}
        <Route path="/employee" element={<ProtectedEmployeeRoute><DashboardEmpleado /></ProtectedEmployeeRoute>}>
          <Route index element={<Navigate to="assistedBooking" replace />} />
          <Route path="assistedBooking" element={<BookingAssisted />} />
          <Route path="assistedSnacks" element={<Snacks />} />
          <Route path="movie/:id" element={<MovieDetails />} />
          <Route path="booking/showtime/:showtimeId" element={<Booking />} />
          <Route path="checkout" element={<EmployeeCheckout />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LoyaltyProvider>
          <BookingProvider>
            <AppContent />
          </BookingProvider>
        </LoyaltyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}