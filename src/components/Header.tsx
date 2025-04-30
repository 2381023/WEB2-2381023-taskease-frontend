// src/components/Header.tsx (Tambahkan Link Categories)
import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/Header.css"; // Buat file CSS ini jika perlu style khusus

const Header: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Style untuk NavLink aktif (opsional)
  const activeStyle = {
    fontWeight: "bold",
    textDecoration: "underline",
  };

  return (
    <header className="app-header">
      <Link to={isAuthenticated ? "/dashboard" : "/"} className="logo">
        <span className="logo-icon"></span> {/* Ganti dengan ikon Anda */}
        TaskEase
      </Link>
      <nav>
        <ul className="nav-links">
          {isAuthenticated ? (
            <>
              <li>
                <NavLink
                  to="/dashboard"
                  style={({ isActive }) => (isActive ? activeStyle : undefined)}
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/tasks"
                  style={({ isActive }) => (isActive ? activeStyle : undefined)}
                >
                  Tasks
                </NavLink>
              </li>
              {/* --- Link Kategori --- */}
              <li>
                <NavLink
                  to="/categories"
                  style={({ isActive }) => (isActive ? activeStyle : undefined)}
                >
                  Categories
                </NavLink>
              </li>
              {/* --- Akhir Link --- */}
              <li>
                <NavLink
                  to="/profile"
                  style={({ isActive }) => (isActive ? activeStyle : undefined)}
                >
                  Profile ({user?.name})
                </NavLink>
              </li>
              <li>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink
                  to="/login"
                  style={({ isActive }) => (isActive ? activeStyle : undefined)}
                >
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/register"
                  style={({ isActive }) => (isActive ? activeStyle : undefined)}
                >
                  Register
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
