import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, AlertCircle, User, UserCog } from "lucide-react";
import "./login.css";

export default function LoginPage() {
  const [role, setRole] = useState("deaf");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setMessage("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Determine the correct API route based on role
      const endpoint =
        role === "admin"
          ? "http://localhost:8000/admin/login"
          : "http://localhost:8000/deaf/login";

      const res = await axios.post(endpoint, {
        email,
        password,
      });

      // Store the token and role locally
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      setMessage(res.data.message || "Login successful!");

      // Redirect based on role
      setTimeout(() => {
        if (res.data.role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/home");
        }
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="signup-wrapper">
        <div className="login-card">
          <div className="card-glow"></div>

          <div className="signup-header">
            <h2 className="login-title">Welcome Back 👋</h2>
            <p className="login-subtitle">Please login to continue</p>
          </div>

          <div className="role-selector">
            <div className="selector-background"></div>
            <button
              type="button"
              className={`role-btn ${role === "deaf" ? "active" : ""}`}
              onClick={() => handleRoleChange("deaf")}
            >
              <User size={20} />
              <span>Deaf</span>
            </button>
            <button
              type="button"
              className={`role-btn ${role === "admin" ? "active" : ""}`}
              onClick={() => handleRoleChange("admin")}
            >
              <UserCog size={20} />
              <span>Administrator</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <input
                type="email"
                placeholder="Enter your email"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>

            {message && (
              <div
                className={`login-message ${
                  message.toLowerCase().includes("success") ? "success" : "error"
                }`}
              >
                {message.toLowerCase().includes("success") ? (
                  <CheckCircle size={18} style={{ marginRight: "6px" }} />
                ) : (
                  <AlertCircle size={18} style={{ marginRight: "6px" }} />
                )}
                {message}
              </div>
            )}

            <p className="signup-text">
              Don’t have an account?{" "}
              <Link to="/signup" className="signup-link">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
