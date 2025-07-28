
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
      
      // Check if this is a retry payment
      const retryOrderId = data.metadata?.retry_order_id
      
      if (retryOrderId) {
        // Update existing order
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            payment_status: 'completed',
            payment_reference: data.reference,
            order_status: 'processing',
            failure_reason: null
          })
          .eq('id', retryOrderId)

        if (updateError) {
          console.error('Error updating retry order:', updateError)
          return new Response('Error updating order', { status: 500, headers: corsHeaders })
        }

        // Create success notification
        const { error: notificationError } = await supabase
          .from('order_notifications')
          .insert([{
            order_id: retryOrderId,
            user_id: data.metadata?.user_id,
            type: 'payment_success',
            title: 'Payment Successful',
            message: `Your payment of ${(data.amount / 100).toFixed(2)} has been processed successfully.`
          }])

        if (notificationError) {
          console.error('Error creating notification:', notificationError)
        }

        console.log('Retry order updated successfully:', retryOrderId)
      } else {
        // Create new order
        const orderData = {
          customer_email: data.customer.email,
          customer_name: `${data.customer.first_name} ${data.customer.last_name}`,
          total_amount: data.amount / 100,
          payment_status: 'completed',
          order_status: 'processing',
          payment_reference: data.reference,
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

        // Create success notification
        const { error: notificationError } = await supabase
          .from('order_notifications')
          .insert([{
            order_id: order.id,
            user_id: data.metadata?.user_id,
            type: 'payment_success',
            title: 'Payment Successful',
            message: `Your payment of ${(data.amount / 100).toFixed(2)} has been processed successfully.`
          }])

        if (notificationError) {
          console.error('Error creating notification:', notificationError)
        }

        console.log('Order created successfully:', order.id)
      }
    }

    // Handle payment failures
    if (event.event === 'charge.failed') {
      const { data } = event
      
      // Create failure notification if user_id is available
      if (data.metadata?.user_id) {
        const { error: notificationError } = await supabase
          .from('order_notifications')
          .insert([{
            order_id: data.metadata?.order_id || '',
            user_id: data.metadata.user_id,
            type: 'payment_failed',
            title: 'Payment Failed',
            message: `Payment failed: ${data.gateway_response || 'Unknown error'}. Please try again.`
          }])

        if (notificationError) {
          console.error('Error creating failure notification:', notificationError)
        }
      }

      console.log('Payment failed:', data.reference)
    }

    return new Response('OK', { headers: corsHeaders })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Error processing webhook', { status: 500, headers: corsHeaders })
  }
})
