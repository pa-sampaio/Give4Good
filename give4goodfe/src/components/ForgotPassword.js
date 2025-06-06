import React, { useState } from "react";
import "../css/ForgotPassword.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Missing email",
        text: "Please enter your email address.",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/users/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Email not found or server error.");
      }

      Swal.fire({
        icon: "success",
        title: "Verification code sent!",
        text: "Check your inbox for the code to reset your password.",
      }).then(() => {
        navigate("/verify-code", { state: { email } });
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to send reset email",
        text: error.message,
      });
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email">Enter your registered email:</label>
          <input
            type="email"
            id="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Send Verification Code
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
