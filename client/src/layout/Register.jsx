import React, { useState } from "react"
import styled from "styled-components"
import { Link } from "react-router-dom"
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../context/context";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const { showSnackbar } = useGlobalContext();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const passwordChecks = {
    length: formData.password.length >= 8,
    lowercase: /[a-z]/.test(formData.password),
    uppercase: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[\W_]/.test(formData.password),
  }

  const allChecksPassed = Object.values(passwordChecks).every(Boolean)

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validations
    if (!validateEmail(formData.email)) {
      showSnackbar("Please enter a valid email address.", "error")
    }

    if (!allChecksPassed) {
      showSnackbar("Password does not meet the required strength.", "error")
    }

    if (formData.password !== formData.confirmPassword) {
      showSnackbar("Passwords do not match.", "error")
    }
    console.log("data: ", formData)

    try {
      const response = await axios.post(`${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/auth/register`, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        showSnackbar(response.data.message, "success");

        // Redirect after the message has been visible
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        showSnackbar(response.data.message, "error")
      }
    } catch (error) {
      // Handle known and unknown errors
      if (error.response && error.response.data) {
        showSnackbar(error.response.data.message, "error")
      } else {
        showSnackbar("Something went wrong. Please try again.", "error")
      }
      console.error("Registration error:", error);
    }
  };

  return (
    <RegisterWrapper>
      <div className="register-card">
        <h2>Create an Account</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
          />
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
          />

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
          />

          <PasswordRules>
            <li className={passwordChecks.length ? "valid" : ""}>
              Minimum 8 characters
            </li>
            <li className={passwordChecks.lowercase ? "valid" : ""}>
              At least 1 lowercase letter
            </li>
            <li className={passwordChecks.uppercase ? "valid" : ""}>
              At least 1 uppercase letter
            </li>
            <li className={passwordChecks.number ? "valid" : ""}>
              At least 1 number
            </li>
            <li className={passwordChecks.special ? "valid" : ""}>
              At least 1 special character
            </li>
          </PasswordRules>

          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <button type="submit">Register</button>
          <p className="login-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </RegisterWrapper>
  )
}

export default Register

const RegisterWrapper = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(210, 36%, 96%);
  position: relative;

  .register-card {
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

      .login-link {
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
`

const PasswordRules = styled.ul`
  list-style-type: none;
  padding-left: 1rem;
  margin-top: -1rem;
  margin-bottom: -0.5rem;
  font-size: 0.85rem;
  color: hsl(0, 0%, 50%);

  li {
    margin: 0.25rem 0;
    position: relative;
    padding-left: 1.2rem;
  }

  li.valid {
    color: green;
    &::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: green;
    }
  }

  li:not(.valid)::before {
    content: "•";
    position: absolute;
    left: 0;
  }
`