
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Stripe from 'https://esm.sh/stripe@12.4.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    
    if (!stripeSecretKey) {
      throw new Error('Missing Stripe secret key')
    }
    
    if (!webhookSecret) {
      throw new Error('Missing Stripe webhook secret')
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature')
    
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'No signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get the request body
    const body = await req.text()
    
    // Verify the event
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Received Stripe webhook event:', event.type)
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        
        console.log('Processing checkout.session.completed:', { sessionId: session.id })
        
        // Get the order from the database
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('stripe_session_id', session.id)
          .single()
          
        if (orderError) {
          console.error('Error fetching order:', orderError)
          break
        }
          
        // Update the order status
        const { data, error } = await supabase
          .from('orders')
          .update({ status: 'completed' })
          .eq('stripe_session_id', session.id)
          .select()
        
        if (error) {
          console.error('Error updating order:', error)
          break
        }
        
        console.log('Order updated successfully:', data)
        
        // Handle inventory management - mark artwork as sold out if needed
        // First, check if the artwork has quantity information
        const { data: artwork, error: artworkError } = await supabase
          .from('artworks')
          .select('quantity, portfolio_id')
          .eq('id', order.artwork_id)
          .single()
          
        if (!artworkError && artwork) {
          // If quantity is null or undefined, assume it's a single item (sold out after one purchase)
          // If quantity is a number, decrement it and check if it's now zero
          let updateData = {}
          
          if (artwork.quantity === null || artwork.quantity === undefined) {
            // Single item artwork, mark as sold out
            updateData = { sold_out: true }
          } else if (artwork.quantity > 0) {
            // Multiple items, decrement quantity
            const newQuantity = artwork.quantity - 1
            updateData = { 
              quantity: newQuantity,
              sold_out: newQuantity <= 0
            }
          }
          
          if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await supabase
              .from('artworks')
              .update(updateData)
              .eq('id', order.artwork_id)
              
            if (updateError) {
              console.error('Error updating artwork inventory:', updateError)
            } else {
              console.log('Artwork inventory updated successfully')
            }
          }
          
          // Get seller information for notification
          if (artwork.portfolio_id) {
            const { data: portfolio, error: portfolioError } = await supabase
              .from('portfolios')
              .select('user_id')
              .eq('id', artwork.portfolio_id)
              .single()
              
            if (!portfolioError && portfolio) {
              // Send notification to seller
              // In a real system, you would implement proper notifications here
              // For now, just mark the order as seller_notified
              await supabase
                .from('orders')
                .update({ seller_notified: true })
                .eq('id', order.id)
                
              console.log('Seller notification marked for order:', order.id)
            }
          }
        }
        
        break
      }
      
      case 'checkout.session.expired': {
        const session = event.data.object
        
        console.log('Processing checkout.session.expired:', { sessionId: session.id })
        
        // Update the order status to failed
        const { error } = await supabase
          .from('orders')
          .update({ status: 'failed' })
          .eq('stripe_session_id', session.id)
        
        if (error) {
          console.error('Error updating expired order:', error)
        }
        break
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        
        console.log('Payment failed:', { 
          paymentIntentId: paymentIntent.id,
          error: paymentIntent.last_payment_error
        })
        
        // Find orders related to this payment intent and mark as failed
        const { data: sessions, error: sessionsError } = await supabase
          .from('orders')
          .select('stripe_session_id')
          .eq('status', 'pending')
          
        if (sessionsError) {
          console.error('Error fetching sessions:', sessionsError)
          break
        }
        
        // For each pending session, check if it belongs to this payment intent
        for (const orderSession of sessions || []) {
          try {
            const session = await stripe.checkout.sessions.retrieve(orderSession.stripe_session_id)
            
            if (session.payment_intent === paymentIntent.id) {
              // Update the order status to failed
              const { error } = await supabase
                .from('orders')
                .update({ status: 'failed' })
                .eq('stripe_session_id', session.id)
                
              if (error) {
                console.error('Error updating failed order:', error)
              } else {
                console.log('Order marked as failed:', session.id)
              }
            }
          } catch (err) {
            console.error('Error checking session:', err)
          }
        }
        
        break
      }
    }
    
    // Return a response to acknowledge receipt of the event
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in webhook handler:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
