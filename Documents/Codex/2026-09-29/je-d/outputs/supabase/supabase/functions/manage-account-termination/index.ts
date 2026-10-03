import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set(["https://thepeeak.com", "https://www.thepeeak.com", "http://localhost:4173", "http://127.0.0.1:4173"]);
const responseHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin) ? origin : "https://thepeeak.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});
const reply = (status: number, body: Record<string, unknown>, origin: string | null) => new Response(
  JSON.stringify(body),
  { status, headers: { ...responseHeaders(origin), "Content-Type": "application/json" } },
);

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: responseHeaders(origin) });
  if (req.method !== "POST") return reply(405, { error: "Méthode non autorisée." }, origin);
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = req.headers.get("Authorization");
  if (!url || !serviceKey || !authorization) return reply(401, { error: "Authentification requise." }, origin);

  const adminDb = createClient(url, serviceKey, { auth: { persistSession: false } });
  const token = authorization.replace(/^Bearer\s+/i, "");
  const { data: { user }, error: authError } = await adminDb.auth.getUser(token);
  if (authError || !user) return reply(401, { error: "Session admin invalide." }, origin);
  const { data: profile, error: profileError } = await adminDb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profileError || profile?.role !== "admin") return reply(403, { error: "Action réservée à l’administration." }, origin);

  let payload: { request_id?: string; decision?: string; admin_note?: string };
  try { payload = await req.json(); } catch { return reply(400, { error: "Requête invalide." }, origin); }
  if (!payload.request_id || !["approve", "reject"].includes(payload.decision || "")) {
    return reply(400, { error: "Choisissez une demande et une décision valide." }, origin);
  }
  const { data: request, error: requestError } = await adminDb.from("account_termination_requests")
    .select("id,user_id,status").eq("id", payload.request_id).maybeSingle();
  if (requestError || !request) return reply(404, { error: "Demande introuvable." }, origin);
  if (request.status === "approved" || request.status === "rejected") return reply(409, { error: "Cette demande a déjà été traitée." }, origin);

  const adminNote = String(payload.admin_note || "").trim().slice(0, 2000);
  if (payload.decision === "reject") {
    const { error } = await adminDb.from("account_termination_requests").update({
      status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user.id, admin_note: adminNote,
    }).eq("id", request.id);
    return error ? reply(500, { error: "La demande n’a pas pu être refusée." }, origin) : reply(200, { ok: true, status: "rejected" }, origin);
  }

  if (request.user_id) {
    if (request.user_id === user.id) return reply(403, { error: "Un administrateur ne peut pas résilier son propre compte depuis cette demande." }, origin);
    const { data: targetProfile, error: targetProfileError } = await adminDb.from("profiles").select("role").eq("id", request.user_id).maybeSingle();
    if (targetProfileError || targetProfile?.role !== "client") return reply(403, { error: "Seul un compte client peut être résilié depuis cette demande." }, origin);
    await adminDb.from("account_termination_requests").update({ status: "processing", reviewed_by: user.id })
      .eq("id", request.id).in("status", ["pending", "processing"]);
    const { error: deleteError } = await adminDb.auth.admin.deleteUser(request.user_id);
    if (deleteError) {
      await adminDb.from("account_termination_requests").update({ status: "pending", reviewed_by: null })
        .eq("id", request.id).eq("status", "processing");
      return reply(500, { error: "La suppression du compte a échoué; la demande reste en attente." }, origin);
    }
  }
  const { error: finishError } = await adminDb.from("account_termination_requests").update({
    user_id: null, status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: user.id, admin_note: adminNote,
  }).eq("id", request.id);
  if (finishError) return reply(500, { error: "Compte résilié; l’archivage de la demande doit être régularisé." }, origin);
  return reply(200, { ok: true, status: "approved" }, origin);
});
