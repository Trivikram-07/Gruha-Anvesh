import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home as HomeIcon, Building2, Palmtree, Phone, MapPin, Mail, Instagram, Facebook, Twitter, Bed, Bath, Square, Wifi, Coffee, Utensils, Dumbbell, Car, Shield, Waves, Trees } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from './Components/Navbar';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

type PropertyType = 'pg' | 'bhk' | 'vacation';

interface Property {
  id: number | string;
  type: PropertyType;
  name: string;
  image: string;
  rent: string;
  phone: string;
  area: string;
  location: [number, number];
  beds?: number;
  baths?: number;
  sqft?: number;
  amenities: string[];
  description: string;
}

const categoryColors = {
  pg: 'from-purple-500 to-pink-500',
  bhk: 'from-blue-500 to-teal-500',
  vacation: 'from-orange-500 to-yellow-500',
};

const getAmenityIcon = (amenity: string) => {
  switch (amenity.toLowerCase()) {
    case 'wifi': return <Wifi className="h-4 w-4" />;
    case 'meals included':
    case 'meals': return <Utensils className="h-4 w-4" />;
    case 'gym': return <Dumbbell className="h-4 w-4" />;
    case 'parking': return <Car className="h-4 w-4" />;
    case 'security': return <Shield className="h-4 w-4" />;
    case 'beach access':
    case 'ocean view': return <Waves className="h-4 w-4" />;
    case 'garden': return <Trees className="h-4 w-4" />;
    default: return null;
  }
};

function Home() {
  const [selectedType, setSelectedType] = useState<PropertyType>('pg');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3000/api/properties/${selectedType}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch ${selectedType} properties: ${response.statusText}`);
        }
        const data = await response.json();

        const mappedProperties: Property[] = data.map((item: any) => ({
          id: item._id,
          type: selectedType,
          name: item.propertyName,
          image: item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/300',
          rent: selectedType === 'vacation' ? `₹${item.ratePerDay}/day` : `₹${item.monthlyRent}/month`,
          phone: item.contactNumber,
          area: item.address.split(',')[0],
          location: [item.latitude || 20.5937, item.longitude || 78.9629],
          beds: selectedType === 'bhk' ? item.bedrooms : item.maxGuests || undefined,
          baths: selectedType === 'bhk' ? item.bathrooms : undefined,
          sqft: item.squareFeet,
          amenities: Object.entries(selectedType === 'pg' ? item.sharingOptions || item.amenities : item.amenities)
            .filter(([_, value]) => value === true)
            .map(([key]) => key),
          description: item.description,
        }));

        setProperties(mappedProperties);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [selectedType]);

  const filteredProperties = properties;

  const center = filteredProperties.length > 0
    ? [
        filteredProperties.reduce((sum, p) => sum + p.location[0], 0) / filteredProperties.length,
        filteredProperties.reduce((sum, p) => sum + p.location[1], 0) / filteredProperties.length
      ] as [number, number]
    : [20.5937, 78.9629] as [number, number];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isLoggedIn={false} setIsLoggedIn={() => {}} />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-full shadow-md p-2 max-w-md mx-auto">
          <div className="relative flex justify-between">
            <button
              onClick={() => setSelectedType('pg')}
              className={`flex-1 py-2 px-4 rounded-full z-10 koryelative ${
                selectedType === 'pg' ? 'text-white' : 'text-gray-600'
              }`}
            >
              <div className="inline-block mr-2 h-5 w-5">
                <HomeIcon />
              </div>
              PG
            </button>
            <button
              onClick={() => setSelectedType('bhk')}
              className={`flex-1 py-2 px-4 rounded-full z-10 relative ${
                selectedType === 'bhk' ? 'text-white' : 'text-gray-600'
              }`}
            >
              <Building2 className="inline-block mr-2 h-5 w-5" />
              BHK
            </button>
            <button
              onClick={() => setSelectedType('vacation')}
              className={`flex-1 py-2 px-4 rounded-full z-10 relative ${
                selectedType === 'vacation' ? 'text-white' : 'text-gray-600'
              }`}
            >
              <Palmtree className="inline-block mr-2 h-5 w-5" />
              Vacation
            </button>
            <motion.div
              className={`absolute inset-y-0 rounded-full bg-gradient-to-r ${categoryColors[selectedType]}`}
              initial={false}
              animate={{
                left: selectedType === 'pg' ? '0%' : selectedType === 'bhk' ? '33.33%' : '66.66%',
                width: '33.33%'
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading properties...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <>
          <div className="w-full h-[400px] mb-8 relative">
            <MapContainer
              center={center}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredProperties.map((property) => (
                <Marker
                  key={property.id}
                  position={[property.location[0], property.location[1]]}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">{property.name}</h3>
                      <p className="text-sm text-gray-600">{property.area}</p>
                      <p className="text-sm font-semibold text-blue-600">{property.rent}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6 flex flex-col">
                    <h3 className="text-xl font-semibold mb-2">{property.name}</h3>
                    <p className="text-gray-600 mb-2">{property.area}</p>
                    <p className="text-gray-600 mb-4 text-sm">{property.description}</p>
                    
                    <div className="flex items-center gap-4 mb-4 text-gray-600">
                      {property.beds && (
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          <span>{property.beds} {property.beds === 1 ? 'Bed' : 'Beds'}</span>
                        </div>
                      )}
                      {property.baths && (
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          <span>{property.baths} {property.baths === 1 ? 'Bath' : 'Baths'}</span>
                        </div>
                      )}
                      {property.sqft && (
                        <div className="flex items-center">
                          <Square className="h-4 w-4 mr-1" />
                          <span>{property.sqft} sq.ft</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-600">{property.rent}</span>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Contact
                      </button>
                    </div>
                    <div className="flex items-center text-gray-600 mb-4">
                      <Phone className="h-4 w-4 mr-2" />
                      {property.phone}
                    </div>

                    {/* Amenities at the bottom, 3 per line */}
                    <div className="grid grid-cols-3 gap-2">
                      {property.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-blue-500 to-teal-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center justify-center gap-1 shadow-md"
                        >
                          {getAmenityIcon(amenity)}
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <footer className={`bg-gradient-to-r ${categoryColors[selectedType]} text-white mt-16`}>
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">EasyNest</h3>
              <p className="text-white/80">
                Find your perfect living space with ease.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white/80">About Us</a></li>
                <li><a href="#" className="hover:text-white/80">Properties</a></li>
                <li><a href="#" className="hover:text-white/80">List Property</a></li>
                <li><a href="#" className="hover:text-white/80">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  +91 9876543210
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  contact@easynest.com
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-white/80">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="hover:text-white/80">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="hover:text-white/80">
                  <Twitter className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
            © 2024 EasyNest. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;