import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const navigate = useNavigate(); // ✅ Added navigation

  const showError = (message) => {
    setError(message);
    setSuccess("");
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 3000);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setError("");
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/auth/login`,
        { email, password },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        showSuccess(response.data.message || "Login Successful!");
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        showError(response.data.message || "Login failed.");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        showError(error.response.data.message || "Login failed.");
      } else {
        showError("Something went wrong. Please try again.");
      }
      console.error("Login error:", error);
    }
  };

  return (
    <LoginWrapper>
      <div className="login-card">
        <h2>Login to Your Account</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>
          <p className="signup-link">
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>

      {showSnackbar && (
        <Snackbar type={error ? "error" : "success"}>
          {error || success}
        </Snackbar>
      )}
    </LoginWrapper>
  );
};

export default Login;

const LoginWrapper = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(210, 36%, 96%);
  position: relative;

  .login-card {
    background: white;
    padding: 3rem;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;

    h2 {
      text-align: center;
      margin-bottom: 2rem;
      color: hsl(220, 15%, 20%);
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1.4rem;

      label {
        font-size: 0.9rem;
        font-weight: 500;
        color: hsl(220, 15%, 30%);
      }

      input {
        padding: 0.9rem 1rem;
        border-radius: 8px;
        border: 1px solid hsl(220, 15%, 85%);
        font-size: 1rem;
        transition: border-color 0.2s ease-in-out;

        &:focus {
          outline: none;
          border-color: hsl(220, 100%, 50%);
        }
      }

      button {
        padding: 1rem;
        background-color: hsl(220, 100%, 55%);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background-color: hsl(220, 100%, 45%);
        }
      }

      .signup-link {
        font-size: 0.9rem;
        text-align: center;
        margin-top: 1rem;

        a {
          color: hsl(220, 100%, 55%);
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
`;

const Snackbar = styled.div`
  position: absolute;
  top: 30px;
  background-color: ${(props) =>
    props.type === "success" ? "hsl(140, 70%, 40%)" : "hsl(0, 70%, 50%)"};
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  animation: fadeInOut 3s ease-in-out;

  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    10%,
    90% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(20px);
    }
  }
`;