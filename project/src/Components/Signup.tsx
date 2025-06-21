import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '/white bg logo.png';

interface SignupProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean | null>>;
}

const Signup: React.FC<SignupProps> = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  interface SignupResponse {
    token: string;
    user: { id: string };
  }

  interface ErrorResponse {
    message: string;
    errors?: { msg: string }[];
  }

  const validateUsername = (value: string): string | null => {
    if (value.length < 4) {
      return 'Username must be at least 4 characters long';
    }
    if (!/^[a-zA-Z]+$/.test(value)) {
      return 'Username must contain only letters (no spaces or special characters)';
    }
    return null;
  };

  const validatePhoneNo = (value: string): string | null => {
    if (!/^\d{10}$/.test(value)) {
      return 'Phone number must be exactly 10 digits';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate username
    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    // Validate phone number
    const phoneError = validatePhoneNo(phoneNo);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    const formData = { username, email, password, confirmPassword, phone_no: `+91${phoneNo}` };

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map((err) => err.msg).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(errorData.message || 'Signup failed');
      }

      const data: SignupResponse = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      setIsLoggedIn(true);
      navigate('/home');
    } catch (error) {
      console.error('Signup error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
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
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-100">
          <img
            src={logo} // Replace with your optimized image URL
            alt="Gruha Anvesh Logo"
            className="w-64 h-64 mb-4 animate-spin-slow"
          />
          <h1 className="text-3xl font-bold text-black">Gruha Anvesh</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-center">Welcome to Gruha Anvesh</h2>
              <h3 className="text-xl text-center mb-4">Create Your Account</h3>
              {error && <p className="text-red-500 text-center mb-4">{error}</p>}
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  pattern="[a-zA-Z]{4,}"
                  title="Username must be at least 4 letters long with no spaces or special characters"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="phoneNo" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="flex items-center border rounded focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="px-2 bg-gray-100 text-gray-600 border-r">+91</span>
                  <input
                    type="tel"
                    id="phoneNo"
                    placeholder="Enter 10-digit phone number"
                    value={phoneNo}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setPhoneNo(value);
                      }
                    }}
                    required
                    pattern="\d{10}"
                    title="Phone number must be exactly 10 digits"
                    className="flex-1 p-2 border-none focus:outline-none"
                  />
                </div>
              </div>
              <div className="mb-4">
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  onClick={handleSubmit}
                >
                  Sign Up
                </button>
              </div>
              <div className="text-center">
                <p>
                  Already have an account? <Link to="/" className="text-blue-500 hover:underline">Login</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;