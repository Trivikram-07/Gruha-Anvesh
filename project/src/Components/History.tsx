import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Edit, Trash2 } from 'lucide-react';

interface Property {
  _id: string;
  propertyName: string;
  images: string[];
  type: 'pg' | 'bhk' | 'vacation';
  contactNumber: string;
  address: string;
  monthlyRent?: number;
  ratePerDay?: number;
  description: string;
  sharingOptions?: { single: boolean; twoSharing: boolean; threeSharing: boolean; fourSharing: boolean };
  amenities?: Record<string, boolean>;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  maxGuests?: number;
  latitude?: number;
  longitude?: number;
}

const History: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [deletedProperties, setDeletedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'pg' | 'bhk' | 'vacation' | null>('pg');
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editForm, setEditForm] = useState<Partial<Property>>({});

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    console.log('Fetching properties with Token:', token);

    if (!token) {
      setError('No authentication token found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      console.log('Sending requests to:', '/api/properties/management/my-properties', '/api/properties/management/my-properties/deleted');

      const [activeRes, deletedRes] = await Promise.all([
        fetch('/api/properties/management/my-properties', { headers }),
        fetch('/api/properties/management/my-properties/deleted', { headers }),
      ]);

      console.log('Active response status:', activeRes.status, activeRes.statusText);
      console.log('Deleted response status:', deletedRes.status, deletedRes.statusText);

      const activeContentType = activeRes.headers.get('content-type');
      const deletedContentType = deletedRes.headers.get('content-type');
      if (!activeContentType?.includes('application/json') || !deletedContentType?.includes('application/json')) {
        const activeText = await activeRes.text();
        const deletedText = await deletedRes.text();
        console.error('Non-JSON response:', { activeText: activeText.slice(0, 100), deletedText: deletedText.slice(0, 100) });
        throw new Error('Server returned invalid response (not JSON)');
      }

      if (!activeRes.ok) {
        const errorData = await activeRes.json();
        throw new Error(`Failed to fetch active properties: ${errorData.message || activeRes.statusText}`);
      }
      if (!deletedRes.ok) {
        const errorData = await deletedRes.json();
        throw new Error(`Failed to fetch deleted properties: ${errorData.message || deletedRes.statusText}`);
      }

      const activeData = await activeRes.json();
      const deletedData = await deletedRes.json();
      console.log('Fetched active properties:', activeData);
      console.log('Fetched deleted properties:', deletedData);
      setProperties(Array.isArray(activeData) ? activeData : []);
      setDeletedProperties(Array.isArray(deletedData) ? deletedData : []);
    } catch (err) {
      console.error('Fetch properties error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filteredProperties = selectedType
    ? (showDeleted ? deletedProperties : properties).filter((property) => property.type === selectedType)
    : [];

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setEditForm({
      propertyName: property.propertyName,
      contactNumber: property.contactNumber,
      address: property.address,
      monthlyRent: property.monthlyRent,
      ratePerDay: property.ratePerDay,
      description: property.description,
      sharingOptions: property.sharingOptions ? { ...property.sharingOptions } : undefined,
      amenities: property.amenities ? { ...property.amenities } : undefined,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareFeet: property.squareFeet,
      maxGuests: property.maxGuests,
      latitude: property.latitude,
      longitude: property.longitude,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProperty) return;
    const token = localStorage.getItem('token');
    console.log('Saving edit for property:', editingProperty._id, 'with Token:', token);
    if (!token) {
      setError('No authentication token found. Please log in.');
      return;
    }
    try {
      const response = await fetch(`/api/properties/management/${editingProperty.type}/${editingProperty._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });
      console.log('Edit response status:', response.status, response.statusText);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }
      const updatedProperty = await response.json();
      console.log('Updated property:', updatedProperty);
      setProperties((prev) =>
        prev.map((p) => (p._id === updatedProperty._id ? { ...p, ...updatedProperty } : p))
      );
      setEditingProperty(null);
      setError(null);
    } catch (err) {
      console.error('Edit error:', err);
      setError(err instanceof Error ? err.message : 'Edit failed');
    }
  };

  const handleDelete = async (type: string, propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) {
      console.log('Deletion cancelled by user');
      return;
    }
    const token = localStorage.getItem('token');
    console.log('Delete attempt:', { type, propertyId, properties: properties.map(p => p._id) });
    if (!token) {
      setError('No authentication token found. Please log in.');
      console.log('No token for deletion');
      return;
    }
    try {
      const response = await fetch(`/api/properties/management/${type}/${propertyId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Read body once
      const bodyText = await response.text();
      console.log('Delete response:', { status: response.status, body: bodyText });

      // Check content-type and parse JSON if applicable
      const contentType = response.headers.get('content-type');
      let data;
      if (contentType?.includes('application/json')) {
        try {
          data = JSON.parse(bodyText);
        } catch (e) {
          console.error('Failed to parse JSON:', bodyText);
          throw new Error('Invalid JSON response from server');
        }
      } else {
        console.error('Non-JSON delete response:', bodyText.slice(0, 100));
        throw new Error('Server returned non-JSON response');
      }

      if (!response.ok) {
        console.error('Delete error response:', data);
        throw new Error(`Failed to delete property: ${data.message || response.statusText}`);
      }

      console.log('Delete response data:', data);

      // Update state
      setProperties((prev) => {
        const updated = prev.filter((p) => p._id !== propertyId);
        console.log('Updated properties:', updated.map(p => p._id));
        return updated;
      });

      // Fetch updated deleted properties
      const deletedRes = await fetch('/api/properties/management/my-properties/deleted', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      console.log('Deleted fetch status:', deletedRes.status);
      if (deletedRes.ok) {
        const deletedData = await deletedRes.json();
        console.log('Fetched deleted properties:', deletedData);
        setDeletedProperties(Array.isArray(deletedData) ? deletedData : []);
      } else {
        console.error('Failed to fetch deleted properties:', await deletedRes.text());
      }

      console.log('Property deleted successfully:', propertyId);
      setError(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete property');
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (error) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-md text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchProperties}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Upload History</h1>
          <div className="flex justify-between mb-6">
            <div className="flex space-x-3">
              {['pg', 'bhk', 'vacation'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as 'pg' | 'bhk' | 'vacation')}
                  className={`px-5 py-2 rounded-full font-medium transition-all duration-200 ${
                    selectedType === type
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {type === 'pg' ? 'PGs' : type === 'bhk' ? 'BHKs' : 'Vacation Spots'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className="px-5 py-2 rounded-full font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-200"
            >
              {showDeleted ? 'Show Active' : 'Show Deleted'}
            </button>
          </div>
          {properties.length === 0 && !showDeleted ? (
            <p className="text-gray-500 text-center py-4">No properties uploaded yet.</p>
          ) : deletedProperties.length === 0 && showDeleted ? (
            <p className="text-gray-500 text-center py-4">No deleted properties yet.</p>
          ) : filteredProperties.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No {showDeleted ? 'deleted' : 'active'} {selectedType === 'pg' ? 'PGs' : selectedType === 'bhk' ? 'BHKs' : 'Vacation Spots'} found.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProperties.map((property) => (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 relative"
                >
                  <img
                    src={property.images[0] || 'https://placehold.co/300'}
                    alt={property.propertyName}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    onError={(e) => (e.currentTarget.src = 'https://placehold.co/300')}
                  />
                  <h2 className="text-xl font-semibold text-gray-800">{property.propertyName}</h2>
                  <p className="text-sm text-gray-600">Type: {property.type.toUpperCase()}</p>
                  <p className="text-sm text-gray-600">
                    {property.type === 'vacation' ? `Rate: ₹${property.ratePerDay}/day` : `Rent: ₹${property.monthlyRent}/month`}
                  </p>
                  <p className="text-sm text-gray-600">Address: {property.address}</p>
                  {!showDeleted && (
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button
                        onClick={() => handleEdit(property)}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(property.type, property._id)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
          {editingProperty && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 p-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit {editingProperty.propertyName}</h2>

                <section className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Property Name</h3>
                  <input
                    type="text"
                    value={editForm.propertyName || ''}
                    onChange={(e) => setEditForm({ ...editForm, propertyName: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Property Name"
                  />
                </section>

                <section className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Phone Number</h3>
                  <input
                    type="text"
                    value={editForm.contactNumber || ''}
                    onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Contact Number"
                  />
                </section>

                <section className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Address</h3>
                  <input
                    type="text"
                    value={editForm.address || ''}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Address"
                  />
                </section>

                <section className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Description"
                    rows={3}
                  />
                </section>

                <section className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Rent & Pricing</h3>
                  {editingProperty.type !== 'vacation' ? (
                    <input
                      type="number"
                      value={editForm.monthlyRent || ''}
                      onChange={(e) => setEditForm({ ...editForm, monthlyRent: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Monthly Rent"
                    />
                  ) : (
                    <input
                      type="number"
                      value={editForm.ratePerDay || ''}
                      onChange={(e) => setEditForm({ ...editForm, ratePerDay: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Rate Per Day"
                    />
                  )}
                </section>

                {editingProperty.type === 'pg' && (
                  <section className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Sharing Options</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['single', 'twoSharing', 'threeSharing', 'fourSharing'].map((option) => (
                        <label key={option} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={editForm.sharingOptions?.[option as keyof Property['sharingOptions']] || false}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              sharingOptions: {
                                single: editForm.sharingOptions?.single || false,
                                twoSharing: editForm.sharingOptions?.twoSharing || false,
                                threeSharing: editForm.sharingOptions?.threeSharing || false,
                                fourSharing: editForm.sharingOptions?.fourSharing || false,
                                [option]: e.target.checked,
                              },
                            })}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{option.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</span>
                        </label>
                      ))}
                    </div>
                  </section>
                )}

                <section className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Amenities</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(editingProperty.amenities || {}).map(([key, value]) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editForm.amenities?.[key] || false}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            amenities: { ...editForm.amenities, [key]: e.target.checked },
                          })}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</span>
                      </label>
                    ))}
                  </div>
                </section>

                {editingProperty.type === 'bhk' && (
                  <section className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">BHK Specs</h3>
                    <div className="space-y-4">
                      <input
                        type="number"
                        value={editForm.bedrooms || ''}
                        onChange={(e) => setEditForm({ ...editForm, bedrooms: Number(e.target.value) })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Bedrooms"
                      />
                      <input
                        type="number"
                        value={editForm.bathrooms || ''}
                        onChange={(e) => setEditForm({ ...editForm, bathrooms: Number(e.target.value) })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Bathrooms"
                      />
                      <input
                        type="number"
                        value={editForm.squareFeet || ''}
                        onChange={(e) => setEditForm({ ...editForm, squareFeet: Number(e.target.value) })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Square Feet"
                      />
                    </div>
                  </section>
                )}

                {editingProperty.type === 'vacation' && (
                  <section className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Vacation Specs</h3>
                    <input
                      type="number"
                      value={editForm.maxGuests || ''}
                      onChange={(e) => setEditForm({ ...editForm, maxGuests: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Max Guests"
                    />
                  </section>
                )}

                <section className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Latitude & Longitude</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      value={editForm.latitude || ''}
                      onChange={(e) => setEditForm({ ...editForm, latitude: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Latitude"
                    />
                    <input
                      type="number"
                      value={editForm.longitude || ''}
                      onChange={(e) => setEditForm({ ...editForm, longitude: Number(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Longitude"
                    />
                  </div>
                </section>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleSaveEdit}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingProperty(null)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default History;