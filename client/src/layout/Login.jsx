import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useGlobalContext } from "../context/context";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ ONLY call useGlobalContext INSIDE the component
  const { showSnackbar, dispatch } = useGlobalContext();
  const navigate = useNavigate();

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
        // Dispatch user data to context
        dispatch({ type: "SET_USER", payload: response.data.data });

        showSnackbar(response.data.message, "success");

        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        showSnackbar(response.data.message, "error");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        showSnackbar(error.response.data.message, "error");
      } else {
        showSnackbar("Something went wrong. Please try again.", "error");
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
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
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
