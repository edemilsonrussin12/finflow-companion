import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ADMIN_EMAILS = ['edemilso-cardoso2@hotmail.com'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin via JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Verify user from JWT
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user || !user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, ...params } = await req.json();

    if (action === 'list') {
      // Get all subscriptions with profiles
      const { data: subs, error } = await supabaseAdmin
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, email, display_name');

      const { data: payments } = await supabaseAdmin
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      // Get total user count
      const { count: totalUsers } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ subscriptions: subs || [], profiles: profiles || [], payments: payments || [], totalUsers: totalUsers || 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'activate') {
      const { user_id, plan_type, days } = params;
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + (days || (plan_type === 'annual' ? 365 : 30)));

      const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .upsert({
          user_id,
          is_premium: true,
          plan_type: plan_type || 'monthly',
          premium_started_at: now.toISOString(),
          premium_expires_at: expiresAt.toISOString(),
          updated_at: now.toISOString(),
        }, { onConflict: 'user_id' });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'extend') {
      const { user_id, days } = params;
      const { data: existing } = await supabaseAdmin
        .from('user_subscriptions')
        .select('premium_expires_at')
        .eq('user_id', user_id)
        .single();

      const baseDate = existing?.premium_expires_at ? new Date(existing.premium_expires_at) : new Date();
      baseDate.setDate(baseDate.getDate() + (days || 30));

      const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          premium_expires_at: baseDate.toISOString(),
          is_premium: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user_id);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, new_expires_at: baseDate.toISOString() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'expire') {
      const { user_id } = params;
      const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          is_premium: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user_id);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[ADMIN] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
