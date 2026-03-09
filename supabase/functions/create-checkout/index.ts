const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PLANS: Record<string, { title: string; price: number }> = {
  monthly: { title: 'FinControl Premium Mensal', price: 19.90 },
  annual: { title: 'FinControl Premium Anual', price: 167.00 },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, plan } = await req.json();
    console.log('[CHECKOUT] Request received | user_id:', user_id, '| plan:', plan);

    if (!user_id || !plan) {
      return new Response(JSON.stringify({ error: 'user_id and plan are required' }), {
        status: 400,
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
      return new Response(JSON.stringify({ error: 'Payment gateway not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const origin = req.headers.get('origin') || 'https://money-grow-pal.lovable.app';
    console.log('[CHECKOUT] Using origin:', origin);

    const preference = {
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
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
    };

    console.log('[CHECKOUT] Creating MP preference with back_urls:', JSON.stringify(preference.back_urls));
    console.log('[CHECKOUT] Notification URL:', preference.notification_url);

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    if (!mpResponse.ok) {
      const errorBody = await mpResponse.text();
      console.error('[CHECKOUT] MercadoPago error:', errorBody);
      return new Response(JSON.stringify({ error: 'Failed to create checkout preference' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const mpData = await mpResponse.json();
    console.log('[CHECKOUT] ✅ Preference created | id:', mpData.id, '| init_point:', mpData.init_point);

    return new Response(JSON.stringify({ init_point: mpData.init_point, id: mpData.id }), {
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
