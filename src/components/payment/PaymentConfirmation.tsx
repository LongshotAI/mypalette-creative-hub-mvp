
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types/portfolio';

const PaymentConfirmation = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('order_id');
  const sessionId = searchParams.get('session_id');
  const canceled = searchParams.get('canceled');
  
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order information found');
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            artworks:artwork_id (
              id,
              title,
              image_url,
              portfolios:portfolio_id (
                id,
                name,
                user_id,
                profiles:user_id (
                  id,
                  username,
                  full_name
                )
              )
            )
          `)
          .eq('id', orderId)
          .single();
        
        if (error) {
          throw error;
        }
        
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Unable to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId]);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Loading order details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">{error}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }
  
  if (canceled) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            <XCircle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
            Payment Canceled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">
            Your order has been canceled. No payment has been processed.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Link to="/portfolios">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
          <Link to="/dashboard?tab=orders">
            <Button>View Orders</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }
  
  if (!order) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            Order Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">
            We couldn't find your order. Please check your order history.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/dashboard?tab=orders">
            <Button>View Order History</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }
  
  const isCompleted = order.status === 'completed';
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {isCompleted ? (
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
          ) : (
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-2" />
          )}
          {isCompleted ? 'Payment Successful' : 'Processing Payment'}
        </CardTitle>
        <CardDescription className="text-center">
          {isCompleted 
            ? 'Your payment has been successfully processed.' 
            : 'Your payment is being processed. This may take a moment.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
          
          <div className="border-t pt-4 text-sm">
            <div className="flex justify-between py-1">
              <span>Order ID:</span>
              <span className="font-mono">{order.id}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Status:</span>
              <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Date:</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-4">
        <Link to="/portfolios">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
        <Link to="/dashboard?tab=orders">
          <Button>View Orders</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PaymentConfirmation;
