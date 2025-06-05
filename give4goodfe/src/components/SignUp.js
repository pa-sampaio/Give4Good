import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    password: '',
    role: '', // <-- ADICIONADO
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { dateOfBirth, phoneNumber, name, address, email, password, role } = formData;
    const formattedPhoneNumber = parseInt(phoneNumber, 10);

    if (!role) {
      toast.error('Please select a role (Donor or Donee)');
      return;
    }

    if (new Date(dateOfBirth) >= new Date()) {
      toast.error('Date of Birth must be in the past');
      return;
    }

    if (!/^\d{9}$/.test(phoneNumber)) {
      toast.error('Phone number must be exactly 9 digits');
      return;
    }

    if (isNaN(formattedPhoneNumber)) {
      toast.error('Phone number must be a valid integer');
      return;
    }

    const userRequest = {
      name,
      dateBirth: dateOfBirth,
      password,
      role, // <-- ADICIONADO
      contact: {
        address,
        phoneNumber: formattedPhoneNumber,
        email
      }
    };

    try {
      const response = await fetch('http://localhost:8080/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userRequest),
      });

      const responseText = await response.text();

      if (response.ok) {
        toast.success('Account created successfully! Please check your email.');
        setTimeout(() => {
          navigate('/confirm-email', { state: { email: email } });
        }, 2000);
      } else if (response.status === 409) {
        toast.error('Email already in use. Please use a different email.');
      } else {
        toast.error(`Failed to create account: ${responseText}`);
      }
    } catch (error) {
      toast.error(`An error occurred: ${error.message}`);
    }
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <h2 className="title">Sign Up</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="label" htmlFor="name">Name</label>
            <input className="input" type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label className="label" htmlFor="address">Address</label>
            <input className="input" type="text" id="address" name="address" value={formData.address} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label className="label" htmlFor="dateOfBirth">Date of Birth</label>
            <input className="input" type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label className="label" htmlFor="phoneNumber">Phone Number</label>
            <input className="input" type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / span 2' }}>
            <label className="label" htmlFor="email">Email</label>
            <input className="input" type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / span 2' }}>
            <label className="label" htmlFor="password">Password</label>
            <input className="input" type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          {/* NOVO CAMPO ROLE */}
          <div className="input-group" style={{ gridColumn: '1 / span 2' }}>
            <label className="label">Role</label>
            <select
              className="input"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select role...</option>
              <option value="donor">Donor</option>
              <option value="donee">Donee</option>
            </select>
          </div>
          <button className="button" type="submit">Create Account</button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignUp;