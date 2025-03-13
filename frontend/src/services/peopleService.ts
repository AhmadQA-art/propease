import { PersonType } from '../types/people';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export interface CreatePersonData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  type: PersonType;
  invitation_methods: {
    email: boolean;
    sms: boolean;
  };
  [key: string]: any;
}

export const peopleService = {
  async createPerson(data: CreatePersonData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Determine the endpoint based on person type
      const endpoint = `${API_BASE_URL}/people/${data.type}`;
      
      // Make the API call
      const response = await axios.post(endpoint, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error in createPerson:', error);
      throw error;
    }
  },

  async uploadDocuments(personId: string, files: File[]) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      files.forEach(file => {
        formData.append('documents', file);
      });

      const response = await axios.post(
        `${API_BASE_URL}/people/${personId}/documents`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error in uploadDocuments:', error);
      throw error;
    }
  },

  async sendInvitations(personId: string, methods: { email: boolean; sms: boolean }) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        `${API_BASE_URL}/people/${personId}/invitations`,
        { methods },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error in sendInvitations:', error);
      throw error;
    }
  }
}; 