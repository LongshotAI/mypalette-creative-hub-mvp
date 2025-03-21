import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Artwork, ProfileData, PortfolioData } from '@/types/portfolio';

interface TransactionFormData {
  buyer_id: string;
  artwork_id: string;
  amount: number;
  currency: string;
  status: string;
}

const TransactionSimulator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<TransactionFormData>({
    buyer_id: '',
    artwork_id: '',
    amount: 100,
    currency: 'USD',
    status: 'completed',
  });
  const [users, setUsers] = useState<any[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingArtworks, setLoadingArtworks] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, username, email');

        if (error) {
          console.error('Error fetching users:', error);
          toast({
            title: "Error",
            description: "Failed to load users.",
            variant: "destructive",
          })
        }

        setUsers(data || []);
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchArtworks = async () => {
      setLoadingArtworks(true);
      try {
        const { data, error } = await supabase
          .from('artworks')
          .select(`
            id, title, description, price, currency, for_sale, portfolio_id, image_url, created_at,
            portfolios:portfolio_id(id, name, user_id, profiles(id, full_name, username))
          `);

        if (error) {
          console.error('Error fetching artworks:', error);
          toast({
            title: "Error",
            description: "Failed to load artworks.",
            variant: "destructive",
          });
          return;
        }

        console.log('Fetched artwork data:', data);

        const formattedArtworks: Artwork[] = (data || []).map(item => {
          let portfolioData: PortfolioData | null = null;
          
          if (item.portfolios) {
            portfolioData = {
              id: item.portfolios.id,
              name: item.portfolios.name,
              user_id: item.portfolios.user_id
            };
            
            if (item.portfolios.profiles) {
              const profileInfo = Array.isArray(item.portfolios.profiles) 
                ? item.portfolios.profiles[0] 
                : item.portfolios.profiles;
                
              portfolioData.profiles = {
                id: profileInfo?.id,
                full_name: profileInfo?.full_name,
                username: profileInfo?.username
              };
            }
          }
            
          return {
            id: item.id,
            title: item.title,
            description: item.description || "",
            image_url: item.image_url,
            price: item.price,
            currency: item.currency || "USD",
            for_sale: item.for_sale || false,
            portfolio_id: item.portfolio_id,
            created_at: item.created_at || new Date().toISOString(),
            portfolios: portfolioData,
            portfolio: portfolioData
          };
        });

        setArtworks(formattedArtworks);
      } finally {
        setLoadingArtworks(false);
      }
    };

    fetchUsers();
    fetchArtworks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            buyer_id: formData.buyer_id,
            artwork_id: formData.artwork_id,
            amount: formData.amount,
            currency: formData.currency,
            status: formData.status,
            stripe_session_id: 'simulator',
          },
        ]);

      if (error) {
        console.error('Error creating transaction:', error);
        toast({
          title: "Error",
          description: "Failed to create transaction.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Transaction created successfully.",
        })
        setFormData({
          ...formData,
          amount: 100,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderUserSelection = () => (
    <div className="space-y-2">
      <Label htmlFor="buyer">Select Buyer</Label>
      <Select
        value={formData.buyer_id}
        onValueChange={(value) => setFormData({ ...formData, buyer_id: value })}
      >
        <SelectTrigger id="buyer">
          <SelectValue placeholder="Select a buyer..." />
        </SelectTrigger>
        <SelectContent>
          {loadingUsers ? (
            <div className="p-2 text-center">
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              <p className="text-xs mt-1">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-2 text-center">
              <p className="text-xs">No users available</p>
            </div>
          ) : (
            users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.full_name || user.username || user.email}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );

  const renderArtworkSelection = () => (
    <div className="space-y-2">
      <Label htmlFor="artwork">Select Artwork</Label>
      <Select
        value={formData.artwork_id}
        onValueChange={(value) => setFormData({ ...formData, artwork_id: value })}
      >
        <SelectTrigger id="artwork">
          <SelectValue placeholder="Select an artwork..." />
        </SelectTrigger>
        <SelectContent>
          {loadingArtworks ? (
            <div className="p-2 text-center">
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              <p className="text-xs mt-1">Loading artworks...</p>
            </div>
          ) : artworks.length === 0 ? (
            <div className="p-2 text-center">
              <p className="text-xs">No artworks available</p>
            </div>
          ) : (
            artworks.map((artwork) => {
              const portfolioInfo = artwork.portfolios;
              const artistName = portfolioInfo?.profiles 
                ? (typeof portfolioInfo.profiles === 'object' && 'full_name' in portfolioInfo.profiles 
                   ? portfolioInfo.profiles.full_name || portfolioInfo.profiles.username 
                   : 'Unknown Artist')
                : 'Unknown Artist';
                
              return (
                <SelectItem key={artwork.id} value={artwork.id}>
                  {artwork.title} - {artwork.currency} {artwork.price} 
                  <span className="ml-2 text-muted-foreground">
                    by {artistName}
                  </span>
                </SelectItem>
              );
            })
          )}
        </SelectContent>
      </Select>
    </div>
  );

  const renderAmountInput = () => (
    <div className="space-y-2">
      <Label htmlFor="amount">Amount</Label>
      <Input
        type="number"
        id="amount"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
      />
    </div>
  );

  const renderCurrencySelection = () => (
    <div className="space-y-2">
      <Label htmlFor="currency">Currency</Label>
      <Select
        value={formData.currency}
        onValueChange={(value) => setFormData({ ...formData, currency: value })}
      >
        <SelectTrigger id="currency">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="USD">USD</SelectItem>
          <SelectItem value="EUR">EUR</SelectItem>
          <SelectItem value="GBP">GBP</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const renderStatusSelection = () => (
    <div className="space-y-2">
      <Label htmlFor="status">Status</Label>
      <Select
        value={formData.status}
        onValueChange={(value) => setFormData({ ...formData, status: value })}
      >
        <SelectTrigger id="status">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Simulator</CardTitle>
        <CardDescription>Create simulated transactions for testing purposes</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderUserSelection()}
          {renderArtworkSelection()}
          {renderAmountInput()}
          {renderCurrencySelection()}
          {renderStatusSelection()}
          <Button disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Transaction'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionSimulator;
