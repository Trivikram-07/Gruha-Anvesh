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
      localStorage.setItem('userId', data.user.id);
      setIsLoggedIn(true);
      navigate('/');
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
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out forwards;
          }
          .custom-shadow-all {
            box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
          }
        `}
      </style>
      <div className="flex flex-row min-h-screen bg-gray-50">
        <div className="flex-1 flex flex-col items-center pt-12 bg-gray-50">
          <img
            src={logo}
            alt="Gruha Anvesh Logo"
            className="w-80 h-80 mb-6 animate-spin-slow"
          />
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Gruha Anvesh</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full animate-fade-in-up -mt-12">
            <div className="bg-gray-50 p-8 rounded-xl custom-shadow-all border border-gray-200">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Welcome to Gruha Anvesh</h2>
              <h3 className="text-xl text-center text-gray-600 mb-6">Login to Your Account</h3>
              {error && <p className="text-red-500 text-center mb-6 font-medium">{error}</p>}
              <div className="mb-5">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors hover:border-indigo-400"
                />
              </div>
              <div className="mb-5">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors hover:border-indigo-400"
                />
              </div>
              <div className="mb-5">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                  onClick={handleSubmit}
                >
                  Login
                </button>
              </div>
              <div className="text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-indigo-600 hover:underline font-medium">Sign Up</Link>
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