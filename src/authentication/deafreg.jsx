import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Heart,
  Sparkles,
  UserCog,
  Phone,
} from "lucide-react";
import "./deafreg.css";

export default function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("deaf");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    role: "deaf",
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    preferredSignLanguage: "",
    communicationPreference: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    medicalNotes: "",
    adminDepartment: "",
    adminAccessCode: "",
  });

  // 🌀 Handle role switch
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setFormData({ ...formData, role: newRole });
    setMessage("");
  };

  // 🧾 Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage("⚠️ Passwords do not match!");
      return;
    }

    try {
      const endpoint =
        role === "admin"
          ? "http://localhost:8000/admin/signup"
          : "http://localhost:8000/deaf/signup";

      const res = await axios.post(endpoint, formData);
      setMessage(res.data.message || "Account created successfully!");
      if (res.status === 201) {
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSignup}>
        {/* ===== Header Section ===== */}
        <div className="signup-header">
          <div className="logo-circle">
            <Heart size={40} />
            <Sparkles size={20} className="logo-sparkle" />
          </div>
          <h2 className="signup-title">Create Account</h2>
          <p className="signup-subtitle">
            Join our inclusive communication platform 💬
          </p>
        </div>

        {/* ===== Role Selector ===== */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${role === "deaf" ? "active" : ""}`}
            onClick={() => handleRoleChange("deaf")}
          >
            <User size={20} /> Deaf User
          </button>
          <button
            type="button"
            className={`role-btn ${role === "admin" ? "active" : ""}`}
            onClick={() => handleRoleChange("admin")}
          >
            <UserCog size={20} /> Administrator
          </button>
        </div>

        {/* ===== Common Fields ===== */}
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          className="signup-input"
          required
        />

        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          className="signup-input"
          required
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email Address"
          className="signup-input"
          required
        />

        {/* ===== Password Section ===== */}
        <div className="password-row">
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="signup-input"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-password"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="signup-input"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="toggle-password"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* ===== Deaf Role Fields ===== */}
        {role === "deaf" && (
          <>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="signup-input"
            />

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="signup-input"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-Binary">Non-Binary</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="signup-input"
              required
            />

            {/* Preferred Sign Language */}
            <select
              name="preferredSignLanguage"
              value={formData.preferredSignLanguage}
              onChange={handleChange}
              className="signup-input"
              required
            >
              <option value="">Select Preferred Sign Language</option>
              <option value="Indian Sign Language (ISL)">
                Indian Sign Language (ISL)
              </option>
              <option value="American Sign Language (ASL)">
                American Sign Language (ASL)
              </option>
              <option value="British Sign Language (BSL)">
                British Sign Language (BSL)
              </option>
              <option value="International Sign (IS)">International Sign</option>
              <option value="Other">Other</option>
            </select>

            {/* Communication Preference */}
            <select
              name="communicationPreference"
              value={formData.communicationPreference}
              onChange={handleChange}
              className="signup-input"
              required
            >
              <option value="">Select Communication Preference</option>
              <option value="Text Chat">Text Chat</option>
              <option value="Video Call with Interpreter">
                Video Call with Interpreter
              </option>
              <option value="Sign Language Only">Sign Language Only</option>
              <option value="Voice & Text">Voice & Text</option>
            </select>

            {/* Emergency Contact Info */}
            <input
              type="text"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              placeholder="Emergency Contact Name"
              className="signup-input"
            />

            <input
              type="tel"
              name="emergencyContactNumber"
              value={formData.emergencyContactNumber}
              onChange={handleChange}
              placeholder="Emergency Contact Number"
              className="signup-input"
            />

            <textarea
              name="medicalNotes"
              value={formData.medicalNotes}
              onChange={handleChange}
              placeholder="Medical Notes (Optional)"
              className="signup-input"
            ></textarea>
          </>
        )}

        {/* ===== Admin Role Fields ===== */}
        {role === "admin" && (
          <>
            <input
              type="text"
              name="adminDepartment"
              value={formData.adminDepartment}
              onChange={handleChange}
              placeholder="Department Name"
              className="signup-input"
              required
            />
            <input
              type="text"
              name="adminAccessCode"
              value={formData.adminAccessCode}
              onChange={handleChange}
              placeholder="Admin Access Code (Required)"
              className="signup-input"
              required
            />
          </>
        )}

        {/* ===== Submit Button ===== */}
        <button type="submit" className="signup-button">
          Create Account
        </button>

        {/* ===== Message ===== */}
        {message && (
          <p
            className={`signup-message ${
              message.toLowerCase().includes("success") ? "success" : "error"
            }`}
          >
            {message}
          </p>
        )}

        {/* ===== Login Redirect ===== */}
        <p className="login-text">
          Already have an account?{" "}
          <Link to="/login" className="login-link">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
