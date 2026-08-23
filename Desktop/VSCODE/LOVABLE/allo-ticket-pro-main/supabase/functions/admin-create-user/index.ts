import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function errorRes(message: string, status: number) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return errorRes('Non autorisé', 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: reqUser } } = await userClient.auth.getUser();
    if (!reqUser) return errorRes('Non autorisé', 401);

    const { data: adminRole } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', reqUser.id)
      .eq('role', 'admin')
      .maybeSingle();
    if (!adminRole) return errorRes('Accès refusé : réservé aux administrateurs', 403);

    const { email, password, role, full_name, phone } = await req.json();
    if (!email || !password || !role || !full_name) {
      return errorRes('Champs requis manquants : email, password, role, full_name', 400);
    }
    if (!['supervisor', 'organizer', 'manager'].includes(role)) {
      return errorRes('Rôle invalide. Valeurs acceptées : supervisor, organizer, manager', 400);
    }

    // Check email doesn't already exist
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const alreadyExists = existingUsers?.users?.some(u => u.email === email);
    if (alreadyExists) return errorRes('Un compte avec cet email existe déjà', 400);

    // Create the auth user (email auto-confirmed)
    const { data: newUserData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) return errorRes(createError.message, 400);

    const userId = newUserData.user.id;

    // Insert into appropriate requests table with status='approved'
    const table = role === 'supervisor'
      ? 'supervisor_requests'
      : role === 'organizer'
        ? 'organizer_requests'
        : 'manager_requests';

    await adminClient.from(table).insert({
      user_id: userId,
      full_name,
      email,
      phone: phone || null,
      status: 'approved',
    });

    // Assign role in user_roles
    await adminClient.from('user_roles').insert({ user_id: userId, role });

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return errorRes(e?.message ?? 'Erreur interne', 500);
  }
});
