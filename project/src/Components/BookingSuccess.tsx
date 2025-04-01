// src/components/BookingSuccess.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface BookingDetails {
  propertyName: string;
  startDate: string;
  endDate: string;
  location: string;
}

const BookingSuccess: React.FC = () => {
  const { state } = useLocation(); // Get booking details from Payment.tsx
  const navigate = useNavigate();
  const booking = state as BookingDetails | undefined;

  const handleReturnHome = () => {
    navigate('/home'); // Adjust to your home route
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="w-64 h-64 mx-auto mb-6">
          <img
            src="https://media.tenor.com/TvJUrCWgPTsAAAAm/check-mark-good.webp" // Tenor checkmark GIF
            alt="Booking Success"
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Payment Successful!
        </h2>
        <p className="text-gray-600 mb-6">
          Thank you for your booking! Your vacation at{' '}
          {booking?.propertyName || 'your selected spot'} is confirmed. We’ve sent a confirmation email with all the details.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Booking Details:</h3>
          <p className="text-gray-600">
            Check-in: {booking?.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}<br />
            Check-out: {booking?.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}<br />
            Location: {booking?.location || booking?.propertyName || 'N/A'}
          </p>
        </div>
        <button
          onClick={handleReturnHome}
          className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 w-full transform hover:scale-[1.02]"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default BookingSuccess;