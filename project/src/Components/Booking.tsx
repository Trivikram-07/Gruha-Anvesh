import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import {
  Bed, Bath, Square, Wifi, Utensils, Dumbbell, Car, Shield, Waves, Trees, Star, Users,
  MessageSquare, Loader2, MapPin, DollarSign, Phone, Tv, Droplet, Coffee, AirVent,
  ChefHat, X, Maximize2, Link as LinkIcon, Calendar, ChevronLeft, ChevronRight
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
const socket: Socket = io('https://gruha-anvesh.onrender.com', {
  auth: { token: localStorage.getItem('token') },
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleCloseViewer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex(null);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null && property) {
      setSelectedImageIndex((selectedImageIndex + 1) % property.images.length);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null && property) {
      setSelectedImageIndex((selectedImageIndex - 1 + property.images.length) % property.images.length);
    }
  };

  const handleThumbnailClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex(index);
  };

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      console.log('Fetching property details with Token:', token);

      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        if (!propertyId || !propertyType) throw new Error('Invalid property ID or type');
        const response = await fetch(`/api/properties/management/${propertyType}/${propertyId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Fetch response status:', response.status, response.statusText);
        if (!response.headers.get('content-type')?.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text.slice(0, 100));
          throw new Error('Server returned invalid response (not JSON)');
        }
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Fetch property error response:', errorData);
          throw new Error(`Failed to fetch property details: ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched property:', data);
        setProperty(data);
      } catch (err) {
        console.error('Fetch property error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching property details');
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
      if (!token) {
        setChatError('No authentication token found. Please log in.');
        return;
      }
      try {
        const response = await fetch(`/api/properties/messages/${propertyId}/messages`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Messages fetch status:', response.status, response.statusText);
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Fetch messages error response:', errorData);
          throw new Error(`Failed to fetch messages: ${errorData.message || response.statusText}`);
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
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setChatError('Failed to connect to chat server');
    });
    socket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
      console.log('Received message:', message);
    });
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setChatError(error.message || 'Chat error occurred');
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

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    }
  }, [property]);

  const handleBookNow = () => {
    if (propertyType !== 'vacation') {
      setError('Booking only available for vacation properties');
      return;
    }
    navigate(`/payment/vacation/${propertyId}`);
  };

  const handleContact = () => {
    if (userId === property?.user) {
      setChatError('You cannot chat with yourself');
      return;
    }
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
      content: newMessage,
      timestamp: new Date(),
    };
    console.log('Sending message:', messageData);
    socket.emit('sendMessage', messageData);
    setMessages((prev) => [...prev, { ...messageData, sender: { _id: userId } }]);
    setNewMessage('');
    setChatError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isOwner = userId === property?.user;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!property) return <div className="min-h-screen flex items-center justify-center text-gray-500">No property found</div>;

  const isValidLatLng = property.latitude != null && property.longitude != null &&
    !isNaN(property.latitude) && !isNaN(property.longitude) &&
    property.latitude >= -90 && property.latitude <= 90 &&
    property.longitude >= -180 && property.longitude <= 180;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-5xl">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{property.propertyName}</h1>
          <p className="text-gray-600 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-500" />
            {property.address}
          </p>
          {propertyType === 'vacation' && (
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                <span>{property.rating?.toFixed(1) || 'N/A'} ({property.reviewsCount || 0} reviews)</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-1" />
                <span>{property.bookingsLast6Months || 0} guests booked in last 6 months</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 relative z-10">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
            <div className="grid grid-cols-2 gap-4">
              {property.images.map((img: string, index: number) => (
                <img
                  key={index}
                  src={img}
                  alt={`${property.propertyName} - Image ${index + 1}`}
                  className="w-full h-56 object-cover rounded-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
                  onClick={() => handleImageClick(index)}
                  onError={(e) => (e.currentTarget.src = 'https://placehold.co/300')}
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

        {/* Image Viewer Modal */}
        <AnimatePresence>
          {selectedImageIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
              onClick={handleCloseViewer}
            >
              <div
               className="relative w-[90vw] h-[90vh] bg-grey-300 rounded-xl p-6 flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button className="absolute top-6 right-4 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-700 z-50" onClick={handleCloseViewer}>
                  <X className="h-8 w-8" />
                </button>

                {/* Main Image */}
                <div className="flex-1 flex items-center justify-center relative">
                  <img
                    src={property.images[selectedImageIndex]}
                    alt={`${property.propertyName} - Image ${selectedImageIndex + 1}`}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                    onError={(e) => (e.currentTarget.src = 'https://placehold.co/800')}
                  />
                  {/* Navigation Arrows */}
                  <button
                    className="absolute left-6 p-3 bg-gray-800 text-white rounded-full hover:bg-gray-700"
                    onClick={handleNextImage}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                  <button
                    className="absolute right-6 p-3 bg-gray-800 text-white rounded-full hover:bg-gray-700"
                    onClick={handlePrevImage}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                </div>

                {/* Thumbnail Gallery */}
                <div className="mt-6 flex overflow-x-auto gap-3 p-3 bg-transperent-100 rounded-lg">
                  {property.images.map((img: string, index: number) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${property.propertyName} - Thumbnail ${index + 1}`}
                      className={`w-[96px] h-[96px] min-w-[96px] min-h-[96px] object-cover rounded-lg cursor-pointer border-4 ${
                        selectedImageIndex === index ? 'border-blue-500' : 'border-transparent'
                      }`}
                      onClick={(e) => handleThumbnailClick(index, e)}
                      onError={(e) => (e.currentTarget.src = 'https://placehold.co/150')}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {property.monthlyRent && (
              <p className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                ₹{property.monthlyRent.toLocaleString()}/month
              </p>
            )}
            {property.ratePerDay && (
              <p className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                ₹{property.ratePerDay.toLocaleString()}/day
              </p>
            )}
            {property.maxGuests && (
              <p className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Max Guests: {property.maxGuests}
              </p>
            )}
            {property.bedrooms && (
              <p className="flex items-center">
                <Bed className="h-5 w-5 mr-2 text-purple-500" />
                {property.bedrooms} Bedrooms
              </p>
            )}
            {property.bathrooms && (
              <p className="flex items-center">
                <Bath className="h-5 w-5 mr-2 text-blue-500" />
                {property.bathrooms} Bathrooms
              </p>
            )}
            {property.squareFeet && (
              <p className="flex items-center">
                <Square className="h-5 w-5 mr-2 text-gray-500" />
                {property.squareFeet.toLocaleString()} sq.ft.
              </p>
            )}
            <p className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-gray-600" />
              {property.contactNumber}
            </p>
          </div>
          <p className="mt-4 text-gray-600">
            <strong>Description:</strong> {property.description || 'No description provided'}
          </p>
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

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 relative z-0">
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

        <AnimatePresence>
          {showChat && !isOwner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-8 overflow-hidden"
            >
              <h2 className="text-2xl font-semibold mb-4">Chat with Owner</h2>
              {chatError && (
                <p className="text-red-500 mb-4">{chatError}</p>
              )}
              <div className="h-64 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center">No messages yet</p>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`mb-2 flex ${
                        msg.sender._id === userId ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          msg.sender._id === userId
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-end gap-4 mb-8">
          <button
            onClick={handleContact}
            disabled={isOwner}
            className={`px-6 py-2 rounded-lg flex items-center transition-colors ${
              isOwner
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            {showChat && !isOwner ? 'Hide Chat' : 'Contact Owner'}
          </button>
          {propertyType === 'vacation' && (
            <button
              onClick={handleBookNow}
              className="px-6 py-2 rounded-lg flex items-center transition-colors bg-blue-600 text-white hover:bg-blue-700"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Book Now
            </button>
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
      </div>
    </motion.div>
  );
};

export default Booking;