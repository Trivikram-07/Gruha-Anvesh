import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './Home';
import Upload from './Upload';
import Login from './Components/Login';
import Signup from './Components/Signup';
import Navbar from './Components/Navbar';
import { useState, useEffect } from 'react';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to="/" />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/subscriptions" element={isLoggedIn ? <div>Subscriptions Page</div> : <Navigate to="/" />} />
        <Route path="/profile" element={isLoggedIn ? <div>Profile Page</div> : <Navigate to="/" />} />
        <Route path="/previous-rentals" element={isLoggedIn ? <div>Rental History</div> : <Navigate to="/" />} />
        <Route path="/messages" element={isLoggedIn ? <div>Chat Messages</div> : <Navigate to="/" />} />
        <Route path="/contact" element={<div>Contact Us</div>} />
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/home" /> : <Login setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/signup"
          element={isLoggedIn ? <Navigate to="/home" /> : <Signup setIsLoggedIn={setIsLoggedIn} />}
        />
      </Routes>
    </Router>
  );
};

export default App;