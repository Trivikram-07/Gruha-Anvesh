// src/components/EditProfile.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
//import "./css/login.css"; // Reuse Signup’s CSS

const EditProfile: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone_no, setPhoneNo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current user details
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch user details');
        const data = await response.json();
        setUsername(data.username);
        setEmail(data.email);
        setPhoneNo(data.phone_no);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      }
    };

    fetchUserDetails();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updateData: any = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (phone_no) updateData.phone_no = phone_no;
      if (password) updateData.password = password;

      const response = await fetch('http://localhost:3000/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Update failed');
        return;
      }

      setSuccess('Profile updated successfully!');
      // Optionally refresh Navbar username by refetching or updating state
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Update error:', err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Edit Profile</h2>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">New Password (optional)</label>
            <input
              type="password"
              id="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <button type="submit" className="primary-button">Save Changes</button>
          </div>

          <div className="auth-links">
            <p>
              Back to <Link to="/profile/bookings">Profile</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;