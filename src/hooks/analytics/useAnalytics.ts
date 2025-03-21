
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook for tracking analytics events throughout the application
 * Provides functions for recording page views, artwork views, interactions, etc.
 */
export const useAnalytics = () => {
  const { user } = useAuth();
  
  /**
   * Records a view of an artwork
   * @param artworkId - The ID of the artwork being viewed
   * @param portfolioId - The ID of the portfolio the artwork belongs to
   */
  const trackArtworkView = async (artworkId: string, portfolioId: string) => {
    try {
      // Record basic view information
      const viewData = {
        artwork_id: artworkId,
        portfolio_id: portfolioId,
        user_id: user?.id || null, // Anonymous views are allowed
        event_type: 'view',
        event_metadata: {
          page: window.location.pathname,
          referrer: document.referrer,
          timestamp: new Date().toISOString()
        }
      };
      
      // Store analytics data in the console for now (this will be updated to DB storage)
      console.log('Analytics event tracked:', viewData);
      
      // In future implementations, this data will be stored in Supabase
      // await supabase.from('analytics_events').insert([viewData]);
    } catch (error) {
      console.error('Error tracking artwork view:', error);
    }
  };
  
  /**
   * Records a view of a portfolio
   * @param portfolioId - The ID of the portfolio being viewed
   */
  const trackPortfolioView = async (portfolioId: string) => {
    try {
      // Record basic view information
      const viewData = {
        portfolio_id: portfolioId,
        user_id: user?.id || null, // Anonymous views are allowed
        event_type: 'view',
        event_metadata: {
          page: window.location.pathname,
          referrer: document.referrer,
          timestamp: new Date().toISOString()
        }
      };
      
      // Store analytics data in the console for now
      console.log('Analytics event tracked:', viewData);
      
      // In future implementations, this data will be stored in Supabase
      // await supabase.from('analytics_events').insert([viewData]);
    } catch (error) {
      console.error('Error tracking portfolio view:', error);
    }
  };
  
  /**
   * Records a conversion event (e.g., purchase initiation, completion)
   * @param eventName - The name of the conversion event (e.g., 'purchase_initiated', 'purchase_completed')
   * @param metadata - Additional information about the event
   */
  const trackConversion = async (eventName: string, metadata: any) => {
    try {
      const eventData = {
        user_id: user?.id || null,
        event_type: 'conversion',
        event_name: eventName,
        event_metadata: {
          ...metadata,
          page: window.location.pathname,
          timestamp: new Date().toISOString()
        }
      };
      
      // Store analytics data in the console for now
      console.log('Conversion event tracked:', eventData);
      
      // In future implementations, this data will be stored in Supabase
      // await supabase.from('analytics_events').insert([eventData]);
    } catch (error) {
      console.error('Error tracking conversion event:', error);
    }
  };
  
  /**
   * Records a user interaction event (e.g., button click, form submission)
   * @param elementId - The ID or description of the element interacted with
   * @param eventName - The name of the interaction event
   * @param metadata - Additional information about the interaction
   */
  const trackInteraction = async (elementId: string, eventName: string, metadata: any = {}) => {
    try {
      const eventData = {
        user_id: user?.id || null,
        event_type: 'interaction',
        element_id: elementId,
        event_name: eventName,
        event_metadata: {
          ...metadata,
          page: window.location.pathname,
          timestamp: new Date().toISOString()
        }
      };
      
      // Store analytics data in the console for now
      console.log('Interaction event tracked:', eventData);
      
      // In future implementations, this data will be stored in Supabase
      // await supabase.from('analytics_events').insert([eventData]);
    } catch (error) {
      console.error('Error tracking interaction event:', error);
    }
  };
  
  return {
    trackArtworkView,
    trackPortfolioView,
    trackConversion,
    trackInteraction
  };
};
