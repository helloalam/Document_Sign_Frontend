// src/components/Route/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ element: Element }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) return <p className="text-center py-8">Loading...</p>;

  return isAuthenticated ? <Element /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;