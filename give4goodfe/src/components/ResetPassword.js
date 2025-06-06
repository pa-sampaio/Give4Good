import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/ResetPassword.css";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const { email, code } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !code) {
      Swal.fire({
        icon: "error",
        title: "Missing information",
        text: "Please verify your code first.",
      });
      navigate("/forgot-password");
      return;
    }

    if (password.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Weak password",
        text: "Password must be at least 6 characters.",
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Passwords do not match",
        text: "Please confirm your password correctly.",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword: password }),
      });

      if (!response.ok) {
        throw new Error("Failed to reset password.");
      }

      Swal.fire({
        icon: "success",
        title: "Password reset successfully!",
        text: "You can now login with your new password.",
      }).then(() => {
        navigate("/announcementLogin");
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Reset failed",
        text: error.message,
      });
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Create New Password</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="password">New Password:</label>
        <input
          type="password"
          id="password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
        />
        <label htmlFor="confirmPassword">Confirm New Password:</label>
        <input
          type="password"
          id="confirmPassword"
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}

export default ResetPassword;
