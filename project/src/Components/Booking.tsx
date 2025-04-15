import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import {
  Bed, Bath, Square, Wifi, Utensils, Dumbbell, Car, Shield, Waves, Trees, Star, Users,
  MessageSquare, Loader2, MapPin, DollarSign, Phone, Tv, Droplet, Coffee, AirVent,
  ChefHat, X, Maximize2, Link as LinkIcon
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
const DefaultIcon = L.icon({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Socket.IO connection
const socket: Socket = io({
  auth: { token: localStorage.getItem('token') },
});

type PropertyType = 'pg' | 'bhk' | 'vacation';

interface Property {
  _id: string;
  propertyName: string;
  address: string;
  contactNumber: string;
  monthlyRent?: number;
  ratePerDay?: number;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  description: string;
  images: string[];
  threeDModel?: string;
  interiorTourLink?: string;
  latitude?: number;
  longitude?: number;
  sharingOptions?: { [key: string]: boolean };
  amenities: { [key: string]: boolean };
  bookingsLast6Months?: number;
  rating?: number;
  reviewsCount?: number;
  isFavorited?: boolean;
  user: string;
  reviews?: { user: string; rating: number; review?: string; date: Date }[];
}

interface ModelViewerProps {
  url?: string;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ url, isFullscreen, toggleFullscreen }) => {
  if (!url) {
    return (
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">No 3D Model Available</p>
      </div>
    );
  }

  const { scene } = useGLTF(url);

  return (
    <div className="relative w-full">
      <div className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'h-64'} rounded-lg`}>
        <Canvas camera={{ position: [0, 10, 100], fov: 70 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <primitive object={scene} scale={isFullscreen ? 2 : 1} />
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            minDistance={1}
            maxDistance={50}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
          />
        </Canvas>
      </div>
      {!isFullscreen && (
        <button
          className="absolute bottom-2 right-2 p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700"
          onClick={toggleFullscreen}
        >
          <Maximize2 className="h-5 w-5" />
        </button>
      )}
      {isFullscreen && (
        <button
          className="absolute top-4 right-4 p-3 bg-red-600 text-white rounded-full hover:bg-red-700 z-50"
          onClick={toggleFullscreen}
        >
          <X className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

const getAmenityIcon = (amenity: string) => {
  switch (amenity.toLowerCase()) {
    case 'wifi': return Wifi;
    case 'tiffinservice': return Utensils;
    case 'fitnesscenter': return Dumbbell;
    case 'bikeparking': return Car;
    case 'securitysystem': return Shield;
    case 'beachaccess': return Waves;
    case 'garden': return Trees;
    case 'tvroom': return Tv;
    case 'hotwater': return Droplet;
    case 'coffeemachine': return Coffee;
    case 'airconditioning': return AirVent;
    case 'furnished': return Bed;
    case 'ceilingfans': return AirVent;
    case 'modularkitchen': return ChefHat;
    case 'extrastorage': return Square;
    case 'roomservice': return Users;
    case 'spaaccess': return Droplet;
    case 'loungeaccess': return Tv;
    case 'kingsizebed': return Bed;
    default: return Star;
  }
};

const Booking: React.FC = () => {
  const { propertyId, propertyType } = useParams<{ propertyId: string; propertyType: PropertyType }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModelFullscreen, setIsModelFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatError, setChatError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      console.log('Fetching property details with Token:', token);
      try {
        if (!propertyId || !propertyType) throw new Error('Invalid property ID or type');
        const response = await fetch(`/api/properties/management/${propertyType}/${propertyId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Fetch property error response:', errorData);
          throw new Error(`Failed to fetch property details: ${response.status} - ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched property:', data);
        setProperty(data);
      } catch (err) {
        console.error('Fetch property error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyDetails();
  }, [propertyId, propertyType]);

  useEffect(() => {
    if (!showChat || !propertyId || !userId || !property?.user) return;

    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      console.log('Fetching messages with Token:', token);
      try {
        const response = await fetch(`/api/properties/messages/${propertyId}/messages`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Fetch messages error response:', errorData);
          throw new Error(`Failed to fetch messages: ${response.status} - ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched messages:', data);
        setMessages(Array.isArray(data) ? data : []);
        setChatError(null);
      } catch (err) {
        console.error('Fetch messages error:', err);
        setChatError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    socket.on('connect', () => console.log('Socket connected'));
    socket.on('connect_error', (err) => console.error('Socket connection error:', err.message));
    socket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
      console.log('Received message:', message);
    });
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setChatError(error.message);
    });

    fetchMessages();
    socket.emit('joinChat', { userId, otherUserId: property.user, propertyId });

    return () => {
      socket.off('receiveMessage');
      socket.off('connect');
      socket.off('connect_error');
      socket.off('error');
    };
  }, [propertyId, showChat, userId, property?.user]);

  useEffect(() => {
    if (showChat && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showChat]);

  // Force map invalidation after render
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    }
  }, [property]);

  const handleBookNow = () => {
    if (propertyType !== 'vacation') {
      alert('Booking only available for vacation properties');
      return;
    }
    navigate(`/payment/vacation/${propertyId}`);
  };

  const handleContact = () => {
    if (userId === property?.user) return;
    setShowChat(!showChat);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !property?.user || !userId) {
      setChatError('Cannot send message - missing user or content');
      return;
    }
    const messageData = { 
      sender: userId, 
      recipient: property.user, 
      propertyId, 
      propertyType, 
      content: newMessage 
    };
    console.log('Sending message:', messageData);
    socket.emit('sendMessage', messageData);
    setMessages((prev) => [...prev, { ...messageData, sender: { _id: userId }, timestamp: new Date() }]);
    setNewMessage('');
    setChatError(null);
  };

  const isOwner = userId === property?.user;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!property) return <div className="min-h-screen flex items-center justify-center">No property found</div>;

  // Validate latitude and longitude
  const isValidLatLng = property.latitude != null && property.longitude != null &&
    !isNaN(property.latitude) && !isNaN(property.longitude) &&
    property.latitude >= -90 && property.latitude <= 90 &&
    property.longitude >= -180 && property.longitude <= 180;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{property.propertyName}</h1>
          <p className="text-gray-600 mb-4">{property.address}</p>
          {propertyType === 'vacation' && (
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                <span>{property.rating || 'N/A'} ({property.reviewsCount || 0} reviews)</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-1" />
                <span>{property.bookingsLast6Months || 0} guests booked in last 6 months</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
            <div className="grid grid-cols-2 gap-4">
              {property.images.map((img: string, index: number) => (
                <img
                  key={index}
                  src={img}
                  alt={`${property.propertyName} - Image ${index + 1}`}
                  className="w-full h-56 object-cover rounded-lg hover:scale-105 transition-transform"
                />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">3D Model</h2>
            <ModelViewer
              url={property.threeDModel}
              isFullscreen={isModelFullscreen}
              toggleFullscreen={() => setIsModelFullscreen(!isModelFullscreen)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {property.monthlyRent && (
              <p className="flex items-center"><DollarSign className="h-5 w-5 mr-2 text-green-500" /> ₹{property.monthlyRent}/month</p>
            )}
            {property.ratePerDay && (
              <p className="flex items-center"><DollarSign className="h-5 w-5 mr-2 text-green-500" /> ₹{property.ratePerDay}/day</p>
            )}
            {property.maxGuests && (
              <p className="flex items-center"><Users className="h-5 w-5 mr-2 text-blue-500" /> Max Guests: {property.maxGuests}</p>
            )}
            {property.bedrooms && (
              <p className="flex items-center"><Bed className="h-5 w-5 mr-2 text-purple-500" /> {property.bedrooms} Bedrooms</p>
            )}
            {property.bathrooms && (
              <p className="flex items-center"><Bath className="h-5 w-5 mr-2 text-blue-500" /> {property.bathrooms} Bathrooms</p>
            )}
            {property.squareFeet && (
              <p className="flex items-center"><Square className="h-5 w-5 mr-2 text-gray-500" /> {property.squareFeet} sq.ft.</p>
            )}
            <p className="flex items-center"><Phone className="h-5 w-5 mr-2 text-gray-600" /> {property.contactNumber}</p>
          </div>
          <p className="mt-4 text-gray-600"><strong>Description:</strong> {property.description}</p>
          {property.interiorTourLink && (
            <p className="mt-4">
              <strong>Interior Tour:</strong>{' '}
              <a
                href={property.interiorTourLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center"
              >
                <LinkIcon className="h-5 w-5 mr-2" />
                Take a Virtual Tour
              </a>
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(property.amenities || {})
              .filter(([_, available]) => available)
              .map(([amenity]) => {
                const Icon = getAmenityIcon(amenity);
                return (
                  <div key={amenity} className="flex items-center text-gray-600">
                    <Icon className="h-5 w-5 mr-2 text-teal-500" />
                    {amenity.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                );
              })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Location</h2>
          {isValidLatLng ? (
            <MapContainer
              center={[property.latitude!, property.longitude!]}
              zoom={15}
              style={{ height: '256px', width: '100%' }}
              whenReady={() => {
                if (mapRef.current) {
                  mapRef.current.invalidateSize();
                }
              }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[property.latitude!, property.longitude!]}>
                <Popup>{property.propertyName}</Popup>
              </Marker>
            </MapContainer>
          ) : (
            <p className="text-gray-500">Location not available</p>
          )}
        </div>

        {propertyType === 'vacation' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
            {property.reviews && property.reviews.length > 0 ? (
              property.reviews.map((review, index) => (
                <div key={index} className="mb-4 border-b pb-4">
                  <div className="flex items-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700">{review.review || 'No comment provided'}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(review.date).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No reviews yet</p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-4 mb-8">
          <button
            onClick={handleContact}
            disabled={isOwner}
            className={`px-6 py-2 rounded-lg flex items-center ${isOwner ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-600 text-white hover:bg-gray-700'}`}
          >
            <MessageSquare className="h-5 w-5 mr-2" /> {showChat && !isOwner ? 'Hide Chat' : 'Contact'}
          </button>
          <button
            onClick={handleBookNow}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            Book Now
          </button>
        </div>

        <AnimatePresence>
          {showChat && !isOwner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-semibold mb-4">Chat with Owner</h2>
              {chatError && <p className="text-red-500 mb-4">{chatError}</p>}
              <div className="h-64 overflow-y-auto mb-4 bg-gray-50 p-4 rounded-lg">
                {messages.map((msg, index) => (
                  <div key={index} className={`mb-2 ${msg.sender._id === userId ? 'text-right' : 'text-left'}`}>
                    <p className={`inline-block p-2 rounded-lg ${msg.sender._id === userId ? 'bg-blue-100' : 'bg-green-100'}`}>
                      {msg.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 p-2 border rounded-l-lg"
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Booking;