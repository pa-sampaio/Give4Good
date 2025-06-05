import React, { useState } from "react";
import "./Login.css";
import childrenImage from "../../images/children.jpg";
import ButtonLogin from "./ButtonLogin.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUpClick = (e) => {
    e.preventDefault();
    navigate("/sign-up");
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    navigate("/forgot-password");
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!userEmail || !password) {
      Swal.fire({
        title: "Missing fields!",
        text: "Email and password are required.",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "confirm-button",
        },
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          password: password,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid email or password");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const user = await response.json();

      // Guarda no sessionStorage para manter login na sessão
      sessionStorage.setItem("userEmail", user.contact.email);
      sessionStorage.setItem("userName", user.name);
      sessionStorage.setItem("userId", user.id);
      sessionStorage.setItem("userRole", user.role); // <-- ADICIONADO

      Swal.fire({
        title: "Logged in successfully!",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "confirm-button",
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/"); // redireciona para a tela principal
        }
      });
    } catch (error) {
      Swal.fire({
        title: "Error logging in!",
        text: error.message,
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "confirm-button",
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
    }
  };

  return (
    <div className="container">
      <div className="login-form">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="forgot-password">
            <a href="/forgot-password" onClick={handleForgotPasswordClick}>
              Forgot password?
            </a>
          </div>

          <ButtonLogin text="Login" />
        </form>

        <div className="signUp-text">
          <p>
            Don't have an account?{" "}
            <a href="/sign-up" onClick={handleSignUpClick}>
              Sign up here!
            </a>
          </p>
        </div>
      </div>

      <div className="image-section">
        <img
          src={childrenImage}
          alt="Children smiling and showing peace signs"
        />
      </div>
    </div>
  );
}

export default Login;