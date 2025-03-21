
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAnalytics } from '@/hooks/analytics';

export type SimulationParams = {
  artworkId: string;
  buyerId: string;
  transactionType: 'success' | 'failed' | 'abandoned';
  simulationNotes?: string;
  amount: number;
  currency: string;
};

export const useTransactionSimulator = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const { trackPurchaseComplete } = useAnalytics();

  const simulateTransaction = async (params: SimulationParams) => {
    setIsSimulating(true);
    try {
      // Prepare metadata for simulation
      const metadata = {
        transaction_type: params.transactionType,
        simulation_notes: params.simulationNotes || '',
        simulated_by: (await supabase.auth.getSession()).data.session?.user.id,
        simulation_date: new Date().toISOString(),
      };

      // Determine the status based on transaction type
      let status: string;
      switch (params.transactionType) {
        case 'success':
          status = 'completed';
          break;
        case 'failed':
          status = 'failed';
          break;
        case 'abandoned':
          status = 'pending';
          break;
        default:
          status = 'pending';
      }

      // Create a simulated order in the database
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          buyer_id: params.buyerId,
          artwork_id: params.artworkId,
          amount: params.amount,
          currency: params.currency,
          status: status,
          metadata: metadata,
          is_simulation: true, // Mark as a simulation
          stripe_session_id: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` // Generate fake session ID
        })
        .select('id')
        .single();

      if (error) throw error;

      // If this is a successful transaction simulation, track it in analytics
      if (params.transactionType === 'success') {
        await trackPurchaseComplete(
          order.id,
          params.artworkId,
          params.amount,
          params.currency
        );

        // If the transaction is successful, update the artwork inventory
        // This would actually handle marking items as sold out if needed
        // For now, we'll just log this action
        console.log(`Simulation: Updated inventory for artwork ${params.artworkId}`);
      }

      // Handle different outcomes based on transaction type
      let message = '';
      switch (params.transactionType) {
        case 'success':
          message = 'Successful purchase simulation completed';
          break;
        case 'failed':
          message = 'Failed payment simulation completed';
          break;
        case 'abandoned':
          message = 'Abandoned checkout simulation completed';
          break;
      }

      toast.success(message);
      return { success: true, orderId: order.id };
    } catch (error) {
      console.error('Error in transaction simulation:', error);
      toast.error('Failed to simulate transaction');
      return { success: false, error };
    } finally {
      setIsSimulating(false);
    }
  };

  return {
    simulateTransaction,
    isSimulating
  };
};
