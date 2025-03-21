
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useTransactionSimulator } from '@/hooks/admin/useTransactionSimulator';

interface Portfolio {
  id: string;
  name: string;
  user_id: string;
  profiles: {
    id: string;
    full_name: string;
    username: string;
  };
}

interface Artwork {
  id: string;
  title: string;
  price: number;
  currency: string;
  portfolio_id: string;
  portfolio?: Portfolio;
}

interface User {
  id: string;
  full_name: string;
  username: string;
}

const TransactionSimulator = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingArtworks, setLoadingArtworks] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  const [selectedArtwork, setSelectedArtwork] = useState<string>('');
  const [selectedBuyer, setSelectedBuyer] = useState<string>('');
  const [transactionType, setTransactionType] = useState<'success' | 'failed' | 'abandoned'>('success');
  const [notes, setNotes] = useState<string>('');
  
  const { simulateTransaction, isSimulating } = useTransactionSimulator();

  useEffect(() => {
    fetchArtworks();
    fetchUsers();
  }, []);

  const fetchArtworks = async () => {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select(`
          id, 
          title, 
          price, 
          currency, 
          portfolio_id,
          portfolios (
            id, 
            name, 
            user_id,
            profiles (id, full_name, username)
          )
        `)
        .eq('for_sale', true)
        .limit(50);

      if (error) throw error;
      setArtworks(data || []);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      toast.error('Failed to load artworks');
    } finally {
      setLoadingArtworks(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .not('admin_type', 'is', null) // Only load admin users for simulation
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedArtwork || !selectedBuyer) {
      toast.error('Please select an artwork and a buyer');
      return;
    }
    
    const artwork = artworks.find(a => a.id === selectedArtwork);
    if (!artwork) {
      toast.error('Invalid artwork selection');
      return;
    }
    
    try {
      const result = await simulateTransaction({
        artworkId: selectedArtwork,
        buyerId: selectedBuyer,
        transactionType,
        simulationNotes: notes,
        amount: artwork.price,
        currency: artwork.currency
      });
      
      if (result.success) {
        toast.success(`Transaction simulation completed successfully`);
        setNotes('');
      } else {
        toast.error('Simulation failed. See console for details.');
      }
    } catch (error) {
      console.error('Error in simulation:', error);
      toast.error('Simulation failed');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Simulator</CardTitle>
        <CardDescription>
          Simulate transactions to test the purchase flow without using real payment services.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="artwork">Artwork</Label>
              <Select
                value={selectedArtwork}
                onValueChange={setSelectedArtwork}
                disabled={loadingArtworks}
              >
                <SelectTrigger id="artwork">
                  <SelectValue placeholder="Select an artwork" />
                </SelectTrigger>
                <SelectContent>
                  {artworks.map((artwork) => (
                    <SelectItem key={artwork.id} value={artwork.id}>
                      {artwork.title} - {artwork.currency} {artwork.price} 
                      {artwork.portfolio && (
                        <span className="ml-2 text-muted-foreground">
                          by {artwork.portfolio.profiles?.full_name || artwork.portfolio.profiles?.username || 'Unknown Artist'}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingArtworks && <p className="text-sm text-muted-foreground mt-1">Loading artworks...</p>}
            </div>
            
            <div>
              <Label htmlFor="buyer">Buyer (Test User)</Label>
              <Select
                value={selectedBuyer}
                onValueChange={setSelectedBuyer}
                disabled={loadingUsers}
              >
                <SelectTrigger id="buyer">
                  <SelectValue placeholder="Select a test buyer" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.username || user.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingUsers && <p className="text-sm text-muted-foreground mt-1">Loading users...</p>}
            </div>
            
            <div>
              <Label>Transaction Type</Label>
              <RadioGroup
                value={transactionType}
                onValueChange={(value) => setTransactionType(value as 'success' | 'failed' | 'abandoned')}
                className="flex flex-col space-y-2 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="success" id="success" />
                  <Label htmlFor="success" className="cursor-pointer">Successful Purchase</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="failed" id="failed" />
                  <Label htmlFor="failed" className="cursor-pointer">Failed Payment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="abandoned" id="abandoned" />
                  <Label htmlFor="abandoned" className="cursor-pointer">Abandoned Checkout</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label htmlFor="notes">Simulation Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this simulation (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-20 resize-none"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSimulating || !selectedArtwork || !selectedBuyer}
          >
            {isSimulating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                Run Simulation
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionSimulator;
