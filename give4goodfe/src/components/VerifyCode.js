import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../css/ForgotPassword.css";

function VerifyCode() {
  const [code, setCode] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/users/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        throw new Error("Invalid or expired code.");
      }

      Swal.fire({
        icon: "success",
        title: "Code confirmed!",
        text: "You can now set a new password.",
      }).then(() => {
        navigate("/reset-password", { state: { email, code } });
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Verification failed",
        text: error.message,
      });
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Verify Code</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="code">Enter the verification code:</label>
          <input
            type="text"
            id="code"
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Confirm Code
        </button>
      </form>
    </div>
  );
}

export default VerifyCode;
