// src/App.tsx (Tambahkan Route Categories)
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import CategoriesPage from "./pages/CategoriesPage"; // <-- Impor halaman baru

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
        {/* Bungkus Routes dengan main dan container jika perlu padding global */}
        <main className="global-main-content">
          {" "}
          {/* Beri class jika perlu styling */}
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicRoute />}>
              {" "}
              <Route index element={<LandingPage />} />{" "}
            </Route>
            <Route path="/login" element={<PublicRoute />}>
              {" "}
              <Route index element={<LoginPage />} />{" "}
            </Route>
            <Route path="/register" element={<PublicRoute />}>
              {" "}
              <Route index element={<RegisterPage />} />{" "}
            </Route>

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute />}>
              {" "}
              <Route index element={<DashboardPage />} />{" "}
            </Route>
            <Route path="/tasks" element={<ProtectedRoute />}>
              {" "}
              <Route index element={<TasksPage />} />{" "}
            </Route>
            <Route path="/profile" element={<ProtectedRoute />}>
              {" "}
              <Route index element={<ProfilePage />} />{" "}
            </Route>
            {/* --- Tambahkan Route Categories --- */}
            <Route path="/categories" element={<ProtectedRoute />}>
              {" "}
              <Route index element={<CategoriesPage />} />{" "}
            </Route>
            {/* --- Akhir Tambahan --- */}

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
};

export default App;
