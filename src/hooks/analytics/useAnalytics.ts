
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
      // Get browser and device information
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
      const deviceType = isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop');

      // Record basic view information
      const viewData = {
        artwork_id: artworkId,
        portfolio_id: portfolioId,
        user_id: user?.id || null, // Anonymous views are allowed
        event_type: 'view',
        event_metadata: {
          page: window.location.pathname,
          referrer: document.referrer,
          device: deviceType,
          timestamp: new Date().toISOString(),
          user_agent: userAgent
        }
      };
      
      console.log('Analytics event tracked:', viewData);
      
      // Store analytics data in Supabase
      const { error } = await supabase.from('analytics_events').insert([viewData]);
      
      if (error) {
        console.error('Error storing artwork view analytics:', error);
      }
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
      // Get browser and device information
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
      const deviceType = isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop');

      // Record basic view information
      const viewData = {
        portfolio_id: portfolioId,
        user_id: user?.id || null, // Anonymous views are allowed
        event_type: 'view',
        event_metadata: {
          page: window.location.pathname,
          referrer: document.referrer,
          device: deviceType,
          timestamp: new Date().toISOString(),
          user_agent: userAgent
        }
      };
      
      console.log('Analytics event tracked:', viewData);
      
      // Store analytics data in Supabase
      const { error } = await supabase.from('analytics_events').insert([viewData]);
      
      if (error) {
        console.error('Error storing portfolio view analytics:', error);
      }
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
      // Get browser and device information
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
      const deviceType = isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop');

      const eventData = {
        user_id: user?.id || null,
        event_type: 'conversion',
        event_name: eventName,
        event_metadata: {
          ...metadata,
          page: window.location.pathname,
          device: deviceType,
          timestamp: new Date().toISOString(),
          user_agent: userAgent
        }
      };
      
      console.log('Conversion event tracked:', eventData);
      
      // Store conversion data in Supabase
      const { error } = await supabase.from('analytics_events').insert([eventData]);
      
      if (error) {
        console.error('Error storing conversion analytics:', error);
      }
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
      // Get browser and device information
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
      const deviceType = isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop');

      const eventData = {
        user_id: user?.id || null,
        event_type: 'interaction',
        element_id: elementId,
        event_name: eventName,
        event_metadata: {
          ...metadata,
          page: window.location.pathname,
          device: deviceType,
          timestamp: new Date().toISOString(),
          user_agent: userAgent
        }
      };
      
      console.log('Interaction event tracked:', eventData);
      
      // Store interaction data in Supabase
      const { error } = await supabase.from('analytics_events').insert([eventData]);
      
      if (error) {
        console.error('Error storing interaction analytics:', error);
      }
    } catch (error) {
      console.error('Error tracking interaction event:', error);
    }
  };

  /**
   * Records when a checkout process is started
   * @param artworkId - The ID of the artwork being purchased
   * @param price - The price of the artwork
   * @param currency - The currency of the price
   */
  const trackCheckoutStart = async (artworkId: string, price: number, currency: string) => {
    try {
      await trackConversion('checkout_started', {
        artwork_id: artworkId,
        price,
        currency
      });
    } catch (error) {
      console.error('Error tracking checkout start:', error);
    }
  };

  /**
   * Records when a purchase is completed
   * @param orderId - The ID of the completed order
   * @param artworkId - The ID of the artwork purchased
   * @param price - The price paid
   * @param currency - The currency of the payment
   */
  const trackPurchaseComplete = async (orderId: string, artworkId: string, price: number, currency: string) => {
    try {
      await trackConversion('purchase_completed', {
        order_id: orderId,
        artwork_id: artworkId,
        price,
        currency
      });
    } catch (error) {
      console.error('Error tracking purchase completion:', error);
    }
  };
  
  return {
    trackArtworkView,
    trackPortfolioView,
    trackConversion,
    trackInteraction,
    trackCheckoutStart,
    trackPurchaseComplete
  };
};
