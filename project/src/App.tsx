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
import VacationSpot from './Components/VacationSpot'; // Update the path if the file is in a subfolder
import ContactUs from './Components/ContactUs';
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to="/" />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile/bookings" element={<PreviousBookings />} />
        <Route path="/review/vacation/:propertyId" element={<Review />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/subscriptions" element={isLoggedIn ? <Subscription /> : <Navigate to="/" />} />
        <Route path="/payment/vacation/:propertyId" element={<Payment />} />
        <Route path="/vacation/:propertyId" element={<VacationSpot />} /> {/* Add this route */}
        <Route path="/profile" element={isLoggedIn ? <div>Profile Page</div> : <Navigate to="/" />} />
        <Route path="/previous-rentals" element={isLoggedIn ? <div>Rental History</div> : <Navigate to="/" />} />
        <Route path="/messages" element={isLoggedIn ? <div>Chat Messages</div> : <Navigate to="/" />} />
        {/* <Route path="/recommendations" element={isLoggedIn ? <Recommendations /> : <Navigate to="/" />} /> */}
        <Route path="/booking/:propertyType/:propertyId" element={<Booking />} />
        <Route path="/chats" element={<ChatList />} />
        <Route path="/ContactUs" element={<ContactUs />} />
        <Route path="/chat/:propertyId" element={<Chat />} />
        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route path="/profile/history" element={isLoggedIn ? <History /> : <Navigate to="/" />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route
  path="/signup"
  element={<Signup setIsLoggedIn={setIsLoggedIn} />}
/>
<Route
  path="/"
  element={<Login setIsLoggedIn={setIsLoggedIn} />}
/>
      </Routes>
    </Router>
  );
};

export default App;