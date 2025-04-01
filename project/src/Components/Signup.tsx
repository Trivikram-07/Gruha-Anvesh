import React, { useState, Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';

// Define the props interface for Signup
interface SignupProps {
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
}

const Signup: React.FC<SignupProps> = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formData = { username, email, password, confirmPassword, phone_no: phoneNo };

    try {
      const response = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Server error response:', text);
        throw new Error('Signup failed: ' + (response.statusText || 'Unknown error'));
      }

      const data = await response.json();
      console.log('Signup success:', data);
      alert('Signup successful!');
      // After successful signup, update the login state
      setIsLoggedIn(true); // This will update the App component's isLoggedIn state
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
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
          <input
            type="tel"
            value={phoneNo}
            onChange={(e) => setPhoneNo(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>Sign Up</button>
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
