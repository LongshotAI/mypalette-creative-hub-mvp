
import React, { useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useArtworkPurchase } from '@/hooks/purchase';
import { Loader2, PackageOpen } from 'lucide-react';
import { Order, Artwork } from '@/types/portfolio';

const SalesHistory = () => {
  const { 
    loadOrderHistory, 
    orders, 
    loadingOrders, 
    selectedStatus, 
    setSelectedStatus 
  } = useArtworkPurchase();

  useEffect(() => {
    const fetchOrders = async () => {
      await loadOrderHistory(selectedStatus);
    };
    
    fetchOrders();
  }, [selectedStatus]);

  const formatOrders = (): Order[] => {
    try {
      return orders.map(order => ({
        id: order.id,
        buyer_id: order.buyer_id,
        artwork_id: order.artwork_id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        created_at: order.created_at,
        stripe_session_id: order.stripe_session_id,
        artworks: order.artworks ? {
          id: order.artworks.id,
          title: order.artworks.title,
          description: order.artworks.description || "",
          image_url: order.artworks.image_url,
          price: order.artworks.price || null,
          currency: order.artworks.currency || "USD",
          for_sale: order.artworks.for_sale || false,
          portfolio_id: order.artworks.portfolio_id,
          created_at: order.artworks.created_at || order.created_at,
          portfolios: order.artworks.portfolios ? {
            id: order.artworks.portfolios.id || "",
            name: order.artworks.portfolios.name || "",
            user_id: order.artworks.portfolios.user_id || "",
            profiles: order.artworks.portfolios.profiles || undefined
          } : undefined
        } : undefined
      }));
    } catch (error) {
      console.error('Error formatting orders:', error);
      return [];
    }
  };

  const formattedOrders = formatOrders();
  
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Sales History</CardTitle>
        <CardDescription>
          Track your artwork sales and transaction history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="all" 
          value={selectedStatus} 
          onValueChange={(value) => setSelectedStatus(value as any)}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Sales</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedStatus}>
            {loadingOrders ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : formattedOrders.length === 0 ? (
              <div className="text-center py-10">
                <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground/80" />
                <h3 className="mt-4 text-lg font-medium">No sales found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  When your artworks sell, they'll appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Artwork</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formattedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          {format(new Date(order.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {order.artworks?.title || "Untitled Artwork"}
                        </TableCell>
                        <TableCell>
                          {order.currency} {order.amount}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  let variant = "";
  
  switch (status) {
    case "completed":
      variant = "bg-green-500";
      break;
    case "pending":
      variant = "bg-yellow-500";
      break;
    case "failed":
      variant = "bg-red-500";
      break;
    default:
      variant = "bg-gray-500";
  }
  
  return (
    <Badge className={variant}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default SalesHistory;
