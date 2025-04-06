import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays } from 'date-fns';

interface Booking {
  propertyId: string;
  propertyName: string;
  address: string;
  startDate: string;
  endDate: string;
  ratePerDay: number;
}

const PreviousBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('token');
      console.log('Fetching previous bookings with Token:', token);
      try {
        const response = await fetch('/api/properties/bookings/my-bookings/vacation', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch bookings');
        }
        const data = await response.json();
        console.log('Fetched bookings:', data);
        setBookings(data);
      } catch (err) {
        console.error('Fetch bookings error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 bg-white/80 p-4 rounded-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Previous Vacation Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-600">No previous vacation bookings found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => {
              const start = new Date(booking.startDate);
              const end = new Date(booking.endDate);
              const nights = differenceInDays(end, start);
              const totalCost = nights * booking.ratePerDay;

              return (
                <div
                  key={`${booking.propertyId}-${booking.startDate}`}
                  className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition duration-200"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {booking.propertyName}
                  </h3>
                  <p className="text-gray-600 mb-4">{booking.address}</p>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Check-in:</span>{' '}
                      {start.toLocaleDateString()}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Check-out:</span>{' '}
                      {end.toLocaleDateString()}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Nights:</span> {nights}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Rate per Night:</span> ₹{booking.ratePerDay}
                    </p>
                    <p className="text-blue-600 font-bold text-lg">
                      Total: ₹{totalCost}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/payment/vacation/${booking.propertyId}`)}
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 transform hover:scale-[1.02]"
                  >
                    Book Again
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviousBookings;