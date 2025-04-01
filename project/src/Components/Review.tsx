import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star } from 'lucide-react';

const Review: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      const token = localStorage.getItem('token');
      console.log('Fetching property with Token:', token);
      try {
        const response = await fetch(`http://localhost:3000/api/properties/management/vacation/${propertyId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to fetch property: ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched property:', data);
        setProperty(data);
      } catch (err) {
        console.error('Fetch property error:', err);
        setError('Couldn’t load property details');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  const handleRating = (star: number) => {
    setRating(star);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5');
      return;
    }

    setSubmitting(true);
    setError(null);
    const token = localStorage.getItem('token');
    console.log('Submitting review with Token:', token);

    try {
      const response = await fetch(`http://localhost:3000/api/properties/management/vacation/${propertyId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, review: reviewText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }

      await response.json();
      console.log('Review submitted successfully');
      navigate(`/vacation/${propertyId}`);
    } catch (err) {
      console.error('Review submission error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-8">Loading...</div>;
  if (!property) return <div className="min-h-screen bg-gray-900 text-white p-8">Property not found</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Review {property.propertyName}</h1>
      
      <div className="mb-8">
        <img
          src={property.images[0] || 'https://placehold.co/600x400'}
          alt={property.propertyName}
          className="w-full max-w-2xl rounded-lg mb-4"
        />
        <p className="text-lg">{property.address}</p>
        <p className="text-gray-400 mt-2">{property.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Rate Your Stay</h2>

        <div className="flex mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-8 w-8 cursor-pointer ${
                star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
              }`}
              onClick={() => handleRating(star)}
            />
          ))}
        </div>

        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience..."
          className="w-full p-3 bg-gray-700 text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-3 rounded-lg font-semibold text-white ${
            submitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } transition`}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>

      {property.reviews && property.reviews.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Previous Reviews</h2>
          {property.reviews.map((review: any, index: number) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2">{review.review}</p>
              <p className="text-sm text-gray-400 mt-1">
                {new Date(review.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Review;