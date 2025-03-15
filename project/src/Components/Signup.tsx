import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./css/login.css";

interface SignupProps {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const Signup: React.FC<SignupProps> = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone_no, setPhoneNo] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  interface SignupData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone_no: number;
  }

  interface SignupResponse {
    token?: string;
    error?: string;
    [key: string]: any;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      const signupData: SignupData = {
        username,
        email,
        password,
        confirmPassword,
        phone_no: Number(phone_no), // Ensure phone number is sent as a number
      };

      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      const data: SignupResponse = await response.json();

      if (!response.ok) {
        console.error("Error:", data);
        setError(data.error || "Signup failed. Please try again.");
        return;
      }

      console.log("Signup successful:", data);
      
      // If signup returns a token, save it and log in directly
      if (data.token) {
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
        navigate("/home");
      } else {
        // Otherwise redirect to login
        navigate("/");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Join EasyNest</h2>
          <h3>Create Your Account</h3>
          {error && <p className="error-message">{error}</p>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              placeholder="Enter your phone number"
              value={phone_no}
              onChange={(e) => setPhoneNo(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <button type="submit" className="primary-button">Sign Up</button>
          </div>
          
          <div className="auth-links">
            <p>
              Already have an account? <Link to="/">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;