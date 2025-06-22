import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import Home from './Home';
import Upload from './Upload';
import Login from './Components/Login';
import Signup from './Components/Signup';
import Navbar from './Components/Navbar';
import Subscription from './Components/Subscription';
import Booking from './Components/Booking';
import Chat from './Components/Chat';
import History from './Components/History';
import ChatList from './Components/ChatList';
import Recommendations from './Components/Recommendations';
import Payment from './Components/Payment';
import BookingSuccess from './Components/BookingSuccess';
import PreviousBookings from './Components/PreviousBooking';
import EditProfile from './Components/EditProfile';
import Notifications from './Components/Notifications';
import Review from './Components/Review';
import VacationSpot from './Components/VacationSpot';
import ContactUs from './Components/ContactUs';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Optional: Verify token with backend
          // await axios.get('/api/auth/verify');
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        delete axios.defaults.headers.common['Authorization'];
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoggedIn === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/home" element={isLoggedIn ? <Home isLoggedIn={isLoggedIn} /> : <Navigate to="/" replace />} />
        <Route path="/upload" element={isLoggedIn ? <Upload /> : <Navigate to="/" replace />} />
        <Route path="/profile/bookings" element={isLoggedIn ? <PreviousBookings /> : <Navigate to="/" replace />} />
        <Route path="/review/vacation/:propertyId" element={isLoggedIn ? <Review /> : <Navigate to="/" replace />} />
        <Route path="/notifications" element={isLoggedIn ? <Notifications /> : <Navigate to="/" replace />} />
        <Route path="/subscriptions" element={isLoggedIn ? <Subscription /> : <Navigate to="/" replace />} />
        <Route path="/payment/vacation/:propertyId" element={isLoggedIn ? <Payment /> : <Navigate to="/" replace />} />
        <Route path="/vacation/:propertyId" element={<VacationSpot />} />
        <Route path="/profile" element={isLoggedIn ? <div>Profile Page</div> : <Navigate to="/" replace />} />
        <Route path="/previous-rentals" element={isLoggedIn ? <div>Rental History</div> : <Navigate to="/" replace />} />
        <Route path="/messages" element={isLoggedIn ? <div>Chat Messages</div> : <Navigate to="/" replace />} />
        <Route path="/booking/:propertyType/:propertyId" element={isLoggedIn ? <Booking /> : <Navigate to="/" replace />} />
        <Route path="/chats" element={isLoggedIn ? <ChatList /> : <Navigate to="/" replace />} />
        <Route path="/ContactUs" element={<ContactUs />} />
        <Route path="/chat/:propertyId" element={isLoggedIn ? <Chat /> : <Navigate to="/" replace />} />
        <Route path="/booking-success" element={isLoggedIn ? <BookingSuccess /> : <Navigate to="/" replace />} />
        <Route path="/profile/history" element={isLoggedIn ? <History /> : <Navigate to="/" replace />} />
        <Route path="/profile/edit" element={isLoggedIn ? <EditProfile /> : <Navigate to="/" replace />} />
        <Route path="/signup" element={<Signup setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
      </Routes>
    </Router>
  );
};

export default App;