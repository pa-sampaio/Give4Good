import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/ConfirmEmail.css';

function ConfirmEmail() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email not found. Please register again.");
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/users/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const result = await response.text();

      if (response.ok) {
        toast.success('Email confirmed successfully!');
        setTimeout(() => navigate('/announcementLogin'), 2000);
      } else {
        toast.error(result || 'Failed to confirm email');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error confirming email');
    }
  };

  return (
    <div className="page-container">
      <div className="confirm-container">
        <h2>Confirm Your Email</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="code">Enter the 6-digit code sent to your email:</label>
          <input
            type="text"
            id="code"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            maxLength="6"
          />
          <button type="submit">Confirm</button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}

export default ConfirmEmail;
