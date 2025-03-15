import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

interface NavbarProps {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, setIsLoggedIn }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token
    setIsLoggedIn(false); // Update login state
    navigate("/"); // Redirect to login
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <Link to={isLoggedIn ? "/home" : "/"}>EasyNest</Link>
      </div>

      {/* Navigation Links */}
      <div className="navbar-links">
        {isLoggedIn ? (
          // Logged in navigation items
          <>
            <Link to="/home">Home</Link>
            <Link to="/subscriptions">Subscriptions</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/upload">Upload</Link>
            <div className="navbar-profile" onClick={toggleProfileDropdown}>
              <span>Profile</span>
              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <Link to="/previous-rentals">Previous Rentals</Link>
                  <Link to="/messages">Chat</Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </>
        ) : (
          // Not logged in navigation items
          <>
            <Link to="/home">Home</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;