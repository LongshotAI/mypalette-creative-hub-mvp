
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
        
        // Update the order status
        const { data, error } = await supabase
          .from('orders')
          .update({ status: 'completed' })
          .eq('stripe_session_id', session.id)
          .select()
        
        if (error) {
          console.error('Error updating order:', error)
        } else {
          console.log('Order updated successfully:', data)
          
          // If you want to send a notification email, you could do it here
          // or trigger another function to do so
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
        
        // If you have a way to link payment_intent to session/order, you could update the order here
        break
      }
      
      // Add more event handlers as needed
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
