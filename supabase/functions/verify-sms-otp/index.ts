import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    ) as any;

    const { phone, otp } = await req.json();
    if (!phone || !otp) throw new Error('Phone and otp required');

    let normalized = phone.replace(/[^0-9]/g, '');
    if (normalized.startsWith('0')) normalized = '255' + normalized.slice(1);
    const international = `+${normalized}`;

    // find matching unverified code
    const { data: record, error } = await supabaseClient
      .from('otp_codes')
      .select('*')
      .eq('phone', international)
      .eq('otp', otp)
      .eq('verified', false)
      .lte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) throw error;
    if (!record) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid or expired code' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // mark verified
    await supabaseClient
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', record.id);

    // ensure profile exists
    let user: any = null;
    const { data: existing } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('phone', international)
      .maybeSingle();

    if (!existing) {
      const { data: newUser } = await supabaseClient
        .from('profiles')
        .insert({ phone: international, full_name: record.full_name, category: 'church_member' })
        .single();
      user = newUser;
    } else {
      user = existing;
    }

    // create a Supabase auth session for the user so the frontend can be logged in
    const { data: sessionData, error: sessionError } =
      await supabaseClient.auth.admin.createSession({
        user_id: user.id,
      });
    if (sessionError) throw sessionError;

    const access_token = sessionData?.access_token;
    const refresh_token = sessionData?.refresh_token;
    const expires_at = sessionData?.expires_at;

    return new Response(
      JSON.stringify({
        success: true,
        access_token,
        refresh_token,
        user_id: user.id,
        user,
        expires_at,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Unknown' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

console.log('verify-sms-otp function ready');