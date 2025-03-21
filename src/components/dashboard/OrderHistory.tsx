
import React, { useEffect } from 'react';
import { useArtworkPurchase } from '@/hooks/purchase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const OrderHistory = () => {
  const { loadOrderHistory, orders, loadingOrders } = useArtworkPurchase();
  
  useEffect(() => {
    loadOrderHistory();
  }, []);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loadingOrders) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent className="py-10 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-muted-foreground">You haven't made any purchases yet.</p>
            <Link to="/portfolios" className="text-primary hover:underline mt-2 inline-block">
              Browse artworks
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
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
                      by {order.artworks?.portfolios?.profiles?.full_name || order.artworks?.portfolios?.profiles?.username}
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
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
