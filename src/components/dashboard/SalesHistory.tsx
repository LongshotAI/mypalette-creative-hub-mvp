
import React, { useEffect, useState } from 'react';
import { useArtworkPurchase } from '@/hooks/purchase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderStatus, Order } from '@/types/portfolio';
import { useAuth } from '@/contexts/AuthContext';

const SalesHistory = () => {
  const { user } = useAuth();
  const { loadOrderHistory } = useArtworkPurchase();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');
  
  useEffect(() => {
    fetchSales(selectedStatus);
  }, [user]);
  
  const fetchSales = async (status: OrderStatus) => {
    setLoading(true);
    setSelectedStatus(status);
    
    try {
      // We need to fetch seller orders here, but using loadOrderHistory for now
      // This would need a proper implementation in the useArtworkPurchase hook
      const result = await loadOrderHistory(status);
      
      // Ensure the result matches the Order type
      const typedOrders: Order[] = result.map((order: any) => ({
        id: order.id,
        buyer_id: order.buyer_id,
        artwork_id: order.artwork_id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        created_at: order.created_at,
        stripe_session_id: order.stripe_session_id,
        seller_notified: order.seller_notified,
        artworks: order.artworks ? {
          id: order.artworks.id,
          title: order.artworks.title,
          description: order.artworks.description || "",
          image_url: order.artworks.image_url,
          price: order.artworks.price || 0,
          currency: order.artworks.currency || "USD",
          for_sale: order.artworks.for_sale || false,
          portfolio_id: order.artworks.portfolio_id,
          created_at: order.artworks.created_at || order.created_at,
          portfolios: order.artworks.portfolios ? {
            id: order.artworks.portfolios.id,
            name: order.artworks.portfolios.name,
            user_id: order.artworks.portfolios.user_id,
            profiles: order.artworks.portfolios.profiles ? {
              id: order.artworks.portfolios.profiles.id,
              username: order.artworks.portfolios.profiles.username,
              full_name: order.artworks.portfolios.profiles.full_name
            } : undefined
          } : undefined
        } : undefined
      }));
      
      setOrders(typedOrders);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (value: string) => {
    fetchSales(value as OrderStatus);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="mr-1 h-4 w-4" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="mr-1 h-4 w-4" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            <AlertTriangle className="mr-1 h-4 w-4" />
            Unknown
          </Badge>
        );
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales History</CardTitle>
        <Tabs 
          defaultValue="all" 
          value={selectedStatus}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">You haven't sold any artwork yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded">
                      <img
                        src={order.artworks?.image_url || '/placeholder.svg'}
                        alt={order.artworks?.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{order.artworks?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Purchased by {order.artworks?.portfolios?.profiles?.full_name || order.artworks?.portfolios?.profiles?.username || 'Anonymous'}
                      </p>
                      <p className="text-sm mt-1">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: order.currency,
                        }).format(order.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    {getStatusColor(order.status)}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesHistory;
