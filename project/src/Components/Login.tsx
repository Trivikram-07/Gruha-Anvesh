import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '/white bg logo.png'; // Adjust the path as necessary

interface LoginProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean | null>>;
}

const Login: React.FC<LoginProps> = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  interface LoginResponse {
    token: string;
    user: { id: string };
  }

  interface ErrorResponse {
    error: string;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: LoginResponse = await response.json();
      localStorage.setItem('token', data.token);
      localural: localStorage.setItem('userId', data.user.id);
      setIsLoggedIn(true);
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .animate-spin-slow {
            animation: spin-slow 10s linear infinite;
          }
        `}
      </style>
      <div className="flex flex-row min-h-screen">
        <div className="flex-1 flex flex-col items-center pt-12 bg-gray-100">
          <img
            src={logo}
            alt="Gruha Anvesh Logo"
            className="w-80 h-80 mb-6 animate-spin-slow"
          />
          <h1 className="text-4xl font-bold text-black">Gruha Anvesh</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-center">Welcome to Gruha Anvesh</h2>
              <h3 className="text-xl text-center mb-4">Login to Your Account</h3>
              {error && <p className="text-red-500 text-center mb-4">{error}</p>}
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  onClick={handleSubmit}
                >
                  Login
                </button>
              </div>
              <div className="text-center">
                <p>
                  Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Sign Up</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;