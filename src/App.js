// src/App.js
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import LoginSignUp from "./pages/user/LoginSignUp";
import Profile from "./pages/user/Profile";
import ForgotPassword from "./pages/user/ForgotPassword";
import ResetPassword from "./pages/user/ResetPassword";
import UpdatePassword from "./pages/user/UpdatePassword";
import UpdateProfile from "./pages/user/UpdateProfile";
import Home from "./pages/Home/Home";
import Pdfsign from "./pages/Home/pdfsign";
import Dashboard from "./pages/Dashboard";

// Components
import { AuthProvider, AuthContext } from "./components/context/AuthContext";
import ProtectedRoute from "./components/Route/ProtectedRoute";
import UserOptions from "./components/Header/UserOptions";

function AppWrapper() {
  const { isAuthenticated, user } = useContext(AuthContext);

  return (
    <>
      {isAuthenticated && <UserOptions user={user} />}
      <Routes>
        <Route path="/" element={<ProtectedRoute element={Home} />} />
        <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
        <Route path="/sign/:id" element={<ProtectedRoute element={Pdfsign} />} />
        <Route path="/profile" element={<ProtectedRoute element={Profile} />} />
        <Route path="/password/update" element={<ProtectedRoute element={UpdatePassword} />} />
        <Route path="/me/update" element={<ProtectedRoute element={UpdateProfile} />} />

        {/* Login route protected for logged-in users */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/profile" replace /> : <LoginSignUp />}
        />

        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />
      </Routes>
      <ToastContainer position="bottom-center" autoClose={3000} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppWrapper />
      </Router>
    </AuthProvider>
  );
}