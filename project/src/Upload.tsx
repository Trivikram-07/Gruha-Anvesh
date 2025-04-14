import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Home, Building2, Palmtree, Upload as UploadIcon, Wifi, Utensils, Tv, Shirt, Bike,
  Droplets, Coffee, Wind, Users, Car, Shield, Sofa, Lock, Thermometer,
  Fan, Package, UtensilsCrossed, Waves, Crown, Bell, Phone, Mail,
  Space as Spa, Dumbbell, MonitorPlay, Armchair, Instagram, Facebook, Twitter,
  Loader2 // Add Loader2 for loading effect
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type PropertyType = 'pg' | 'bhk' | 'vacation';

const categoryColors = {
  pg: 'from-purple-500 to-pink-500',
  bhk: 'from-blue-500 to-teal-500',
  vacation: 'from-orange-500 to-yellow-500',
};

const pgAmenities = [
  { id: 'wifi', label: 'WiFi', icon: <Wifi className="h-4 w-4" /> },
  { id: 'tiffinService', label: 'Tiffin Service', icon: <Utensils className="h-4 w-4" /> },
  { id: 'tvRoom', label: 'TV Room', icon: <Tv className="h-4 w-4" /> },
  { id: 'laundry', label: 'Laundry', icon: <Shirt className="h-4 w-4" /> },
  { id: 'bikeParking', label: 'Bike Parking', icon: <Bike className="h-4 w-4" /> },
  { id: 'hotWater', label: 'Hot Water', icon: <Droplets className="h-4 w-4" /> },
  { id: 'coffeeMachine', label: 'Coffee Machine', icon: <Coffee className="h-4 w-4" /> },
  { id: 'airConditioning', label: 'Air Conditioning', icon: <Wind className="h-4 w-4" /> },
];

const bhkAmenities = [
  { id: 'carParking', label: 'Car Parking', icon: <Car className="h-4 w-4" /> },
  { id: 'wifiSetup', label: 'WiFi Setup', icon: <Wifi className="h-4 w-4" /> },
  { id: 'acUnits', label: 'AC Units', icon: <Wind className="h-4 w-4" /> },
  { id: 'furnished', label: 'Furnished', icon: <Sofa className="h-4 w-4" /> },
  { id: 'securitySystem', label: 'Security System', icon: <Shield className="h-4 w-4" /> },
  { id: 'geysers', label: 'Geysers', icon: <Thermometer className="h-4 w-4" /> },
  { id: 'ceilingFans', label: 'Ceiling Fans', icon: <Fan className="h-4 w-4" /> },
  { id: 'tvSetup', label: 'TV Setup', icon: <Tv className="h-4 w-4" /> },
  { id: 'modularKitchen', label: 'Modular Kitchen', icon: <UtensilsCrossed className="h-4 w-4" /> },
  { id: 'extraStorage', label: 'Extra Storage', icon: <Package className="h-4 w-4" /> },
];

const vacationAmenities = [
  { id: 'beachAccess', label: 'Beach Access', icon: <Waves className="h-4 w-4" /> },
  { id: 'highSpeedWifi', label: 'High-Speed WiFi', icon: <Wifi className="h-4 w-4" /> },
  { id: 'parkingSpace', label: 'Parking Space', icon: <Car className="h-4 w-4" /> },
  { id: 'airConditioning', label: 'Air Conditioning', icon: <Wind className="h-4 w-4" /> },
  { id: 'kingSizeBed', label: 'King Size Bed', icon: <Crown className="h-4 w-4" /> },
  { id: 'roomService', label: 'Room Service', icon: <Bell className="h-4 w-4" /> },
  { id: 'spaAccess', label: 'Spa Access', icon: <Spa className="h-4 w-4" /> },
  { id: 'fitnessCenter', label: 'Fitness Center', icon: <Dumbbell className="h-4 w-4" /> },
  { id: 'smartTV', label: 'Smart TV', icon: <MonitorPlay className="h-4 w-4" /> },
  { id: 'loungeAccess', label: 'Lounge Access', icon: <Armchair className="h-4 w-4" /> },
];

const sharingOptions = [1, 2, 3, 4] as const;

interface FormData {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  rent: string;
  description: string;
  images: File[];
  model3d: File | null;
  interiorTourLink: string;
  pgAmenities: Record<string, boolean>;
  sharingOptions: Record<number, boolean>;
  bhkAmenities: Record<string, boolean>;
  bedrooms: number;
  bathrooms: number;
  sqft: string;
  vacationAmenities: Record<string, boolean>;
  maxGuests: number;
}

function Upload() {
  const [selectedType, setSelectedType] = useState<PropertyType>('pg');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    rent: '',
    description: '',
    images: [],
    model3d: null,
    interiorTourLink: '',
    pgAmenities: Object.fromEntries(pgAmenities.map(a => [a.id, false])),
    sharingOptions: Object.fromEntries(sharingOptions.map(o => [o, false])),
    bhkAmenities: Object.fromEntries(bhkAmenities.map(a => [a.id, false])),
    bedrooms: 1,
    bathrooms: 1,
    sqft: '',
    vacationAmenities: Object.fromEntries(vacationAmenities.map(a => [a.id, false])),
    maxGuests: 2,
  });
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  });
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleCheckboxChange = (category: keyof FormData, id: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category] as Record<string, boolean>,
        [id]: !(prev[category] as Record<string, boolean>)[id],
      },
    }));
  };

  const handleSharingOptionChange = (option: number) => {
    setFormData(prev => ({
      ...prev,
      sharingOptions: {
        ...prev.sharingOptions,
        [option]: !prev.sharingOptions[option],
      },
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newFiles].slice(0, 5),
      }));
    }
  };

  const handle3DModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        model3d: e.target.files ? e.target.files[0] : null,
      }));
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setLocation({ latitude: e.latlng.lat, longitude: e.latlng.lng });
      },
    });
    return location.latitude && location.longitude ? (
      <Marker position={[location.latitude, location.longitude]} />
    ) : null;
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Couldn’t get your location. Please allow location access or use the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    const formDataToSend = new FormData();

    formDataToSend.append('propertyName', formData.name || '');
    formDataToSend.append('contactNumber', formData.phone || '');
    formDataToSend.append('address', formData.address || '');
    formDataToSend.append('city', formData.city || '');
    formDataToSend.append('state', formData.state || '');
    formDataToSend.append(selectedType === 'vacation' ? 'ratePerDay' : 'monthlyRent', formData.rent || '0');
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('interiorTourLink', formData.interiorTourLink || '');

    if (location.latitude && location.longitude) {
      formDataToSend.append('latitude', location.latitude.toString());
      formDataToSend.append('longitude', location.longitude.toString());
    }

    if (selectedType === 'pg') {
      formDataToSend.append('single', formData.sharingOptions[1].toString());
      formDataToSend.append('twoSharing', formData.sharingOptions[2].toString());
      formDataToSend.append('threeSharing', formData.sharingOptions[3].toString());
      formDataToSend.append('fourSharing', formData.sharingOptions[4].toString());
      formDataToSend.append('wifi', formData.pgAmenities.wifi.toString());
      formDataToSend.append('tiffinService', formData.pgAmenities.tiffinService.toString());
      formDataToSend.append('tvRoom', formData.pgAmenities.tvRoom.toString());
      formDataToSend.append('laundry', formData.pgAmenities.laundry.toString());
      formDataToSend.append('bikeParking', formData.pgAmenities.bikeParking.toString());
      formDataToSend.append('hotWater', formData.pgAmenities.hotWater.toString());
      formDataToSend.append('coffeeMachine', formData.pgAmenities.coffeeMachine.toString());
      formDataToSend.append('airConditioning', formData.pgAmenities.airConditioning.toString());
    } else if (selectedType === 'bhk') {
      formDataToSend.append('bedrooms', formData.bedrooms.toString());
      formDataToSend.append('bathrooms', formData.bathrooms.toString());
      formDataToSend.append('squareFeet', formData.sqft || '0');
      formDataToSend.append('carParking', formData.bhkAmenities.carParking.toString());
      formDataToSend.append('wifiSetup', formData.bhkAmenities.wifiSetup.toString());
      formDataToSend.append('acUnits', formData.bhkAmenities.acUnits.toString());
      formDataToSend.append('furnished', formData.bhkAmenities.furnished.toString());
      formDataToSend.append('securitySystem', formData.bhkAmenities.securitySystem.toString());
      formDataToSend.append('geysers', formData.bhkAmenities.geysers.toString());
      formDataToSend.append('ceilingFans', formData.bhkAmenities.ceilingFans.toString());
      formDataToSend.append('tvSetup', formData.bhkAmenities.tvSetup.toString());
      formDataToSend.append('modularKitchen', formData.bhkAmenities.modularKitchen.toString());
      formDataToSend.append('extraStorage', formData.bhkAmenities.extraStorage.toString());
    } else if (selectedType === 'vacation') {
      formDataToSend.append('maxGuests', formData.maxGuests.toString());
      formDataToSend.append('beachAccess', formData.vacationAmenities.beachAccess.toString());
      formDataToSend.append('highSpeedWifi', formData.vacationAmenities.highSpeedWifi.toString());
      formDataToSend.append('parkingSpace', formData.vacationAmenities.parkingSpace.toString());
      formDataToSend.append('airConditioning', formData.vacationAmenities.airConditioning.toString());
      formDataToSend.append('kingSizeBed', formData.vacationAmenities.kingSizeBed.toString());
      formDataToSend.append('roomService', formData.vacationAmenities.roomService.toString());
      formDataToSend.append('spaAccess', formData.vacationAmenities.spaAccess.toString());
      formDataToSend.append('fitnessCenter', formData.vacationAmenities.fitnessCenter.toString());
      formDataToSend.append('smartTV', formData.vacationAmenities.smartTV.toString());
      formDataToSend.append('loungeAccess', formData.vacationAmenities.loungeAccess.toString());
    }

    formData.images.forEach((image) => formDataToSend.append('images', image));
    if (formData.model3d) formDataToSend.append('threeDModel', formData.model3d);

    console.log('FormData being sent:');
    for (const [key, value] of formDataToSend.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found. Please log in.');

      const endpoint = `/api/properties/management/${selectedType}`;
      console.log('Submitting to endpoint:', endpoint, 'with Token:', token);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.errors
          ? errorData.errors.map((err: any) => err.msg).join(', ')
          : errorData.message || `Server returned ${response.status}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Property submitted successfully:', result);
      alert('Property listed successfully!');
      setFormData({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        rent: '',
        description: '',
        images: [],
        model3d: null,
        interiorTourLink: '',
        pgAmenities: Object.fromEntries(pgAmenities.map(a => [a.id, false])),
        sharingOptions: Object.fromEntries(sharingOptions.map(o => [o, false])),
        bhkAmenities: Object.fromEntries(bhkAmenities.map(a => [a.id, false])),
        bedrooms: 1,
        bathrooms: 1,
        sqft: '',
        vacationAmenities: Object.fromEntries(vacationAmenities.map(a => [a.id, false])),
        maxGuests: 2,
      });
      setLocation({ latitude: null, longitude: null });
    } catch (error) {
      console.error('Error submitting form:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
      alert(`Failed to list property: ${(error as Error).message}`);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">List Your Property</h2>
          <p className="text-gray-600">Fill in the details below to list your property on GruhaAnvesh</p> {/* Updated to GruhaAnvesh */}
        </div>

        <div className="bg-white rounded-full shadow-md p-2 max-w-md mx-auto mb-10">
          <div className="relative flex justify-between">
            <button
              onClick={() => setSelectedType('pg')}
              className={`flex-1 py-2 px-4 rounded-full z-10 relative ${
                selectedType === 'pg' ? 'text-white' : 'text-gray-600'
              }`}
            >
              <Home className="inline-block mr-2 h-5 w-5" />
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
                width: '33.33%',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className={`text-xl font-semibold mb-4 bg-gradient-to-r ${categoryColors[selectedType]} bg-clip-text text-transparent`}>
                Basic Information
              </h3>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Property Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={selectedType === 'pg' ? 'Sunshine PG' : selectedType === 'bhk' ? 'Green Valley Apartments' : 'Beachfront Villa'}
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+91 9876543210"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full address of the property"
                required
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Bangalore"
                required
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Karnataka"
                required
              />
            </div>

            <div className="md:col-span-2 mt-6">
              <h3 className={`text-xl font-semibold mb-4 bg-gradient-to-r ${categoryColors[selectedType]} bg-clip-text text-transparent`}>
                Property Location
              </h3>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Use My Current Location
              </button>
              <div style={{ height: '300px', width: '100%' }}>
                <MapContainer
                  center={[17.385, 78.4867]} // Hyderabad default
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <LocationMarker />
                </MapContainer>
              </div>
              {location.latitude && location.longitude && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected Location: Lat {location.latitude.toFixed(4)}, Long {location.longitude.toFixed(4)}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="rent" className="block text-sm font-medium text-gray-700 mb-1">
                {selectedType === 'vacation' ? 'Rate per Day' : 'Monthly Rent'}
              </label>
              <input
                type="text"
                id="rent"
                name="rent"
                value={formData.rent}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={selectedType === 'vacation' ? '₹10,000/day' : '₹15,000/month'}
                required
              />
            </div>

            {selectedType === 'bhk' && (
              <>
                <div>
                  <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrooms
                  </label>
                  <select
                    id="bedrooms"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Bedroom' : 'Bedrooms'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                    Bathrooms
                  </label>
                  <select
                    id="bathrooms"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Bathroom' : 'Bathrooms'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="sqft" className="block text-sm font-medium text-gray-700 mb-1">
                    Square Feet
                  </label>
                  <input
                    type="text"
                    id="sqft"
                    name="sqft"
                    value={formData.sqft}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1200"
                    required
                  />
                </div>
              </>
            )}

            {selectedType === 'vacation' && (
              <div>
                <label htmlFor="maxGuests" className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Guests
                </label>
                <input
                  type="number"
                  id="maxGuests"
                  name="maxGuests"
                  min="1"
                  max="20"
                  value={formData.maxGuests}
                  onChange={handleNumberChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            )}

            {selectedType === 'pg' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sharing Options Available
                </label>
                <div className="flex flex-wrap gap-4">
                  {sharingOptions.map(option => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sharingOptions[option]}
                        onChange={() => handleSharingOptionChange(option)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-5 w-5"
                      />
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {option === 1 ? 'Single' : `${option} Sharing`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your property in detail..."
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="interiorTourLink" className="block text-sm font-medium text-gray-700 mb-1">
                Interior Tour Link (Optional)
              </label>
              <input
                type="url"
                id="interiorTourLink"
                name="interiorTourLink"
                value={formData.interiorTourLink}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/interior-tour"
              />
            </div>

            <div className="md:col-span-2 mt-6">
              <h3 className={`text-xl font-semibold mb-4 bg-gradient-to-r ${categoryColors[selectedType]} bg-clip-text text-transparent`}>
                Amenities
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedType === 'pg' &&
                  pgAmenities.map(amenity => (
                    <label key={amenity.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.pgAmenities[amenity.id]}
                        onChange={() => handleCheckboxChange('pgAmenities', amenity.id)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-5 w-5"
                      />
                      <span className="flex items-center">
                        {amenity.icon}
                        <span className="ml-1">{amenity.label}</span>
                      </span>
                    </label>
                  ))}

                {selectedType === 'bhk' &&
                  bhkAmenities.map(amenity => (
                    <label key={amenity.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.bhkAmenities[amenity.id]}
                        onChange={() => handleCheckboxChange('bhkAmenities', amenity.id)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-5 w-5"
                      />
                      <span className="flex items-center">
                        {amenity.icon}
                        <span className="ml-1">{amenity.label}</span>
                      </span>
                    </label>
                  ))}

                {selectedType === 'vacation' &&
                  vacationAmenities.map(amenity => (
                    <label key={amenity.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.vacationAmenities[amenity.id]}
                        onChange={() => handleCheckboxChange('vacationAmenities', amenity.id)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-5 w-5"
                      />
                      <span className="flex items-center">
                        {amenity.icon}
                        <span className="ml-1">{amenity.label}</span>
                      </span>
                    </label>
                  ))}
              </div>
            </div>

            <div className="md:col-span-2 mt-6">
              <h3 className={`text-xl font-semibold mb-4 bg-gradient-to-r ${categoryColors[selectedType]} bg-clip-text text-transparent`}>
                Images & Media
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Images (Max 5)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadIcon className="w-8 h-8 mb-3 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB each)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={formData.images.length >= 5}
                    />
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Property image ${index + 1}`}
                          className="h-24 w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3D Model (Optional)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadIcon className="w-8 h-8 mb-3 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Upload 3D model</span>
                      </p>
                      <p className="text-xs text-gray-500">GLB, GLTF or OBJ format</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".glb,.gltf,.obj"
                      onChange={handle3DModelUpload}
                    />
                  </label>
                </div>
                {formData.model3d && (
                  <p className="mt-2 text-sm text-gray-600">Uploaded: {formData.model3d.name}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <button
              type="submit"
              disabled={isLoading} // Disable button during loading
              className={`px-8 py-3 rounded-lg text-white font-medium text-lg flex items-center justify-center ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : `bg-gradient-to-r ${categoryColors[selectedType]} hover:opacity-90`
              } transition-opacity`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Listing...
                </>
              ) : (
                'List My Property'
              )}
            </button>
          </div>
        </form>
      </div>

      <footer className={`bg-gradient-to-r ${categoryColors[selectedType]} text-white mt-16`}>
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">GruhaAnvesh</h3> {/* Updated to GruhaAnvesh */}
              <p className="text-white/80">Find your perfect living space with ease.</p>
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
                  contact@gruhaanvesh.com {/* Updated to GruhaAnvesh */}
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
            © 2025 GruhaAnvesh. All rights reserved. {/* Updated to GruhaAnvesh */}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Upload;