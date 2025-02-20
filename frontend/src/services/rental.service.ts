import api from './api';
import { Property } from '../types/rental';

export const rentalService = {
  // Get all rentals for user's organization
  async getRentals() {
    const response = await api.get('/api/rentals');
    return response.data;
  },

  // Get rental by ID
  async getRentalById(id: string) {
    const response = await api.get(`/api/rentals/${id}`);
    return response.data;
  },

  // Create new rental
  async createRental(rental: Omit<Property, 'id'>) {
    const response = await api.post('/api/rentals', rental);
    return response.data;
  },

  // Update rental
  async updateRental(id: string, rental: Partial<Property>) {
    const response = await api.put(`/api/rentals/${id}`, rental);
    return response.data;
  },

  // Delete rental
  async deleteRental(id: string) {
    await api.delete(`/api/rentals/${id}`);
  }
}; 