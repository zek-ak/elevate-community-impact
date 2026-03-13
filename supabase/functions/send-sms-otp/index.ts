import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    ) as any;

    const { phone, full_name } = await req.json();
    if (!phone) throw new Error('Phone number is required');

    // normalize to +255XXXXXXXXX
    let normalized = phone.replace(/[^0-9]/g, '');
    if (normalized.startsWith('0')) normalized = '255' + normalized.slice(1);
    if (!normalized.startsWith('255')) {
      throw new Error('Phone must start with 255');
    }
    if (normalized.length !== 12) {
      throw new Error('Phone must be 255XXXXXXXXX (12 digits)');
    }
    const international = `+${normalized}`;

    // rate limit last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recent } = await supabaseClient
      .from('otp_codes')
      .select('id')
      .eq('phone', international)
      .gte('created_at', oneHourAgo)
      .limit(4);
    if (recent && recent.length >= 3) {
      throw new Error('Too many requests. Try again later.');
    }

    // clean expired
    await supabaseClient
      .from('otp_codes')
      .update({ verified: true })
      .eq('phone', international)
      .lte('expires_at', new Date().toISOString());

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error: insertError } = await supabaseClient
      .from('otp_codes')
      .insert({ phone: international, otp, expires_at: expiresAt, full_name });
    if (insertError) throw insertError;

    // Mock SMS mode for dev/testing - skips real SMS
    if (Deno.env.get('MOCK_SMS') === 'true') {
      console.log(`MOCK SMS to ${international}: Your verification code is ${otp}`);
      return new Response(JSON.stringify({ success: true, message: 'MOCK OTP sent (check logs/DB)' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Real SMS provider
    const username = '0712686839';
    const password = '0712686839';
    const auth = btoa(`${username}:${password}`);

    const smsResp = await fetch('https://messaging-service.co.tz/api/sms/v1/text/single', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        from: 'NEXTSMS',
        to: international,
        text: `Your verification code is ${otp}`,
      }),
    });

    if (!smsResp.ok) {
      const txt = await smsResp.text();
      console.error('SMS error', smsResp.status, txt);
      throw new Error(`SMS provider failed: ${smsResp.status}`);
    }

    return new Response(JSON.stringify({ success: true, message: 'OTP sent' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Unknown' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

console.log('send-sms-otp function ready');
