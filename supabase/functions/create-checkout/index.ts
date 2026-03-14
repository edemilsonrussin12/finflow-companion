import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PLANS: Record<string, { title: string; price: number }> = {
  monthly: { title: 'FinControl Premium Mensal', price: 19.90 },
  annual: { title: 'FinControl Premium Anual', price: 167.00 },
};

const PRODUCTION_ORIGIN = 'https://fincontrolapp.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── JWT Authentication ──
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
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
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authenticatedUserId = claimsData.claims.sub as string;

    const { user_id, plan } = await req.json();
    console.log('[CHECKOUT] ─── Request received ───');
    console.log('[CHECKOUT] user_id:', user_id, '| plan:', plan);
    console.log('[CHECKOUT] Authenticated user:', authenticatedUserId);

    if (!user_id || !plan) {
      return new Response(JSON.stringify({ error: 'user_id and plan are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Ensure the authenticated user matches the requested user_id
    if (authenticatedUserId !== user_id) {
      console.error('[CHECKOUT] User mismatch! authenticated:', authenticatedUserId, 'requested:', user_id);
      return new Response(JSON.stringify({ error: 'User mismatch' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const planConfig = PLANS[plan];
    if (!planConfig) {
      return new Response(JSON.stringify({ error: 'Invalid plan. Use "monthly" or "annual".' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('[CHECKOUT] MERCADOPAGO_ACCESS_TOKEN not configured');
      return new Response(JSON.stringify({ error: 'Payment gateway not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isTestMode = accessToken.startsWith('TEST-');
    console.log('[CHECKOUT] Mode:', isTestMode ? 'TEST' : 'PRODUCTION');

    const origin = req.headers.get('origin') || PRODUCTION_ORIGIN;
    console.log('[CHECKOUT] Origin:', origin);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const notificationUrl = `${supabaseUrl}/functions/v1/mercadopago-webhook`;

    if (!supabaseUrl) {
      console.error('[CHECKOUT] ⚠️ SUPABASE_URL not configured — webhook will not work');
    }

    const preference: Record<string, unknown> = {
      items: [
        {
          title: planConfig.title,
          quantity: 1,
          unit_price: planConfig.price,
          currency_id: 'BRL',
        },
      ],
      back_urls: {
        success: `${origin}/payment-success`,
        pending: `${origin}/payment-pending`,
        failure: `${origin}/payment-failure`,
      },
      auto_return: 'approved',
      external_reference: JSON.stringify({ user_id, plan }),
      metadata: { user_id, plan },
      notification_url: notificationUrl,
    };

    console.log('[CHECKOUT] Return URLs:', JSON.stringify(preference.back_urls));
    console.log('[CHECKOUT] Notification URL:', notificationUrl);
    console.log('[CHECKOUT] Price:', planConfig.price, 'BRL | Plan:', plan);

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    if (!mpResponse.ok) {
      const errorBody = await mpResponse.text();
      console.error('[CHECKOUT] MP API error:', mpResponse.status, errorBody);
      return new Response(JSON.stringify({ error: 'Failed to create checkout preference' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const mpData = await mpResponse.json();
    const checkoutUrl = isTestMode ? (mpData.sandbox_init_point || mpData.init_point) : mpData.init_point;

    console.log('[CHECKOUT] ✅ Preference created | id:', mpData.id);
    console.log('[CHECKOUT] Checkout URL:', checkoutUrl);
    console.log('[CHECKOUT] Mode:', isTestMode ? 'SANDBOX' : 'PRODUCTION');

    return new Response(JSON.stringify({
      init_point: checkoutUrl,
      id: mpData.id,
      mode: isTestMode ? 'test' : 'production',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[CHECKOUT] Unhandled error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
