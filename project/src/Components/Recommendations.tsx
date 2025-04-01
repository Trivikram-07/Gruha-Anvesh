import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

type PropertyType = 'pg' | 'bhk' | 'vacation';

interface Property {
  _id: string;
  propertyName: string;
  type: PropertyType | undefined;
  monthlyRent?: number;
  ratePerDay?: number;
  amenities: Record<string, boolean>;
  latitude?: number;
  longitude?: number;
  squareFeet?: number;
  maxGuests?: number;
  address: string;
  contactNumber: string;
  description: string;
  score: number;
}

interface RecommendationsProps {
  propertyType: PropertyType;
}

const Recommendations: React.FC<RecommendationsProps> = ({ propertyType }) => {
  const [recommendations, setRecommendations] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Fetching recommendations with Token:', token);
    axios.get('http://localhost:3000/api/properties/recommendations/recommendations', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        console.log('Raw recommendations response:', res.data);
        const filteredRecommendations = res.data.filter((prop: Property) => {
          const matches = prop.type === propertyType;
          console.log(`Filtering ${prop.propertyName || prop._id}: type=${prop.type}, matches ${propertyType}? ${matches}`);
          return matches;
        });
        console.log(`Filtered ${propertyType} recommendations:`, filteredRecommendations);
        setRecommendations(filteredRecommendations);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching recommendations:', err);
        setLoading(false);
      });
  }, [propertyType]);

  const handleLike = (propertyId: string, propertyType: PropertyType) => {
    const token = localStorage.getItem('token');
    console.log('Liking property:', propertyId, 'with Token:', token);
    axios.post(`http://localhost:3000/api/properties/actions/like/${propertyId}`, { propertyType }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        console.log('Property liked:', propertyId);
        axios.get('http://localhost:3000/api/properties/recommendations/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then((res) => {
            const filteredRecommendations = res.data.filter((prop: Property) => prop.type === propertyType);
            console.log('Updated recommendations:', filteredRecommendations);
            setRecommendations(filteredRecommendations);
          });
      })
      .catch((err) => console.error('Like failed:', err));
  };

  if (loading) return <p className="text-center text-gray-500">Loading {propertyType} recommendations...</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Recommended {propertyType.toUpperCase()} Properties</h2>
      {recommendations.length === 0 ? (
        <p className="text-gray-600">No {propertyType} recommendations yet!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((prop) => (
            <div
              key={prop._id}
              className="bg-gray-50 rounded-lg p-4 shadow hover:shadow-md transition duration-300"
            >
              <h3 className="text-xl font-semibold text-gray-900">{prop.propertyName || 'Unnamed Property'}</h3>
              <p className="text-gray-600">
                Type: {prop.type ? prop.type.toUpperCase() : 'UNKNOWN'}
              </p>
              <p className="text-gray-600">
                {prop.monthlyRent ? `Rent: ₹${prop.monthlyRent}` : prop.ratePerDay ? `Rate: ₹${prop.ratePerDay}/day` : 'Price: N/A'}
              </p>
              <p className="text-gray-600">Address: {prop.address || 'Unknown Address'}</p>
              <p className="text-gray-600">Contact: {prop.contactNumber || 'N/A'}</p>
              <p className="text-gray-600">Score: {(prop.score * 100).toFixed(1)}%</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleLike(prop._id, prop.type || propertyType)}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
                >
                  Like
                </button>
                <Link
                  to={`/booking/${prop.type || propertyType}/${prop._id}`}
                  className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;