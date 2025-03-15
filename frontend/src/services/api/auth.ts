import { supabase } from '../supabase/client';
import axios from 'axios';
import { EmailOtpType } from '@supabase/supabase-js';
import type { User } from '../supabase/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const authApi = {
  async signUp(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    if (error) throw error;
  },
  
  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    if (error) throw error;
  },
  
  async verifyToken(tokenHash: string, type: EmailOtpType) {
    try {
      // First try direct Supabase verification
      const { data: supabaseData, error: supabaseError } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash,
      });
      
      if (!supabaseError) {
        return { success: true };
      }
      
      // If Supabase direct verification fails, try our backend API
      console.log('Supabase direct verification failed, trying backend API');
      const response = await axios.post(`${API_URL}/auth/verify-token`, {
        token_hash: tokenHash,
        type,
      });
      
      return response.data;
    } catch (error) {
      console.error('Token verification failed', error);
      throw error;
    }
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data as User;
  },
};
