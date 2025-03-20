import React, { useState, useEffect } from 'react';
import { autoPropertiesApi } from '@/services/api/auto-api.service';

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  total_units: number;
  organization_id: string;
  created_at?: string;
}

// Type for property creation (organization_id is added by the backend)
type PropertyCreate = Omit<Property, 'id' | 'organization_id' | 'created_at'>;

export default function AutoApiTest() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProperty, setNewProperty] = useState<PropertyCreate>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    total_units: 1
  });

  // Load properties on component mount
  useEffect(() => {
    fetchProperties();
  }, []);

  // Fetch properties from the auto-generated API
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await autoPropertiesApi.getAll();
      setProperties(result.data);
      console.log('Properties fetched:', result.data);
    } catch (err) {
      setError('Failed to fetch properties: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProperty(prev => ({
      ...prev,
      [name]: name === 'total_units' ? Number(value) : value
    }));
  };

  // Create a new property
  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const createdProperty = await autoPropertiesApi.create(newProperty);
      console.log('Property created:', createdProperty);
      
      // Reset form
      setNewProperty({
        name: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        total_units: 1
      });
      
      // Refresh properties list
      fetchProperties();
    } catch (err) {
      setError('Failed to create property: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Error creating property:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a property
  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    setLoading(true);
    setError(null);
    try {
      await autoPropertiesApi.delete(id);
      console.log('Property deleted:', id);
      
      // Refresh properties list
      fetchProperties();
    } catch (err) {
      setError('Failed to delete property: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Error deleting property:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Auto API Test - Properties</h1>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* Create Property Form */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4">Create New Property</h2>
        <form onSubmit={handleCreateProperty} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Property Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="name"
                name="name"
                type="text"
                placeholder="Property Name"
                value={newProperty.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                Address
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="address"
                name="address"
                type="text"
                placeholder="Address"
                value={newProperty.address}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="city">
                City
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="city"
                name="city"
                type="text"
                placeholder="City"
                value={newProperty.city}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="state">
                State
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="state"
                name="state"
                type="text"
                placeholder="State"
                value={newProperty.state}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="zip_code">
                ZIP Code
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="zip_code"
                name="zip_code"
                type="text"
                placeholder="ZIP Code"
                value={newProperty.zip_code}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="total_units">
                Total Units
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="total_units"
                name="total_units"
                type="number"
                min="1"
                placeholder="Total Units"
                value={newProperty.total_units}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-end">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Properties List */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <h2 className="text-xl font-semibold mb-4">Properties List</h2>
        {loading && <p>Loading properties...</p>}
        {!loading && properties.length === 0 && <p>No properties found.</p>}
        {!loading && properties.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-2 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="py-2 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    City
                  </th>
                  <th className="py-2 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    State
                  </th>
                  <th className="py-2 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ZIP
                  </th>
                  <th className="py-2 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="py-2 px-4 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="border-b border-gray-200">
                    <td className="py-2 px-4">{property.name}</td>
                    <td className="py-2 px-4">{property.address}</td>
                    <td className="py-2 px-4">{property.city}</td>
                    <td className="py-2 px-4">{property.state}</td>
                    <td className="py-2 px-4">{property.zip_code}</td>
                    <td className="py-2 px-4">{property.total_units}</td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => handleDeleteProperty(property.id)}
                        className="text-red-500 hover:text-red-700"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 