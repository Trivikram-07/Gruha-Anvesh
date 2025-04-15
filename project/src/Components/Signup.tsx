import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Sign Up</h2>
      {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            pattern="[a-zA-Z]{4,}"
            title="Username must be at least 4 letters long with no spaces or special characters"
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Phone Number:</label>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
            <span style={{ padding: '8px', backgroundColor: '#f5f5f5', color: '#555', borderRight: '1px solid #ddd' }}>+91</span>
            <input
              type="tel"
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
              style={{ flex: 1, padding: '8px', border: 'none', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>
        <button
          type="submit"
          style={{ padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
        >
          Sign Up
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            padding: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '10px',
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Signup;