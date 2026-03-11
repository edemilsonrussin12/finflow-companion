import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLAN_PRICES: Record<string, number> = {
  monthly: 19.90,
  annual: 167.00,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('[WEBHOOK] ─── Notification received ───');
    console.log('[WEBHOOK] Type:', body.type, '| Action:', body.action);

    // Accept payment and payment.updated notifications
    if (body.type !== 'payment' && body.action !== 'payment.updated') {
      console.log('[WEBHOOK] Ignoring non-payment notification');
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      console.error('[WEBHOOK] No payment ID in body');
      return new Response(JSON.stringify({ error: 'No payment ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('[WEBHOOK] MERCADOPAGO_ACCESS_TOKEN not configured');
      return new Response(JSON.stringify({ error: 'Not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Detect if using test credentials
    const isTestMode = accessToken.startsWith('TEST-');
    console.log('[WEBHOOK] Mode:', isTestMode ? 'TEST' : 'PRODUCTION', '| Payment ID:', paymentId);

    // Fetch payment from Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!mpResponse.ok) {
      const errText = await mpResponse.text();
      console.error('[WEBHOOK] MP API error:', mpResponse.status, errText);
      return new Response(JSON.stringify({ error: 'Failed to fetch payment' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payment = await mpResponse.json();
    console.log('[WEBHOOK] Payment status:', payment.status, '| Amount:', payment.transaction_amount, '| External ref:', payment.external_reference);

    // Parse external_reference
    let userId: string;
    let plan: string;
    try {
      const ref = JSON.parse(payment.external_reference);
      userId = ref.user_id;
      plan = ref.plan;
    } catch {
      console.error('[WEBHOOK] Invalid external_reference:', payment.external_reference);
      return new Response(JSON.stringify({ error: 'Invalid reference' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!userId || !plan) {
      console.error('[WEBHOOK] Missing user_id or plan in reference');
      return new Response(JSON.stringify({ error: 'Missing data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Record payment in history for ALL statuses
    const paymentAmount = payment.transaction_amount || PLAN_PRICES[plan] || 0;
    console.log('[WEBHOOK] Recording payment | user:', userId, '| status:', payment.status, '| amount:', paymentAmount);

    await supabase.from('payments').upsert({
      user_id: userId,
      plan_type: plan,
      amount: paymentAmount,
      status: payment.status,
      mercadopago_payment_id: String(paymentId),
      created_at: payment.date_created || new Date().toISOString(),
    }, { onConflict: 'mercadopago_payment_id' }).then(({ error }) => {
      if (error) console.error('[WEBHOOK] Failed to record payment:', error.message);
      else console.log('[WEBHOOK] Payment recorded in history');
    });

    // Handle different payment statuses
    if (payment.status === 'approved') {
      const now = new Date();
      const expiresAt = new Date(now);
      if (plan === 'annual') {
        expiresAt.setDate(expiresAt.getDate() + 365);
      } else {
        expiresAt.setDate(expiresAt.getDate() + 30);
      }

      console.log('[WEBHOOK] ✅ ACTIVATING PREMIUM | user:', userId, '| plan:', plan, '| expires:', expiresAt.toISOString());

      const { error: upsertError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          is_premium: true,
          premium_started_at: now.toISOString(),
          premium_expires_at: expiresAt.toISOString(),
          mercadopago_payment_id: String(paymentId),
          plan_type: plan,
          updated_at: now.toISOString(),
        }, { onConflict: 'user_id' });

      if (upsertError) {
        console.error('[WEBHOOK] DB upsert error:', JSON.stringify(upsertError));
        return new Response(JSON.stringify({ error: 'Database error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('[WEBHOOK] ✅ Premium activated successfully for user', userId);

      // Update referral status if this user was referred
      const { data: referral } = await supabase
        .from('referrals')
        .select('id, referrer_id')
        .eq('referred_id', userId)
        .maybeSingle();

      if (referral) {
        await supabase.from('referrals').update({
          status: 'premium_paid',
          premium_converted: true,
        }).eq('id', referral.id);
        console.log('[WEBHOOK] Referral updated to premium_paid for referrer', referral.referrer_id);
      }

      return new Response(JSON.stringify({ success: true, activated: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (payment.status === 'pending' || payment.status === 'in_process') {
      console.log('[WEBHOOK] ⏳ Payment pending for user', userId);
      return new Response(JSON.stringify({ received: true, status: 'pending' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (payment.status === 'rejected' || payment.status === 'cancelled' || payment.status === 'refunded') {
      console.log('[WEBHOOK] ❌ Payment', payment.status, 'for user', userId);
      // Deactivate premium if refunded
      if (payment.status === 'refunded') {
        await supabase.from('user_subscriptions').update({
          is_premium: false,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId);
        console.log('[WEBHOOK] Premium deactivated due to refund');
      }
      return new Response(JSON.stringify({ received: true, status: payment.status }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[WEBHOOK] Unhandled payment status:', payment.status);
    return new Response(JSON.stringify({ received: true, status: payment.status }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[WEBHOOK] Unhandled error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
