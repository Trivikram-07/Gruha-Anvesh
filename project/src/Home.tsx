import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Home as HomeIcon,
  Building2,
  Palmtree,
  Phone,
  MapPin,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Bed,
  Bath,
  Square,
  Wifi,
  Utensils,
  Dumbbell,
  Car,
  Shield,
  Waves,
  Trees,
  Heart,
  Sliders,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Recommendations from './Components/Recommendations'; // Adjust path as needed
import axios from 'axios';

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
  isFavorited?: boolean;
  city?: string;
  state?: string;
}

interface Filters {
  rentMin?: number;
  rentMax?: number;
  city?: string;
  state?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqftMin?: number;
  maxGuests?: number;
  sharingOptions?: string[];
  amenities?: string[];
}

const categoryColors = {
  pg: 'from-purple-500 to-pink-500',
  bhk: 'from-blue-500 to-teal-500',
  vacation: 'from-orange-500 to-yellow-500',
};

const getAmenityIcon = (amenity: string) => {
  switch (amenity.toLowerCase()) {
    case 'wifi':
    case 'highspeedwifi':
    case 'wifisetup':
      return <Wifi className="h-4 w-4" />;
    case 'tiffinservice':
    case 'meals included':
    case 'meals':
      return <Utensils className="h-4 w-4" />;
    case 'gym':
    case 'fitnesscenter':
      return <Dumbbell className="h-4 w-4" />;
    case 'parking':
    case 'parkingspace':
    case 'bikeparking':
    case 'carparking':
      return <Car className="h-4 w-4" />;
    case 'security':
    case 'securitysystem':
      return <Shield className="h-4 w-4" />;
    case 'beachaccess':
    case 'ocean view':
      return <Waves className="h-4 w-4" />;
    case 'garden':
      return <Trees className="h-4 w-4" />;
    default:
      return null;
  }
};

const amenityLabels: Record<PropertyType, string[]> = {
  pg: [
    'wifi',
    'tiffinService',
    'tvRoom',
    'laundry',
    'bikeParking',
    'hotWater',
    'coffeeMachine',
    'airConditioning',
  ],
  bhk: [
    'carParking',
    'wifiSetup',
    'acUnits',
    'furnished',
    'securitySystem',
    'geysers',
    'ceilingFans',
    'tvSetup',
    'modularKitchen',
    'extraStorage',
  ],
  vacation: [
    'beachAccess',
    'highSpeedWifi',
    'parkingSpace',
    'airConditioning',
    'kingSizeBed',
    'roomService',
    'spaAccess',
    'fitnessCenter',
    'smartTV',
    'loungeAccess',
  ],
};

const sharingOptions = ['single', 'twoSharing', 'threeSharing', 'fourSharing'];

function Home() {
  const [selectedType, setSelectedType] = useState<PropertyType>('pg');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [cities, setCities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      console.log('Fetching properties with Token:', token);

      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.rentMin) queryParams.append('rentMin', filters.rentMin.toString());
      if (filters.rentMax) queryParams.append('rentMax', filters.rentMax.toString());
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.state) queryParams.append('state', filters.state);

      if (selectedType === 'pg') {
        if (filters.sharingOptions?.length) {
          queryParams.append('sharingOptions', filters.sharingOptions.join(','));
        }
        if (filters.amenities?.length) {
          queryParams.append('amenities', filters.amenities.join(','));
        }
      } else if (selectedType === 'bhk') {
        if (filters.bedrooms) queryParams.append('bedrooms', filters.bedrooms.toString());
        if (filters.bathrooms) queryParams.append('bathrooms', filters.bathrooms.toString());
        if (filters.sqftMin) queryParams.append('sqftMin', filters.sqftMin.toString());
        if (filters.amenities?.length) {
          queryParams.append('amenities', filters.amenities.join(','));
        }
      } else if (selectedType === 'vacation') {
        if (filters.maxGuests) queryParams.append('maxGuests', filters.maxGuests.toString());
        if (filters.amenities?.length) {
          queryParams.append('amenities', filters.amenities.join(','));
        }
      }

      try {
        const response = await fetch(`/api/properties/${selectedType}?${queryParams.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Fetch error response:', errorData);
          throw new Error(
            `Failed to fetch ${selectedType} properties: ${response.status} - ${
              errorData.message || response.statusText
            }`
          );
        }
        const data = await response.json();
        console.log('Raw server response:', data);

        const mappedProperties: Property[] = data
          .filter((item: any) => !item.deletedAt)
          .map((item: any) => ({
            id: item._id,
            type: selectedType,
            name: item.propertyName,
            image: item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/300',
            rent:
              selectedType === 'vacation'
                ? `₹${item.ratePerDay}/day`
                : `₹${item.monthlyRent}/month`,
            phone: item.contactNumber,
            area: item.address.split(',')[0],
            location: [item.latitude || 20.5937, item.longitude || 78.9629],
            beds: selectedType === 'bhk' ? item.bedrooms : item.maxGuests || undefined,
            baths: selectedType === 'bhk' ? item.bathrooms : undefined,
            sqft: item.squareFeet,
            amenities: Object.entries(
              selectedType === 'pg' ? { ...item.sharingOptions, ...item.amenities } : item.amenities
            )
              .filter(([_, value]) => value === true)
              .map(([key]) => key),
            description: item.description,
            isFavorited: item.isFavorited || false,
            city: item.city,
            state: item.state,
          }));

        console.log('Mapped properties:', mappedProperties);
        setProperties(mappedProperties);

        // Extract unique cities and states for filter dropdowns
        const uniqueCities = [...new Set(mappedProperties.map((p) => p.city).filter(Boolean))] as string[];
        const uniqueStates = [...new Set(mappedProperties.map((p) => p.state).filter(Boolean))] as string[];
        setCities(uniqueCities);
        setStates(uniqueStates);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [selectedType, filters]);

  const toggleFavorite = async (propertyId: number | string) => {
    const property = properties.find((p) => p.id === propertyId);
    if (!property) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found - please log in');
      setError('Please log in to favorite properties');
      return;
    }

    const newFavoriteStatus = !property.isFavorited;
    console.log('Toggling favorite:', { propertyId, newFavoriteStatus });

    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, isFavorited: newFavoriteStatus } : p))
    );

    try {
      const response = await fetch(`/api/properties/favorites/${propertyId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isFavorited: newFavoriteStatus, propertyType: property.type }),
      });

      const data = await response.json();
      console.log('Server response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(`Failed to update favorite: ${response.status} - ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Favorite toggle error:', err);
      setProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? { ...p, isFavorited: !newFavoriteStatus } : p))
      );
      setError(err instanceof Error ? err.message : 'Failed to update favorite');
    }
  };

  const handleClick = async (propertyId: number | string, propertyType: PropertyType) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token - skipping click tracking');
      return;
    }

    console.log('Sending click:', { propertyId, propertyType });
    try {
      const response = await axios.post(
        `/api/properties/actions/click/${propertyId}`,
        { propertyType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Property clicked:', propertyId, 'Response:', response.data);
    } catch (err) {
      console.error('Click tracking failed:', {
        status: axios.isAxiosError(err) ? err.response?.status : undefined,
        data: axios.isAxiosError(err) ? err.response?.data : null,
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFilters((prev) => {
      const currentAmenities = prev.amenities || [];
      if (currentAmenities.includes(amenity)) {
        return { ...prev, amenities: currentAmenities.filter((a) => a !== amenity) };
      } else {
        return { ...prev, amenities: [...currentAmenities, amenity] };
      }
    });
  };

  const toggleSharingOption = (option: string) => {
    setFilters((prev) => {
      const currentOptions = prev.sharingOptions || [];
      if (currentOptions.includes(option)) {
        return { ...prev, sharingOptions: currentOptions.filter((o) => o !== option) };
      } else {
        return { ...prev, sharingOptions: [...currentOptions, option] };
      }
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const center = properties.length > 0
    ? [
        properties.reduce((sum, p) => sum + p.location[0], 0) / properties.length,
        properties.reduce((sum, p) => sum + p.location[1], 0) / properties.length,
      ] as [number, number]
    : [20.5937, 78.9629] as [number, number];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Toggle */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-full shadow-md p-2 max-w-md mx-auto">
          <div className="relative flex justify-between">
            <button
              onClick={() => setSelectedType('pg')}
              className={`flex-1 py-2 px-4 rounded-full z-10 relative ${
                selectedType === 'pg' ? 'text-white' : 'text-gray-600'
              }`}
            >
              <HomeIcon className="inline-block mr-2 h-5 w-5" />
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
              className={`absolute inset-y-0 rounded-full bg-gradient-to-r ${
                categoryColors[selectedType] || 'from-gray-500 to-gray-700'
              }`}
              initial={false}
              animate={{
                left: selectedType === 'pg' ? '0%' : selectedType === 'bhk' ? '33.33%' : '66.66%',
                width: '33.33%',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
        </div>
      </div>

      {/* Filter Button */}
      <div className="container mx-auto px-4 mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Sliders className="h-5 w-5 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="container mx-auto px-4 mb-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Filter Properties</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Common Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Rent (₹)</label>
              <input
                type="number"
                value={filters.rentMin || ''}
                onChange={(e) => handleFilterChange('rentMin', parseInt(e.target.value) || undefined)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Min rent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Rent (₹)</label>
              <input
                type="number"
                value={filters.rentMax || ''}
                onChange={(e) => handleFilterChange('rentMax', parseInt(e.target.value) || undefined)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Max rent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <select
                value={filters.city || ''}
                onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <select
                value={filters.state || ''}
                onChange={(e) => handleFilterChange('state', e.target.value || undefined)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="">All States</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* PG Filters */}
            {selectedType === 'pg' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sharing Options</label>
                  <div className="mt-2 space-y-2">
                    {sharingOptions.map((option) => (
                      <div key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.sharingOptions?.includes(option) || false}
                          onChange={() => toggleSharingOption(option)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-600">
                          {option.charAt(0).toUpperCase() + option.slice(1).replace('Sharing', ' Sharing')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amenities</label>
                  <div className="mt-2 space-y-2">
                    {amenityLabels.pg.map((amenity) => (
                      <div key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.amenities?.includes(amenity) || false}
                          onChange={() => toggleAmenity(amenity)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-600">
                          {amenity
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase())}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* BHK Filters */}
            {selectedType === 'bhk' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                  <select
                    value={filters.bedrooms || ''}
                    onChange={(e) => handleFilterChange('bedrooms', parseInt(e.target.value) || undefined)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                  <select
                    value={filters.bathrooms || ''}
                    onChange={(e) => handleFilterChange('bathrooms', parseInt(e.target.value) || undefined)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Min Sq.Ft</label>
                  <input
                    type="number"
                    value={filters.sqftMin || ''}
                    onChange={(e) => handleFilterChange('sqftMin', parseInt(e.target.value) || undefined)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    placeholder="Min sq.ft"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amenities</label>
                  <div className="mt-2 space-y-2">
                    {amenityLabels.bhk.map((amenity) => (
                      <div key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.amenities?.includes(amenity) || false}
                          onChange={() => toggleAmenity(amenity)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-600">
                          {amenity
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase())}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Vacation Filters */}
            {selectedType === 'vacation' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Guests</label>
                  <select
                    value={filters.maxGuests || ''}
                    onChange={(e) => handleFilterChange('maxGuests', parseInt(e.target.value) || undefined)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amenities</label>
                  <div className="mt-2 space-y-2">
                    {amenityLabels.vacation.map((amenity) => (
                      <div key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.amenities?.includes(amenity) || false}
                          onChange={() => toggleAmenity(amenity)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-600">
                          {amenity
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase())}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-8">Loading properties...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <>
          {/* Map */}
          <div className="w-full h-[400px] mb-8 relative">
            <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {properties.map((property) => (
                <Marker key={property.id} position={[property.location[0], property.location[1]]}>
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

          {/* Properties and Recommendations */}
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105"
                  onClick={() => handleClick(property.id, property.type)}
                >
                  <div className="relative">
                    <img
                      src={property.image}
                      alt={property.name}
                      className="w-full h-48 object-cover"
                    />
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(property.id);
                      }}
                      className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.div
                        initial={false}
                        animate={{ scale: property.isFavorited ? [1, 1.3, 1] : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Heart
                          className={`h-5 w-5 ${property.isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
                        />
                      </motion.div>
                    </motion.button>
                  </div>
                  <div className="p-6 flex flex-col">
                    <h3 className="text-xl font-semibold mb-2">{property.name}</h3>
                    <p className="text-gray-600 mb-2">{property.area}</p>
                    <p className="text-gray-600 mb-4 text-sm">{property.description}</p>

                    <div className="flex items-center gap-4 mb-4 text-gray-600">
                      {property.beds && (
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          <span>
                            {property.beds} {property.beds === 1 ? 'Bed' : 'Beds'}
                          </span>
                        </div>
                      )}
                      {property.baths && (
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          <span>
                            {property.baths} {property.baths === 1 ? 'Bath' : 'Baths'}
                          </span>
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
                      <Link
                        to={`/booking/${property.type}/${property.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClick(property.id, property.type);
                        }}
                      >
                        View Details
                      </Link>
                    </div>
                    <div className="flex items-center text-gray-600 mb-4">
                      <Phone className="h-4 w-4 mr-2" />
                      {property.phone}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {property.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-blue-500 to-teal-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center justify-center gap-1 shadow-md"
                        >
                          {getAmenityIcon(amenity)}
                          {amenity
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations Section */}
            <div className="mt-12">
              <Recommendations propertyType={selectedType} />
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer
        className={`bg-gradient-to-r ${
          categoryColors[selectedType] || 'from-gray-500 to-gray-700'
        } text-white mt-16`}
      >
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">EasyNest</h3>
              <p className="text-white/80">Find your perfect living space with ease.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white/80">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white/80">
                    Properties
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white/80">
                    List Property
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white/80">
                    Contact
                  </a>
                </li>
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