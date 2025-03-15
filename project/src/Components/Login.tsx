import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./css/login.css";

interface LoginProps {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  interface LoginResponse {
    token: string;
  }

  interface ErrorResponse {
    error: string;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        setError(errorData.error || "Invalid email or password");
        return;
      }

      const data: LoginResponse = await response.json();
      console.log("Login successful:", data);

      // Save token to localStorage and update login state
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
      navigate("/home"); // Redirect to home page
    } catch (error: any) {
      console.error("Error during login:", error.message);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container login-active">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Welcome to EasyNest</h2>
          <h3>Login to Your Account</h3>
          {error && <p className="error-message">{error}</p>}
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
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <button type="submit" className="primary-button">Login</button>
          </div>
          <div className="auth-links">
            <p>
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;