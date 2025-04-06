import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

const VacationSpot: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const location = useLocation();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      const token = localStorage.getItem('token');
      console.log('Fetching vacation spot with Token:', token);
      try {
        const response = await fetch(`/api/properties/management/vacation/${propertyId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to fetch property: ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched vacation spot:', data);
        setProperty(data);
      } catch (err) {
        console.error('Fetch property error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-8">Loading...</div>;
  if (!property) return <div className="min-h-screen bg-gray-900 text-white p-8">Property not found</div>;

  const fromNotification = location.state?.fromNotification;
  const latestBooking = fromNotification
    ? property.bookings
        .filter((b: any) => b.user.toString() === localStorage.getItem('userId'))
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">{property.propertyName}</h1>
      <img
        src={property.images[0] || 'https://placehold.co/600x400'}
        alt={property.propertyName}
        className="w-full max-w-2xl rounded-lg mb-6"
      />
      <p>{property.address}</p>
      {fromNotification && latestBooking && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold">Your Latest Booking</h2>
          <p>Booked On: {new Date(latestBooking.createdAt).toLocaleDateString()}</p>
          <p>Days of Stay: {new Date(latestBooking.endDate).getDate() - new Date(latestBooking.startDate).getDate()} days</p>
          <p>From: {new Date(latestBooking.startDate).toLocaleDateString()}</p>
          <p>To: {new Date(latestBooking.endDate).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
};

export default VacationSpot;