
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Loader2, CheckCircle, XCircle, AlertTriangle, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useTransactionSimulator } from '@/hooks/admin/useTransactionSimulator';

type ArtworkOption = {
  id: string;
  title: string;
  price: number;
  currency: string;
  portfolio_id: string;
  artist_name: string;
  image_url: string;
};

const TransactionSimulator = () => {
  const { user } = useAuth();
  const { simulateTransaction, isSimulating } = useTransactionSimulator();
  const [artworks, setArtworks] = useState<ArtworkOption[]>([]);
  const [users, setUsers] = useState<{id: string, email: string, name: string}[]>([]);
  const [loadingArtworks, setLoadingArtworks] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Setup react-hook-form
  const form = useForm({
    defaultValues: {
      artworkId: '',
      buyerId: '',
      transactionType: 'success',
      simulationNotes: '',
    }
  });

  // Fetch available artworks for simulation
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const { data, error } = await supabase
          .from('artworks')
          .select(`
            id,
            title,
            price,
            currency,
            image_url,
            portfolio_id,
            portfolios:portfolio_id (
              name,
              user_id,
              profiles:user_id (
                full_name,
                username
              )
            )
          `)
          .eq('for_sale', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedArtworks = (data || []).map(artwork => ({
          id: artwork.id,
          title: artwork.title,
          price: artwork.price || 0,
          currency: artwork.currency || 'USD',
          portfolio_id: artwork.portfolio_id,
          artist_name: artwork.portfolios?.profiles?.full_name || 
                      artwork.portfolios?.profiles?.username || 
                      'Unknown Artist',
          image_url: artwork.image_url
        }));

        setArtworks(formattedArtworks);
      } catch (error) {
        console.error('Error fetching artworks:', error);
        toast.error('Failed to load artworks for simulation');
      } finally {
        setLoadingArtworks(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .not('id', 'eq', user?.id);

        if (error) throw error;

        const formattedUsers = (data || []).map(profile => ({
          id: profile.id,
          name: profile.full_name || profile.username || 'Anonymous User',
          email: 'user@example.com' // Email data not available in profiles
        }));

        setUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users for simulation');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchArtworks();
    fetchUsers();
  }, [user?.id]);

  const onSubmit = async (data: any) => {
    try {
      // Find the selected artwork to include in simulation
      const selectedArtwork = artworks.find(artwork => artwork.id === data.artworkId);
      if (!selectedArtwork) {
        toast.error('Please select a valid artwork');
        return;
      }

      // Run the simulation
      await simulateTransaction({
        artworkId: data.artworkId,
        buyerId: data.buyerId,
        transactionType: data.transactionType,
        simulationNotes: data.simulationNotes,
        amount: selectedArtwork.price,
        currency: selectedArtwork.currency
      });

      // Reset form after successful simulation
      form.reset({
        artworkId: '',
        buyerId: '',
        transactionType: 'success',
        simulationNotes: ''
      });

    } catch (error) {
      console.error('Error in transaction simulation:', error);
      toast.error('Failed to simulate transaction');
    }
  };

  // Select the first artwork and user when loaded
  useEffect(() => {
    if (artworks.length > 0 && form.getValues('artworkId') === '') {
      form.setValue('artworkId', artworks[0].id);
    }
    
    if (users.length > 0 && form.getValues('buyerId') === '') {
      form.setValue('buyerId', users[0].id);
    }
  }, [artworks, users, form]);

  // Get the selected artwork for preview
  const selectedArtworkId = form.watch('artworkId');
  const selectedArtwork = artworks.find(a => a.id === selectedArtworkId);
  
  // Get the selected user for display
  const selectedUserId = form.watch('buyerId');
  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transaction Simulator</CardTitle>
          <CardDescription>
            Create simulated transactions to test purchase flows without processing real payments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(loadingArtworks || loadingUsers) ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Simulation Form - 3 columns */}
              <div className="md:col-span-3">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="artworkId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Artwork</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an artwork" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {artworks.map(artwork => (
                                <SelectItem key={artwork.id} value={artwork.id}>
                                  {artwork.title} - {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: artwork.currency
                                  }).format(artwork.price)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="buyerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Buyer</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a user" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users.map(user => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="transactionType"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel>Transaction Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="success" id="success" />
                                <label htmlFor="success" className="flex items-center cursor-pointer">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  <span>Successful Payment</span>
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="failed" id="failed" />
                                <label htmlFor="failed" className="flex items-center cursor-pointer">
                                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                                  <span>Failed Payment</span>
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="abandoned" id="abandoned" />
                                <label htmlFor="abandoned" className="flex items-center cursor-pointer">
                                  <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                                  <span>Abandoned Checkout</span>
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="simulationNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Simulation Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add any notes for this simulation (optional)"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            These notes will be stored with the simulated transaction for reference.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSimulating}>
                      {isSimulating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Simulating...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Run Simulation
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>

              {/* Preview Section - 2 columns */}
              <div className="md:col-span-2">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-sm text-muted-foreground mb-3">Simulation Preview</h3>
                  
                  {selectedArtwork && (
                    <div className="space-y-4">
                      <div className="aspect-square w-full overflow-hidden rounded-md bg-muted">
                        <img 
                          src={selectedArtwork.image_url || "/placeholder.svg"} 
                          alt={selectedArtwork.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      
                      <div>
                        <h4 className="font-medium">{selectedArtwork.title}</h4>
                        <p className="text-sm text-muted-foreground">By {selectedArtwork.artist_name}</p>
                        <p className="font-medium mt-1">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: selectedArtwork.currency
                          }).format(selectedArtwork.price)}
                        </p>
                      </div>
                      
                      {selectedUser && (
                        <div className="border-t pt-3 mt-3">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Buyer: </span> 
                            <span className="font-medium">{selectedUser.name}</span>
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Transaction: </span>
                            <span className="inline-flex items-center mt-1">
                              {form.watch('transactionType') === 'success' && (
                                <><CheckCircle className="h-3 w-3 text-green-500 mr-1" /> Successful</>
                              )}
                              {form.watch('transactionType') === 'failed' && (
                                <><XCircle className="h-3 w-3 text-red-500 mr-1" /> Failed</>
                              )}
                              {form.watch('transactionType') === 'abandoned' && (
                                <><AlertTriangle className="h-3 w-3 text-amber-500 mr-1" /> Abandoned</>
                              )}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!selectedArtwork && (
                    <div className="py-6 text-center text-muted-foreground">
                      <p>Select an artwork to preview</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionSimulator;
