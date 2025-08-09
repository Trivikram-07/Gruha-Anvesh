import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Home as HomeIcon,
  Building2,
  Palmtree,
  Phone,
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
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Recommendations from './Components/Recommendations';
import axios from 'axios';

// Fix for default marker icons in Leaflet
// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom red icon for property markers
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom blue icon for user's location
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ----------------------------- Types ----------------------------------------
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

interface HomeProps {
  isLoggedIn: boolean;
}

// ----------------------------- UI helpers ----------------------------------
const categoryColors = {
  pg: 'from-purple-600 to-pink-500',
  bhk: 'from-blue-600 to-cyan-500',
  vacation: 'from-orange-500 to-yellow-400',
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

// ----------------------------- UserLocationMarker ---------------------------
const UserLocationMarker: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
  const map = useMap();
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!isLoggedIn) {
      setLocationError(null);
      setUserPosition(null);
      return;
    }

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    if (!isSecure) {
      setLocationError('Location access requires HTTPS or localhost.');
      return;
    }

    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPosition([latitude, longitude]);
        map.setView([latitude, longitude], 12);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please enable location access.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('The request to get your location timed out.');
            break;
          default:
            setLocationError('An error occurred while retrieving your location.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [isLoggedIn, map]);

  useEffect(() => {
    if (isLoggedIn) requestLocation();
    else {
      setUserPosition(null);
      setLocationError(null);
    }
  }, [isLoggedIn, requestLocation]);

  return (
    <>
      {locationError && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md">
          <span>{locationError}</span>
          {locationError.includes('denied') && (
            <button
              onClick={() => requestLocation()}
              className="bg-white text-red-500 px-3 py-1 rounded hover:bg-gray-100"
            >
              Retry
            </button>
          )}
        </div>
      )}
      {userPosition && (
        <Marker position={userPosition} icon={blueIcon} zIndexOffset={1000}>
          <Popup>Your Current Location</Popup>
        </Marker>
      )}
    </>
  );
};

// ----------------------------- Home Component --------------------------------
export default function Home({ isLoggedIn }: HomeProps) {
  const [selectedType, setSelectedType] = useState<PropertyType>('pg');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [cities, setCities] = useState<string[]>([]);
  const [filterError, setFilterError] = useState<string | null>(null);

  // Refs for 3D scroll effect
  const listRef = useRef<HTMLDivElement | null>(null);
  const tickingRef = useRef(false);

  // ------------------ Fetch properties (keeps your backend calls intact) -----
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const queryParams = new URLSearchParams();
      if (filters.rentMin && filters.rentMin > 0) queryParams.append('rentMin', filters.rentMin.toString());
      if (filters.rentMax && filters.rentMax > 0) queryParams.append('rentMax', filters.rentMax.toString());
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.state) queryParams.append('state', filters.state);

      if (selectedType === 'pg') {
        if (filters.sharingOptions?.length) queryParams.append('sharingOptions', filters.sharingOptions.join(','));
        if (filters.amenities?.length) queryParams.append('amenities', filters.amenities.join(','));
      } else if (selectedType === 'bhk') {
        if (filters.bedrooms) queryParams.append('bedrooms', filters.bedrooms.toString());
        if (filters.bathrooms) queryParams.append('bathrooms', filters.bathrooms.toString());
        if (filters.sqftMin) queryParams.append('sqftMin', filters.sqftMin.toString());
        if (filters.amenities?.length) queryParams.append('amenities', filters.amenities.join(','));
      } else if (selectedType === 'vacation') {
        if (filters.maxGuests) queryParams.append('maxGuests', filters.maxGuests.toString());
        if (filters.amenities?.length) queryParams.append('amenities', filters.amenities.join(','));
      }

      try {
        const response = await fetch(`/api/properties/management/${selectedType}?${queryParams.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to fetch ${selectedType} properties: ${response.status} - ${errorData.message || response.statusText}`
          );
        }
        const data = await response.json();

        const mappedProperties: Property[] = data
          .filter((item: any) => !item.deletedAt)
          .map((item: any) => ({
            id: item._id,
            type: selectedType,
            name: item.propertyName,
            image: item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/600x400',
            rent: selectedType === 'vacation' ? `₹${item.ratePerDay}/day` : `₹${item.monthlyRent}/month`,
            phone: item.contactNumber,
            area: item.address ? item.address.split(',')[0] : '',
            location: [item.latitude || 19.0760, item.longitude || 72.8777],
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

        setProperties(mappedProperties);

        const uniqueCities = [...new Set(mappedProperties.map((p) => p.city).filter(Boolean))] as string[];
        setCities(uniqueCities);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [selectedType, filters]);

  useEffect(() => {
    if (selectedType !== 'pg') {
      setFilters({});
      setFilterError(null);
      setShowFilters(false);
    }
  }, [selectedType]);

  // ------------------ Favorite toggle (unchanged intentions) -----------------
  const toggleFavorite = async (propertyId: number | string) => {
    const property = properties.find((p) => p.id === propertyId);
    if (!property) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to favorite properties');
      return;
    }

    const newFavoriteStatus = !property.isFavorited;
    setProperties((prev) => prev.map((p) => (p.id === propertyId ? { ...p, isFavorited: newFavoriteStatus } : p)));

    try {
      const response = await fetch(`/api/properties/favorites/${propertyId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isFavorited: newFavoriteStatus, propertyType: property.type }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(`Failed to update favorite: ${response.status} - ${data.message}`);
    } catch (err) {
      setProperties((prev) => prev.map((p) => (p.id === propertyId ? { ...p, isFavorited: !newFavoriteStatus } : p)));
      setError(err instanceof Error ? err.message : 'Failed to update favorite');
    }
  };

  // ------------------ Click tracking preserved --------------------------------
  const handleClick = async (propertyId: number | string, propertyType: PropertyType) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.post(
        `/api/properties/actions/click/${propertyId}`,
        { propertyType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      // swallow - non-critical
    }
  };

  // ------------------ Filters helpers ----------------------------------------
  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilterError(null);
    setFilters((prev) => {
      let newFilters = { ...prev, [key]: value };
      if (key === 'rentMin' || key === 'rentMax') {
        const rentMin = key === 'rentMin' ? value : prev.rentMin;
        const rentMax = key === 'rentMax' ? value : prev.rentMax;
        const min = rentMin ? Number(rentMin) : undefined;
        const max = rentMax ? Number(rentMax) : undefined;
        if (min && (min <= 0 || isNaN(min))) {
          setFilterError('Minimum rent must be a positive number');
          newFilters.rentMin = undefined;
        }
        if (max && (max <= 0 || isNaN(max))) {
          setFilterError('Maximum rent must be a positive number');
          newFilters.rentMax = undefined;
        }
        if (min && max && min > max) {
          setFilterError('Minimum rent cannot be greater than maximum rent');
          newFilters.rentMin = undefined;
          newFilters.rentMax = undefined;
        }
      }
      return newFilters;
    });
  };

  const toggleAmenity = (amenity: string) => {
    setFilters((prev) => {
      const currentAmenities = prev.amenities || [];
      return {
        ...prev,
        amenities: currentAmenities.includes(amenity) ? currentAmenities.filter((a) => a !== amenity) : [...currentAmenities, amenity],
      };
    });
  };

  const toggleSharingOption = (option: string) => {
    setFilters((prev) => {
      const currentOptions = prev.sharingOptions || [];
      return {
        ...prev,
        sharingOptions: currentOptions.includes(option) ? currentOptions.filter((o) => o !== option) : [...currentOptions, option],
      };
    });
  };

  const clearFilters = () => {
    setFilters({});
    setFilterError(null);
  };

  const isApplyDisabled = !!filterError;

  // Map center computed from properties or fallback
  const center: [number, number] = properties.length > 0
    ? [properties.reduce((sum, p) => sum + p.location[0], 0) / properties.length, properties.reduce((sum, p) => sum + p.location[1], 0) / properties.length]
    : [19.0760, 72.8777];

  // ------------------ 3D scroll effect --------------------------------------
  useEffect(() => {
    const container = listRef.current;
    if (!container) return;

    const cards = () => Array.from(container.querySelectorAll('.property-card')) as HTMLElement[];

    function onScroll() {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const cardElems = cards();
        const viewportCenter = window.innerHeight / 2;
        cardElems.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.top + rect.height / 2;
          const distance = cardCenter - viewportCenter; // positive when below center
          const maxDist = window.innerHeight / 1.2;
          const ratio = Math.max(-1, Math.min(1, distance / maxDist));

          // compute transforms
          const rotateX = ratio * 8; // tilt
          const translateZ = -Math.abs(ratio) * 40; // depth
          const translateY = -ratio * 8; // small lift

          card.style.transform = `perspective(1200px) translateZ(${translateZ}px) translateY(${translateY}px) rotateX(${rotateX}deg)`;
          card.style.boxShadow = `${Math.abs(ratio) * 20}px ${Math.abs(ratio) * 12}px ${20 + Math.abs(ratio) * 20}px rgba(10,20,40,0.08)`;
        });
        tickingRef.current = false;
      });
    }

    // initial call
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [properties]);

  // small parallax for header background
  useEffect(() => {
    function onScroll() {
      const el = document.getElementById('hero-bg');
      if (!el) return;
      const scrolled = window.scrollY;
      el.style.transform = `translateY(${scrolled * -0.12}px)`;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div id="hero-bg" className="absolute inset-0 -z-10 transform-gpu transition-transform duration-300" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(14,165,233,0.06))' }} />
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Find beautiful places to stay — fast.</h1>
              <p className="mt-3 text-lg text-gray-600 max-w-xl">PGs, BHKs and Vacation homes — curated, verified and easy to book.</p>
              <div className="mt-6 flex items-center gap-4">
                <div className="rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-4 py-2 shadow-md">Instant Booking</div>
                <div className="rounded-full bg-white px-4 py-2 shadow-sm text-sm">Verified Listings</div>
              </div>
            </div>

            <div className="hidden md:block w-80 h-44 rounded-2xl bg-white shadow-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=60" alt="hero" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Category switcher */}
      <div className="container mx-auto px-6 -mt-8">
        <div className="relative bg-white rounded-full shadow-md p-1 max-w-lg mx-auto flex justify-between">
          {(['pg', 'bhk', 'vacation'] as PropertyType[]).map((t) => {
            const active = selectedType === t;
            return (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-all z-10 ${active ? 'text-white' : 'text-gray-600'}`}
                aria-pressed={active}
              >
                <span className="inline-flex items-center gap-2">
                  {t === 'pg' && <HomeIcon className="h-5 w-5" />}
                  {t === 'bhk' && <Building2 className="h-5 w-5" />}
                  {t === 'vacation' && <Palmtree className="h-5 w-5" />}
                  <span className="capitalize">{t}</span>
                </span>
              </button>
            );
          })}
          {/* animated active background */}
          <motion.div
            className={`absolute top-1 bottom-1 rounded-full bg-gradient-to-r ${categoryColors[selectedType]} shadow-md`}
            layout
            initial={false}
            animate={{ left: selectedType === 'pg' ? '0%' : selectedType === 'bhk' ? '33.33%' : '66.66%', width: '33.33%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{ zIndex: 1 }}
          />
        </div>
      </div>

      {/* Filters toggle & Filters panel */}
      <div className="container mx-auto px-6 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters((s) => !s)} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Sliders className="h-5 w-5" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
            <div className="text-sm text-gray-500">Showing <span className="font-medium">{properties.length}</span> results</div>
          </div>
          <div className="text-sm text-gray-500">Pro-level search & filtering</div>
        </div>

        {showFilters && (
          <div className="mt-4 bg-white rounded-lg shadow-sm p-6">
            {filterError && <div className="mb-4 text-red-500">{filterError}</div>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Rent (₹)</label>
                <input type="number" min="1" value={filters.rentMin || ''} onChange={(e) => handleFilterChange('rentMin', parseInt(e.target.value) || undefined)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2" placeholder="Min" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Rent (₹)</label>
                <input type="number" min="1" value={filters.rentMax || ''} onChange={(e) => handleFilterChange('rentMax', parseInt(e.target.value) || undefined)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2" placeholder="Max" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <select value={filters.city || ''} onChange={(e) => handleFilterChange('city', e.target.value || undefined)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2">
                  <option value="">All Cities</option>
                  {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>

              {/* dynamic fields per type */}
              {selectedType === 'pg' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sharing Options</label>
                    <div className="mt-2 space-y-2">
                      {sharingOptions.map((option) => (
                        <div key={option} className="flex items-center">
                          <input type="checkbox" checked={filters.sharingOptions?.includes(option) || false} onChange={() => toggleSharingOption(option)} className="h-4 w-4 text-blue-600" />
                          <label className="ml-2 text-sm text-gray-600">{option}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amenities</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {amenityLabels.pg.map((amenity) => (
                        <label key={amenity} className="inline-flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={filters.amenities?.includes(amenity) || false} onChange={() => toggleAmenity(amenity)} />
                          <span className="capitalize">{amenity.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedType === 'bhk' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                    <select value={filters.bedrooms || ''} onChange={(e) => handleFilterChange('bedrooms', parseInt(e.target.value) || undefined)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2">
                      <option value="">Any</option>
                      {[1, 2, 3, 4, 5].map((n) => (<option key={n} value={n}>{n}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                    <select value={filters.bathrooms || ''} onChange={(e) => handleFilterChange('bathrooms', parseInt(e.target.value) || undefined)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2">
                      <option value="">Any</option>
                      {[1, 2, 3, 4].map((n) => (<option key={n} value={n}>{n}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Min Sq.Ft</label>
                    <input type="number" min="1" value={filters.sqftMin || ''} onChange={(e) => handleFilterChange('sqftMin', parseInt(e.target.value) || undefined)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2" placeholder="Min sq.ft" />
                  </div>
                </>
              )}

              {selectedType === 'vacation' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Max Guests</label>
                    <select value={filters.maxGuests || ''} onChange={(e) => handleFilterChange('maxGuests', parseInt(e.target.value) || undefined)} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2">
                      <option value="">Any</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (<option key={n} value={n}>{n}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amenities</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {amenityLabels.vacation.map((amenity) => (
                        <label key={amenity} className="inline-flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={filters.amenities?.includes(amenity) || false} onChange={() => toggleAmenity(amenity)} />
                          <span className="capitalize">{amenity.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={clearFilters} className="px-4 py-2 bg-gray-100 rounded-md">Clear</button>
              <button onClick={() => setShowFilters(false)} disabled={isApplyDisabled} className={`px-4 py-2 rounded-md ${isApplyDisabled ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white'}`}>Apply</button>
            </div>
          </div>
        )}
      </div>

      {/* MAP + LIST */}
      <div className="container mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-16">Loading properties...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* MAP (left) */}
            <div className="col-span-1 lg:col-span-1 bg-white rounded-xl shadow-md overflow-hidden sticky top-24 h-[70vh]">
              <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }}>
                <TileLayer attribution='© OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <UserLocationMarker isLoggedIn={isLoggedIn} />
                {properties.map((property) => (
                  <Marker key={property.id} position={[property.location[0], property.location[1]]} icon={redIcon}>
                    <Popup>
                      <div className="w-56 p-2">
                        <img src={property.image} alt={property.name} className="w-full h-28 object-cover rounded-md mb-2" />
                        <h3 className="font-semibold text-base">{property.name}</h3>
                        <p className="text-sm font-semibold text-blue-600">{property.rent}</p>
                        <Link to={`/booking/${property.type}/${property.id}`} className="mt-2 inline-block bg-blue-300 text-black text-xs px-3 py-1 rounded-md" onClick={() => handleClick(property.id, property.type)}>View</Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* LIST (right) */}
            <div className="col-span-2" ref={listRef}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map((property) => (
                  <article key={property.id} className="property-card bg-white rounded-2xl overflow-hidden shadow-md transform transition-transform duration-300" onClick={() => handleClick(property.id, property.type)}>
                    <div className="relative h-48 overflow-hidden">
                      <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
                      <button onClick={(e) => { e.stopPropagation(); toggleFavorite(property.id); }} className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow"> 
                        <Heart className={`h-5 w-5 ${property.isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                      </button>
                    </div>
                    <div className="p-6 flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{property.name}</h3>
                          <p className="text-sm text-gray-500">{property.area} • {property.city}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{property.rent}</div>
                          <div className="text-xs text-gray-500">/ month</div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-3">{property.description}</p>

                      <div className="flex items-center gap-4 text-gray-600">
                        {property.beds && <div className="flex items-center gap-1"><Bed className="h-4 w-4" />{property.beds}</div>}
                        {property.baths && <div className="flex items-center gap-1"><Bath className="h-4 w-4" />{property.baths}</div>}
                        {property.sqft && <div className="flex items-center gap-1"><Square className="h-4 w-4" />{property.sqft} sqft</div>}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {property.amenities.map((amenity, idx) => (
                          <span key={idx} className="px-2 py-1 rounded-full text-xs bg-gradient-to-r from-blue-400 to-cyan-400 text-white flex items-center gap-2">{getAmenityIcon(amenity)}{amenity.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</span>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                          <Phone className="h-4 w-4" />{property.phone}
                        </div>

                        <div className="flex items-center gap-2">
                          <Link to={`/booking/${property.type}/${property.id}`} onClick={(e) => { e.stopPropagation(); handleClick(property.id, property.type); }} className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">View Details</Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-12">
                <Recommendations propertyType={selectedType} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className={`bg-gradient-to-r ${categoryColors[selectedType] || 'from-gray-600 to-gray-800'} text-white mt-16`}>
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-3">Gruha Anvesh</h3>
              <p className="text-white/80">Find your perfect living space with ease.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white/80">About Us</a></li>
                <li><a href="#" className="hover:text-white/80">Properties</a></li>
                <li><a href="#" className="hover:text-white/80">List Property</a></li>
                <li><a href="#" className="hover:text-white/80">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">Contact Us</h4>
              <ul className="space-y-2">
                <li className="flex items-center"><Phone className="h-4 w-4 mr-2" />+91 9876543210</li>
                <li className="flex items-center"><Mail className="h-4 w-4 mr-2" />sudhakarreddyvikram@gmail.com</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-white/80"><Instagram className="h-6 w-6" /></a>
                <a href="#" className="hover:text-white/80"><Facebook className="h-6 w-6" /></a>
                <a href="#" className="hover:text-white/80"><Twitter className="h-6 w-6" /></a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">© 2024 Gruha Anvesh. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
