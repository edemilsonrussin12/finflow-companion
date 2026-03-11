import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ADMIN_EMAILS = ['edemilso-cardoso2@hotmail.com'];

function getAdminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}

async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    console.error('[ADMIN] No Authorization header');
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseAdmin = getAdminClient();

  // Use service role client to verify the token
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error) {
    console.error('[ADMIN] Auth error:', error.message);
    return null;
  }

  if (!user?.email) {
    console.error('[ADMIN] No email on user');
    return null;
  }

  if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    console.error('[ADMIN] User is not admin:', user.email);
    return null;
  }

  console.log('[ADMIN] Verified admin:', user.email);
  return user;
}

async function addLog(admin: any, supabaseAdmin: any, action: string, userId?: string, userEmail?: string, notes?: string) {
  await supabaseAdmin.from('admin_logs').insert({
    user_id: userId || null,
    user_email: userEmail || null,
    action,
    admin_email: admin.email,
    notes: notes || null,
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = getAdminClient();
    const { action, ...params } = await req.json();

    // ─── LIST ───
    if (action === 'list') {
      const [subsRes, profilesRes, paymentsRes, logsRes, referralsRes] = await Promise.all([
        supabaseAdmin.from('user_subscriptions').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('profiles').select('id, email, display_name, created_at'),
        supabaseAdmin.from('payments').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(100),
        supabaseAdmin.from('referrals').select('*').order('created_at', { ascending: false }),
      ]);

      const { count: totalUsers } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') || '';
      const paymentMode = accessToken.startsWith('TEST-') ? 'test' : 'production';

      return new Response(JSON.stringify({
        subscriptions: subsRes.data || [],
        profiles: profilesRes.data || [],
        payments: paymentsRes.data || [],
        logs: logsRes.data || [],
        referrals: referralsRes.data || [],
        totalUsers: totalUsers || 0,
        paymentMode,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── ACTIVATE ───
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

      if (error) throw error;

      const { data: profile } = await supabaseAdmin.from('profiles').select('email').eq('id', user_id).single();
      await addLog(admin, supabaseAdmin, 'premium_activated', user_id, profile?.email, `Plan: ${plan_type || 'monthly'}, Days: ${days || (plan_type === 'annual' ? 365 : 30)}`);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── EXTEND ───
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

      if (error) throw error;

      const { data: profile } = await supabaseAdmin.from('profiles').select('email').eq('id', user_id).single();
      await addLog(admin, supabaseAdmin, 'subscription_extended', user_id, profile?.email, `Extended by ${days || 30} days`);

      return new Response(JSON.stringify({ success: true, new_expires_at: baseDate.toISOString() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── EXPIRE / DOWNGRADE ───
    if (action === 'expire') {
      const { user_id } = params;
      const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          is_premium: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user_id);

      if (error) throw error;

      const { data: profile } = await supabaseAdmin.from('profiles').select('email').eq('id', user_id).single();
      await addLog(admin, supabaseAdmin, 'premium_expired', user_id, profile?.email, 'Manually expired by admin');

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── CONVERT MONTHLY → ANNUAL ───
    if (action === 'convert_annual') {
      const { user_id } = params;
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + 365);

      const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          plan_type: 'annual',
          is_premium: true,
          premium_started_at: now.toISOString(),
          premium_expires_at: expiresAt.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('user_id', user_id);

      if (error) throw error;

      const { data: profile } = await supabaseAdmin.from('profiles').select('email').eq('id', user_id).single();
      await addLog(admin, supabaseAdmin, 'converted_to_annual', user_id, profile?.email, 'Converted from monthly to annual');

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── EXPIRE ALL OVERDUE ───
    if (action === 'expire_overdue') {
      const now = new Date().toISOString();
      const { data: overdue } = await supabaseAdmin
        .from('user_subscriptions')
        .select('user_id')
        .eq('is_premium', true)
        .lt('premium_expires_at', now);

      if (overdue && overdue.length > 0) {
        const ids = overdue.map((s: any) => s.user_id);
        await supabaseAdmin
          .from('user_subscriptions')
          .update({ is_premium: false, updated_at: now })
          .in('user_id', ids);

        await addLog(admin, supabaseAdmin, 'bulk_expiration', undefined, undefined, `Expired ${ids.length} overdue subscriptions`);
      }

      return new Response(JSON.stringify({ success: true, expired_count: overdue?.length || 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── GRANT REFERRAL REWARD ───
    if (action === 'grant_referral_reward') {
      const { referral_id, referrer_id, reward_days } = params;
      const days = reward_days || 30;

      // Extend or activate premium for referrer
      const { data: existing } = await supabaseAdmin
        .from('user_subscriptions')
        .select('premium_expires_at, is_premium')
        .eq('user_id', referrer_id)
        .single();

      const baseDate = (existing?.is_premium && existing?.premium_expires_at)
        ? new Date(existing.premium_expires_at)
        : new Date();
      baseDate.setDate(baseDate.getDate() + days);

      await supabaseAdmin
        .from('user_subscriptions')
        .upsert({
          user_id: referrer_id,
          is_premium: true,
          plan_type: existing?.is_premium ? undefined : 'monthly',
          premium_expires_at: baseDate.toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      // Mark referral as rewarded
      await supabaseAdmin
        .from('referrals')
        .update({
          status: 'reward_granted',
          reward_granted: true,
          reward_granted_at: new Date().toISOString(),
          reward_type: `${days}_days_premium`,
        })
        .eq('id', referral_id);

      const { data: profile } = await supabaseAdmin.from('profiles').select('email').eq('id', referrer_id).single();
      await addLog(admin, supabaseAdmin, 'referral_reward_granted', referrer_id, profile?.email, `+${days} days premium via referral`);

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
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
