'use client';

import { useState, useEffect } from 'react';
import { CreatorProfile, StoredCreators } from '@/types/creator';

const STORAGE_KEY = 'web3coffee_creators';

export const useCreators = () => {
  const [creators, setCreators] = useState<StoredCreators>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load creators from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCreators(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load creators:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save creator profile
  const saveCreator = (profile: CreatorProfile) => {
    try {
      const updated = {
        ...creators,
        [profile.address.toLowerCase()]: profile
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setCreators(updated);
      return true;
    } catch (error) {
      console.error('Failed to save creator:', error);
      return false;
    }
  };

  // Get creator by address
  const getCreator = (address: string): CreatorProfile | null => {
    return creators[address.toLowerCase()] || null;
  };

  // Get all creators as array
  const getCreatorsList = (): CreatorProfile[] => {
    return Object.values(creators).sort((a, b) => b.createdAt - a.createdAt);
  };

  // Check if address is registered
  const isRegistered = (address: string): boolean => {
    return !!creators[address.toLowerCase()];
  };

  return {
    creators,
    isLoading,
    saveCreator,
    getCreator,
    getCreatorsList,
    isRegistered
  };
};
