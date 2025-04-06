import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, CreditCard, Wallet, Ban as Bank, Loader2, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { format, differenceInDays, parseISO, startOfDay, isBefore, subMonths, addMonths } from 'date-fns';
import { io, Socket } from 'socket.io-client';

const socket = io('/', {
  auth: {
    token: localStorage.getItem('token'), // or however you're storing it
  },
  transports: ['websocket'],
  withCredentials: true,
});



const Payment: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');
  const [numGuests, setNumGuests] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'bank'>('card');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    let isMounted = true;

    const fetchPropertyDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch property details (placeholder - replace with actual endpoint)
        console.log('Fetching property details for:', propertyId);
        const propertyResponse = await fetch(`/api/properties/management/vacation/${propertyId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          credentials: 'include',
        });
        if (!propertyResponse.ok) {
          const errorText = await propertyResponse.text();
          throw new Error(`Failed to fetch property: ${propertyResponse.status} - ${errorText}`);
        }
        const propertyData = await propertyResponse.json();
        if (isMounted) setProperty(propertyData);

        // Fetch bookings from /api/properties/bookings/:propertyId/bookings
        console.log('Fetching bookings for:', propertyId);
        const bookingsResponse = await fetch(`/api/properties/bookings/${propertyId}/bookings`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          credentials: 'include',
        });
        if (!bookingsResponse.ok) {
          const errorText = await bookingsResponse.text();
          throw new Error(`Failed to fetch bookings: ${bookingsResponse.status} - ${errorText}`);
        }
        const bookings = await bookingsResponse.json();
        const booked: string[] = [];
        for (const booking of bookings) {
          let current = parseISO(booking.startDate);
          const end = parseISO(booking.endDate);
          while (current <= end) {
            booked.push(format(current, 'yyyy-MM-dd'));
            current = new Date(current.setDate(current.getDate() + 1));
          }
        }
        if (isMounted) setBookedDates(booked);
      } catch (err) {
        console.error('Fetch error:', err);
        if (isMounted) setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPropertyDetails();
    return () => { isMounted = false; };
  }, [propertyId]);

  const generateCalendarDays = () => {
    const days = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(<div key={`empty-${i}`} className="h-12" />);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isBooked = bookedDates.includes(dateStr);
      const isSelected = selectedStartDate && dateStr >= selectedStartDate && (!selectedEndDate || dateStr <= selectedEndDate);
      const isStartDate = selectedStartDate === dateStr && !selectedEndDate;
      const isPast = isBefore(new Date(dateStr), new Date(today)) && dateStr !== today;

      days.push(
        <div
          key={day}
          className={`h-12 border flex items-center justify-center cursor-pointer relative rounded-lg transition-colors ${
            isBooked ? 'bg-red-100 text-red-600' : 
            isPast ? 'bg-gray-200 text-gray-400' : 
            isStartDate ? 'bg-green-200 text-green-800 border-2 border-green-500' : 
            isSelected ? 'bg-blue-200 text-blue-800' : 
            'hover:bg-blue-50 text-gray-800'
          }`}
          onClick={() => {
            if (isBooked || isPast) return;
            if (!selectedStartDate) {
              setSelectedStartDate(dateStr);
            } else if (!selectedEndDate && dateStr > selectedStartDate) {
              setSelectedEndDate(dateStr);
            } else {
              setSelectedStartDate(dateStr);
              setSelectedEndDate('');
            }
          }}
        >
          <span className="font-medium">{day}</span>
          {isBooked && <span className="text-xs absolute bottom-1">Booked</span>}
          {isStartDate && <span className="text-xs absolute bottom-1 text-green-600">Start</span>}
        </div>
      );
    }
    return days;
  };

  const handlePrevMonth = () => {
    const prevMonth = subMonths(currentMonth, 1);
    if (isBefore(prevMonth, new Date(today).setDate(1))) return;
    setCurrentMonth(prevMonth);
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const calculateTotal = () => {
    if (!selectedStartDate || !selectedEndDate || !property?.ratePerDay) return 0;
    const start = parseISO(selectedStartDate);
    const end = parseISO(selectedEndDate);
    return differenceInDays(end, start) * property.ratePerDay;
  };

  const handlePayment = async () => {
    if (!selectedStartDate || !selectedEndDate || !numGuests) {
      setError('Please select check-in, check-out dates, and number of guests');
      return;
    }

    if (numGuests > property.maxGuests) {
      setError(`Number of guests cannot exceed ${property.maxGuests}`);
      return;
    }

    const start = startOfDay(parseISO(selectedStartDate));
    const end = startOfDay(parseISO(selectedEndDate));
    const todayDate = startOfDay(new Date());

    if (isBefore(start, todayDate)) {
      setError('Cannot book past dates');
      return;
    }
    if (end <= start) {
      setError('Check-out must be after check-in');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Book the property using POST /api/properties/bookings/:propertyId/book
      console.log('Booking property:', { propertyId, startDate: start, endDate: end, numGuests });
      const response = await fetch(`/api/properties/bookings/${propertyId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          numGuests,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Booking failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Booking response:', result);

      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      navigate('/booking-success', {
        state: {
          propertyName: property.propertyName,
          startDate: selectedStartDate,
          endDate: selectedEndDate,
          numGuests,
          location: property.address,
          total: calculateTotal(),
          paymentMethod,
        },
      });
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/90 p-6 rounded-2xl shadow-2xl flex flex-col items-center"
        >
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p className="text-gray-700">Loading your vacation spot...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/90 p-6 rounded-2xl shadow-2xl text-center max-w-md"
        >
          <h2 className="text-xl font-bold text-red-600 mb-2">Oops!</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/90 p-6 rounded-2xl shadow-2xl text-center max-w-md"
        >
          <h2 className="text-xl font-bold text-gray-700 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-4">Looks like we lost this spot!</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8"
    >
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 p-8 border-r border-gray-200/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-blue-600" /> Select Your Stay
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-full hover:bg-gray-100 transition"
                disabled={isBefore(subMonths(currentMonth, 1), new Date(today).setDate(1))}
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="text-center text-lg font-semibold text-gray-700 mb-4">
            {format(currentMonth, 'MMMM yyyy')}
          </div>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-600">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">{generateCalendarDays()}</div>
          {selectedStartDate && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-gray-700 font-medium"
            >
              {selectedEndDate
                ? `Stay: ${format(parseISO(selectedStartDate), 'MMM dd, yyyy')} - ${format(parseISO(selectedEndDate), 'MMM dd, yyyy')}`
                : `Start: ${format(parseISO(selectedStartDate), 'MMM dd, yyyy')}`}
            </motion.p>
          )}
          <div className="mt-4 flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 rounded" />
              <span className="text-sm text-gray-600">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 border-2 border-green-500 rounded" />
              <span className="text-sm text-gray-600">Start Date</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 rounded" />
              <span className="text-sm text-gray-600">Selected Range</span>
            </div>
          </div>
        </div>

        <div className="md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Details</h2>
          <div className="bg-blue-50/50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800">{property.propertyName}</h3>
            <p className="text-gray-600 mt-1">{property.address}</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">₹{property.ratePerDay}/night</p>
            {selectedStartDate && selectedEndDate && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-600 mt-2"
              >
                Total: ₹{calculateTotal()} for {differenceInDays(parseISO(selectedEndDate), parseISO(selectedStartDate))} nights
              </motion.p>
            )}
            <div className="mt-4">
              <label className="flex items-center text-gray-700 mb-2">
                <Users className="w-5 h-5 mr-2 text-gray-600" />
                Number of Guests (Max: {property.maxGuests})
              </label>
              <input
                type="number"
                min="1"
                max={property.maxGuests}
                value={numGuests}
                onChange={(e) => setNumGuests(Math.max(1, Math.min(property.maxGuests, parseInt(e.target.value) || 1)))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Choose Payment Method</h3>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="h-4 w-4 text-blue-600"
                />
                <CreditCard className="w-5 h-5 ml-3 text-gray-600" />
                <span className="ml-3 text-gray-700">Credit/Debit Card</span>
              </label>
              {paymentMethod === 'card' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="ml-6 space-y-2"
                >
                  <input
                    type="text"
                    placeholder="Card Number"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-1/2 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      className="w-1/2 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </motion.div>
              )}

              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  value="wallet"
                  checked={paymentMethod === 'wallet'}
                  onChange={() => setPaymentMethod('wallet')}
                  className="h-4 w-4 text-blue-600"
                />
                <Wallet className="w-5 h-5 ml-3 text-gray-600" />
                <span className="ml-3 text-gray-700">Digital Wallet</span>
              </label>
              {paymentMethod === 'wallet' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-6 p-2 text-gray-600 text-sm"
                >
                  Redirecting to wallet provider after confirmation.
                </motion.div>
              )}

              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  value="bank"
                  checked={paymentMethod === 'bank'}
                  onChange={() => setPaymentMethod('bank')}
                  className="h-4 w-4 text-blue-600"
                />
                <Bank className="w-5 h-5 ml-3 text-gray-600" />
                <span className="ml-3 text-gray-700">Bank Transfer</span>
              </label>
              {paymentMethod === 'bank' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-6 p-2 text-gray-600 text-sm"
                >
                  Bank details provided after booking.
                </motion.div>
              )}
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 mb-4"
            >
              {error}
            </motion.p>
          )}

          <button
            onClick={handlePayment}
            disabled={processing || !selectedStartDate || !selectedEndDate || !numGuests}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white flex items-center justify-center transition duration-200 transform hover:scale-[1.02] ${
              processing || !selectedStartDate || !selectedEndDate || !numGuests
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {processing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            {processing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Payment;