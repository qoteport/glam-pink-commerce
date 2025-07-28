
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('x-paystack-signature')
    const body = await req.text()
    
    // Verify Paystack signature
    const secret = Deno.env.get('PAYSTACK_LIVE_SECRET_KEY')
    if (!secret) {
      throw new Error('Paystack secret key not found')
    }

    const hash = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(body))
    const hashArray = Array.from(new Uint8Array(hash))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    if (hashHex !== signature) {
      return new Response('Invalid signature', { status: 401, headers: corsHeaders })
    }

    const event = JSON.parse(body)
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Handle payment events
    if (event.event === 'charge.success') {
      const { data } = event
      
      // Create order record
      const orderData = {
        customer_email: data.customer.email,
        customer_name: `${data.customer.first_name} ${data.customer.last_name}`,
        total_amount: data.amount / 100, // Convert from kobo to main currency
        payment_status: 'completed',
        order_status: 'processing',
        notes: `Payment completed via Paystack. Reference: ${data.reference}`,
        subtotal: data.amount / 100,
        tax_amount: 0,
        shipping_amount: 0,
        shipping_address: data.metadata?.shipping_address || {},
        billing_address: data.metadata?.shipping_address || {}
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()

      if (orderError) {
        console.error('Error creating order:', orderError)
        return new Response('Error creating order', { status: 500, headers: corsHeaders })
      }

      // Create order items if metadata contains items
      if (data.metadata?.items && Array.isArray(data.metadata.items)) {
        const orderItems = data.metadata.items.map((item: any) => ({
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          selected_color: item.selectedColor,
          selected_length: item.selectedLength
        }))

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) {
          console.error('Error creating order items:', itemsError)
        }
      }

      console.log('Order created successfully:', order.id)
    }

    return new Response('OK', { headers: corsHeaders })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Error processing webhook', { status: 500, headers: corsHeaders })
  }
})
