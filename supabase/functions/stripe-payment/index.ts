
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
    
    if (!stripeSecretKey) {
      throw new Error('Missing Stripe secret key')
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Get request body
    const { artworkId, buyerId, successUrl, cancelUrl } = await req.json()
    
    // Verify the user is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get the JWT token from the authorization header
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the JWT and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Verify the buyer is the authenticated user
    if (user.id !== buyerId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized buyer' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get the artwork details
    const { data: artwork, error: artworkError } = await supabase
      .from('artworks')
      .select(`
        id,
        title,
        price,
        currency,
        image_url,
        for_sale,
        portfolio_id,
        portfolios:portfolio_id (
          user_id
        )
      `)
      .eq('id', artworkId)
      .single()
    
    if (artworkError || !artwork) {
      return new Response(
        JSON.stringify({ error: 'Artwork not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Verify the artwork is for sale
    if (!artwork.for_sale) {
      return new Response(
        JSON.stringify({ error: 'Artwork is not for sale' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Create a new order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: buyerId,
        artwork_id: artworkId,
        amount: artwork.price,
        currency: artwork.currency,
        status: 'pending'
      })
      .select('id')
      .single()
    
    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: artwork.currency.toLowerCase(),
            product_data: {
              name: artwork.title,
              images: [artwork.image_url],
            },
            unit_amount: Math.round(artwork.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${cancelUrl}?order_id=${order.id}&canceled=true`,
      metadata: {
        order_id: order.id,
        artwork_id: artworkId,
        buyer_id: buyerId
      }
    })
    
    // Update order with Stripe session ID
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id)
    
    return new Response(
      JSON.stringify({ sessionId: session.id, sessionUrl: session.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
