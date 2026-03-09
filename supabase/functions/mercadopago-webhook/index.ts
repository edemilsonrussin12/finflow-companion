import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Webhook received:', JSON.stringify(body));

    // Mercado Pago sends different notification types
    // We only care about payment notifications
    if (body.type !== 'payment' && body.action !== 'payment.updated') {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      console.error('No payment ID in webhook');
      return new Response(JSON.stringify({ error: 'No payment ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch payment details from Mercado Pago
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured');
      return new Response(JSON.stringify({ error: 'Not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!mpResponse.ok) {
      console.error('Failed to fetch payment:', await mpResponse.text());
      return new Response(JSON.stringify({ error: 'Failed to fetch payment' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payment = await mpResponse.json();
    console.log('Payment status:', payment.status, 'External ref:', payment.external_reference);

    if (payment.status !== 'approved') {
      console.log('Payment not approved, skipping. Status:', payment.status);
      return new Response(JSON.stringify({ received: true, status: payment.status }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse external_reference to get user_id and plan
    let userId: string;
    let plan: string;
    try {
      const ref = JSON.parse(payment.external_reference);
      userId = ref.user_id;
      plan = ref.plan;
    } catch {
      console.error('Invalid external_reference:', payment.external_reference);
      return new Response(JSON.stringify({ error: 'Invalid reference' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!userId || !plan) {
      console.error('Missing user_id or plan in reference');
      return new Response(JSON.stringify({ error: 'Missing data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate expiration
    const now = new Date();
    const expiresAt = new Date(now);
    if (plan === 'annual') {
      expiresAt.setDate(expiresAt.getDate() + 365);
    } else {
      expiresAt.setDate(expiresAt.getDate() + 30);
    }

    // Use service role to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Upsert subscription
    const { error: upsertError } = await supabase
      .from('user_subscriptions')
      .upsert(
        {
          user_id: userId,
          is_premium: true,
          premium_started_at: now.toISOString(),
          premium_expires_at: expiresAt.toISOString(),
          mercadopago_payment_id: String(paymentId),
          plan_type: plan,
          updated_at: now.toISOString(),
        },
        { onConflict: 'user_id' },
      );

    if (upsertError) {
      console.error('Failed to upsert subscription:', upsertError);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Premium activated for user ${userId}, plan: ${plan}, expires: ${expiresAt.toISOString()}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
