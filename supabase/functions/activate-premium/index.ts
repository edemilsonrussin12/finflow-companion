import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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
    // ── JWT Authentication ──
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized', activated: false }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Invalid token', activated: false }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authenticatedUserId = claimsData.claims.sub as string;

    const { payment_id, user_id, plan } = await req.json();
    console.log('[ACTIVATE] ─── Request received ───');
    console.log('[ACTIVATE] payment_id:', payment_id, '| user_id:', user_id, '| plan:', plan);
    console.log('[ACTIVATE] Authenticated user:', authenticatedUserId);

    if (!payment_id || !user_id) {
      return new Response(JSON.stringify({ error: 'payment_id and user_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Ensure the authenticated user matches the requested user_id
    if (authenticatedUserId !== user_id) {
      console.error('[ACTIVATE] User mismatch! authenticated:', authenticatedUserId, 'requested:', user_id);
      return new Response(JSON.stringify({ error: 'User mismatch', activated: false }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('[ACTIVATE] MERCADOPAGO_ACCESS_TOKEN not configured');
      return new Response(JSON.stringify({ error: 'Not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isTestMode = accessToken.startsWith('TEST-');
    console.log('[ACTIVATE] Mode:', isTestMode ? 'TEST' : 'PRODUCTION');

    // Verify payment with Mercado Pago API
    console.log('[ACTIVATE] Fetching payment from MP API:', payment_id);
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!mpResponse.ok) {
      const errText = await mpResponse.text();
      console.error('[ACTIVATE] MP API error:', mpResponse.status, errText);
      return new Response(JSON.stringify({ error: 'Failed to verify payment', activated: false }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payment = await mpResponse.json();
    console.log('[ACTIVATE] Payment status:', payment.status, '| amount:', payment.transaction_amount);

    if (payment.status !== 'approved') {
      console.log('[ACTIVATE] Payment not approved:', payment.status);
      return new Response(JSON.stringify({ activated: false, status: payment.status }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine plan from external_reference or fallback to provided
    let activePlan = plan || 'monthly';
    try {
      const ref = JSON.parse(payment.external_reference);
      if (ref.plan) activePlan = ref.plan;
      if (ref.user_id && ref.user_id !== user_id) {
        console.error('[ACTIVATE] User mismatch! ref:', ref.user_id, 'req:', user_id);
        return new Response(JSON.stringify({ error: 'User mismatch', activated: false }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch {
      console.log('[ACTIVATE] Could not parse external_reference, using plan:', activePlan);
    }

    const now = new Date();
    const expiresAt = new Date(now);
    if (activePlan === 'annual') {
      expiresAt.setDate(expiresAt.getDate() + 365);
    } else {
      expiresAt.setDate(expiresAt.getDate() + 30);
    }

    console.log('[ACTIVATE] ✅ Activating premium | user:', user_id, '| plan:', activePlan, '| expires:', expiresAt.toISOString());

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Upsert subscription
    const { error: upsertError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id,
        is_premium: true,
        premium_started_at: now.toISOString(),
        premium_expires_at: expiresAt.toISOString(),
        mercadopago_payment_id: String(payment_id),
        plan_type: activePlan,
        updated_at: now.toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('[ACTIVATE] DB error:', JSON.stringify(upsertError));
      return new Response(JSON.stringify({ error: 'Database error', activated: false }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Record in payments history
    const paymentAmount = payment.transaction_amount || PLAN_PRICES[activePlan] || 0;
    await supabase.from('payments').upsert({
      user_id,
      plan_type: activePlan,
      amount: paymentAmount,
      status: 'approved',
      mercadopago_payment_id: String(payment_id),
      created_at: now.toISOString(),
    }, { onConflict: 'mercadopago_payment_id' }).then(({ error }) => {
      if (error) console.error('[ACTIVATE] Failed to record payment:', error.message);
      else console.log('[ACTIVATE] Payment recorded in history');
    });

    console.log('[ACTIVATE] ✅ Premium activated for user', user_id);

    return new Response(JSON.stringify({ activated: true, plan: activePlan, expires_at: expiresAt.toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[ACTIVATE] Unhandled error:', err);
    return new Response(JSON.stringify({ error: 'Internal error', activated: false }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
