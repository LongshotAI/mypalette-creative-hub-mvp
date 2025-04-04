
import React, { useEffect } from 'react';
import { useArtworkPurchase } from '@/hooks/purchase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderStatus } from '@/types/portfolio';

const OrderHistory = () => {
  const { 
    loadOrderHistory, 
    orders, 
    loadingOrders, 
    selectedStatus,
    setSelectedStatus
  } = useArtworkPurchase();
  
  useEffect(() => {
    loadOrderHistory();
  }, []);
  
  const handleTabChange = (value: string) => {
    loadOrderHistory(value as OrderStatus);
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
        <CardTitle>Order History</CardTitle>
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
        {loadingOrders ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">You haven't made any purchases yet.</p>
            <Link to="/portfolios" className="text-primary hover:underline mt-2 inline-block">
              Browse artworks
            </Link>
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
                    {getStatusColor(order.status)}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </p>
                    <Link 
                      to={`/payment/confirmation?order_id=${order.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      View details
                    </Link>
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

export default OrderHistory;
