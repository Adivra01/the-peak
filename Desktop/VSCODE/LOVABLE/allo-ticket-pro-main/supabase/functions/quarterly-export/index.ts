import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "npm:xlsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_drive";
const DEFAULT_FOLDER_ID = "1AO_n9F8HAus9Gv4PTc0EgbxdM9jowYOZ";

/* ─── Drive upload via Lovable connector gateway ─────────────────────────── */

async function uploadToDrive(
  fileName: string,
  buffer: Uint8Array,
  folderId: string
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const connKey    = Deno.env.get("GOOGLE_DRIVE_API_KEY");

  if (!lovableKey || !connKey) {
    throw new Error(
      "LOVABLE_API_KEY ou GOOGLE_DRIVE_API_KEY manquant. " +
      "Connecte Google Drive dans le dashboard Lovable : https://lovable.dev/dashboard?connectors"
    );
  }

  const mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const boundary = "atp_" + crypto.randomUUID().replace(/-/g, "");
  const enc = new TextEncoder();

  const metaJson = JSON.stringify({ name: fileName, parents: [folderId], mimeType });
  const part1 = enc.encode(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metaJson}\r\n` +
    `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`
  );
  const part2 = enc.encode(`\r\n--${boundary}--`);

  const body = new Uint8Array(part1.length + buffer.length + part2.length);
  body.set(part1, 0);
  body.set(buffer, part1.length);
  body.set(part2, part1.length + buffer.length);

  const res = await fetch(
    `${GATEWAY_URL}/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": connKey,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drive upload failed [${res.status}]: ${text}`);
  }

  const result = await res.json();
  console.log(`Uploaded ${fileName} → Drive ID: ${result.id}`);
  return result;
}

/* ─── Quarter helpers ────────────────────────────────────────────────────── */

interface Quarter {
  start: Date;
  end: Date;
  label: string;
}

function getPreviousQuarter(now = new Date()): Quarter {
  const month = now.getMonth();
  const year  = now.getFullYear();
  let q = Math.floor(month / 3) - 1;
  let y = year;
  if (q < 0) { q = 3; y = year - 1; }
  const start = new Date(y, q * 3, 1);
  const end   = new Date(y, q * 3 + 3, 1);
  return { start, end, label: `${y}-T${q + 1}` };
}

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function fmtDateTime(iso: string) {
  return iso ? new Date(iso).toLocaleString("fr-FR") : "";
}

/* ─── Excel builder ──────────────────────────────────────────────────────── */

function buildExcel(
  periodLabel: string,
  tickets: any[],
  managerMap: Map<string, string>,
  managerPhoneMap: Map<string, string>,
  organizerMap: Map<string, string>,
  eventMap: Map<string, string>
): Uint8Array {
  const wb = XLSX.utils.book_new();

  const mgrName  = (id: string | null) => (id ? (managerMap.get(id)  ?? "Inconnu") : "");
  const mgrPhone = (id: string | null) => (id ? (managerPhoneMap.get(id) ?? "") : "");
  const evtName  = (id: string)        => eventMap.get(id) ?? id;
  const orgName  = (id: string)        => organizerMap.get(id) ?? "";

  const gTickets = tickets.filter((t) => !!t.manager_id);

  // ── Sheet 1 : Gestionnaires
  const gHeaders = [
    "Gestionnaire", "Tél. gestionnaire", "Événement", "Code billet",
    "Prénom client", "Nom client", "Téléphone client", "Email client",
    "Catégorie", "Montant (FCFA)", "Statut", "Date & heure d'achat",
  ];
  const gRows = gTickets.map((t) => [
    mgrName(t.manager_id), mgrPhone(t.manager_id), evtName(t.event_id),
    t.ticket_code ?? "", t.customer_first_name ?? "", t.customer_last_name ?? "",
    t.customer_phone ?? "", t.customer_email ?? "", t.ticket_type_name ?? "",
    Number(t.price_paid), t.status ?? "", fmtDateTime(t.purchased_at),
  ]);
  const wsG = XLSX.utils.aoa_to_sheet([gHeaders, ...gRows]);
  wsG["!cols"] = gHeaders.map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(wb, wsG, "Gestionnaires");

  // ── Sheet 2 : Admin
  const aHeaders = [
    "Code billet", "Événement", "Catégorie", "Prénom client", "Nom client",
    "Téléphone client", "Email client", "Montant (FCFA)", "Canal",
    "Gestionnaire", "Tél. gestionnaire", "Statut", "Date & heure d'achat",
  ];
  const aRows = tickets.map((t) => [
    t.ticket_code ?? "", evtName(t.event_id), t.ticket_type_name ?? "",
    t.customer_first_name ?? "", t.customer_last_name ?? "",
    t.customer_phone ?? "", t.customer_email ?? "", Number(t.price_paid),
    t.manager_id ? "Gestionnaire" : "Client direct",
    mgrName(t.manager_id), mgrPhone(t.manager_id), t.status ?? "", fmtDateTime(t.purchased_at),
  ]);
  const wsA = XLSX.utils.aoa_to_sheet([aHeaders, ...aRows]);
  wsA["!cols"] = aHeaders.map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(wb, wsA, "Admin");

  // ── Sheet 3 : Organisateurs
  const oHeaders = [
    "Organisateur", "Événement", "Code billet", "Prénom client", "Nom client",
    "Téléphone client", "Email client", "Montant (FCFA)", "Canal", "Gestionnaire",
    "Statut", "Date & heure d'achat",
  ];
  const oRows = tickets.map((t) => [
    orgName(t.event_id), evtName(t.event_id), t.ticket_code ?? "",
    t.customer_first_name ?? "", t.customer_last_name ?? "",
    t.customer_phone ?? "", t.customer_email ?? "", Number(t.price_paid),
    t.manager_id ? "Gestionnaire" : "Client direct",
    mgrName(t.manager_id), t.status ?? "", fmtDateTime(t.purchased_at),
  ]);
  const wsO = XLSX.utils.aoa_to_sheet([oHeaders, ...oRows]);
  wsO["!cols"] = oHeaders.map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(wb, wsO, "Organisateurs");

  // ── Sheet 4 : Stats globales
  const evtStats = new Map<string, {
    event: string; organizer: string;
    total: number; revenue: number; direct: number; viaManager: number;
    managers: Set<string>;
  }>();
  tickets.forEach((t) => {
    const s = evtStats.get(t.event_id) ?? {
      event: evtName(t.event_id), organizer: orgName(t.event_id),
      total: 0, revenue: 0, direct: 0, viaManager: 0, managers: new Set<string>(),
    };
    s.total += 1;
    s.revenue += Number(t.price_paid);
    if (t.manager_id) { s.viaManager += 1; s.managers.add(t.manager_id); }
    else               { s.direct += 1; }
    evtStats.set(t.event_id, s);
  });

  const mgrStats = new Map<string, { name: string; phone: string; total: number; revenue: number; events: Set<string> }>();
  gTickets.forEach((t) => {
    const id = t.manager_id as string;
    const s = mgrStats.get(id) ?? { name: mgrName(id), phone: mgrPhone(id), total: 0, revenue: 0, events: new Set<string>() };
    s.total += 1;
    s.revenue += Number(t.price_paid);
    s.events.add(t.event_id);
    mgrStats.set(id, s);
  });

  const sHeaders = [
    "Période", "Événement", "Organisateur", "Total billets", "CA total (FCFA)",
    "Billets directs", "Via gestionnaire", "Nbre gestionnaires distincts",
  ];
  const sRows: (string | number)[][] = [];
  evtStats.forEach((s) => {
    sRows.push([periodLabel, s.event, s.organizer, s.total, s.revenue, s.direct, s.viaManager, s.managers.size]);
  });
  const totalBillets = tickets.length;
  const totalRevenue = tickets.reduce((acc, t) => acc + Number(t.price_paid), 0);
  const totalDirect  = tickets.filter((t) => !t.manager_id).length;
  sRows.push(["TOTAL", "", "", totalBillets, totalRevenue, totalDirect, gTickets.length, mgrStats.size]);

  const wsS = XLSX.utils.aoa_to_sheet([sHeaders, ...sRows]);
  wsS["!cols"] = sHeaders.map(() => ({ wch: 26 }));

  const mgrSHeaders = ["", "Gestionnaire", "Téléphone", "Total billets", "CA total (FCFA)", "Événements couverts"];
  const mgrSRows = Array.from(mgrStats.values())
    .sort((a, b) => b.total - a.total)
    .map((s) => ["", s.name, s.phone, s.total, s.revenue, s.events.size]);
  XLSX.utils.sheet_add_aoa(wsS, [mgrSHeaders, ...mgrSRows], { origin: { r: sRows.length + 3, c: 0 } });
  XLSX.utils.book_append_sheet(wb, wsS, "Stats_globales");

  return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as Uint8Array;
}

/* ─── Main handler ───────────────────────────────────────────────────────── */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    // Accept params from body (preferred) or URL query string (legacy)
    const bodyRaw = await req.json().catch(() => ({}));
    const url     = new URL(req.url);
    const dryRun     = bodyRaw?.dry  === true || url.searchParams.get("dry")  === "true";
    const fullExport = bodyRaw?.full === true || url.searchParams.get("full") === "true";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const folderId = Deno.env.get("GOOGLE_DRIVE_FOLDER_ID") ?? DEFAULT_FOLDER_ID;

    /* 1. Période */
    let quarter: Quarter;
    if (fullExport) {
      quarter = { start: new Date("2020-01-01"), end: new Date(), label: `COMPLET_${fmtDate(new Date())}` };
    } else {
      quarter = getPreviousQuarter();
    }
    const { start, end, label: periodLabel } = quarter;
    const startIso = start.toISOString();
    const endIso   = end.toISOString();

    console.log(`Export ${periodLabel}: ${startIso} → ${endIso} | dry=${dryRun}`);

    /* 2. Tickets de la période (non-anonymisés) */
    const { data: tickets, error: ticketsErr } = await supabase
      .from("tickets")
      .select(`
        id, ticket_code,
        customer_first_name, customer_last_name, customer_phone, customer_email,
        price_paid, status, manager_id, purchased_at,
        event_id, ticket_type_id,
        ticket_types(name)
      `)
      .gte("purchased_at", startIso)
      .lt("purchased_at", endIso)
      .neq("customer_first_name", "ANONYMISÉ")
      .order("purchased_at", { ascending: true });

    if (ticketsErr) throw ticketsErr;

    const ticketList = (tickets ?? []).map((t: any) => ({
      ...t,
      ticket_type_name: t.ticket_types?.name ?? "",
    }));

    if (ticketList.length === 0) {
      return json({ message: "Aucune donnée à exporter pour cette période.", period: periodLabel, tickets: 0 });
    }

    /* 3. Noms des gestionnaires */
    const mgrIds = [...new Set(ticketList.filter((t: any) => t.manager_id).map((t: any) => t.manager_id as string))];
    const managerMap      = new Map<string, string>();
    const managerPhoneMap = new Map<string, string>();

    if (mgrIds.length > 0) {
      const { data: mgrs } = await supabase
        .from("manager_requests")
        .select("user_id, full_name, phone")
        .in("user_id", mgrIds)
        .eq("status", "approved");
      (mgrs ?? []).forEach((m: any) => {
        managerMap.set(m.user_id, m.full_name ?? "Gestionnaire");
        managerPhoneMap.set(m.user_id, m.phone ?? "");
      });
    }

    /* 4. Noms des événements */
    const eventIds = [...new Set(ticketList.map((t: any) => t.event_id as string))];
    const eventMap = new Map<string, string>();

    if (eventIds.length > 0) {
      const { data: evts } = await supabase.from("events").select("id, name").in("id", eventIds);
      (evts ?? []).forEach((e: any) => eventMap.set(e.id, e.name));
    }

    /* 5. Noms des organisateurs par événement */
    const organizerMap = new Map<string, string>();
    if (eventIds.length > 0) {
      const { data: orgEvts } = await supabase
        .from("organizer_events")
        .select("event_id, organizer_id")
        .in("event_id", eventIds);

      if (orgEvts && orgEvts.length > 0) {
        const orgIds = [...new Set(orgEvts.map((o: any) => o.organizer_id as string))];
        const { data: orgReqs } = await supabase
          .from("organizer_requests")
          .select("user_id, full_name")
          .in("user_id", orgIds)
          .eq("status", "approved");
        const orgNameMap = new Map<string, string>();
        (orgReqs ?? []).forEach((o: any) => orgNameMap.set(o.user_id, o.full_name ?? "Organisateur"));
        orgEvts.forEach((oe: any) => {
          if (!organizerMap.has(oe.event_id)) {
            organizerMap.set(oe.event_id, orgNameMap.get(oe.organizer_id) ?? "");
          }
        });
      }
    }

    /* 6. Génération Excel */
    const excelBuffer = buildExcel(periodLabel, ticketList, managerMap, managerPhoneMap, organizerMap, eventMap);

    /* 7. Upload vers Google Drive + log data_exports */
    let driveLink: string | undefined;
    let fileName = "";
    if (!dryRun) {
      const today = fmtDate(new Date());
      fileName = `AlloTicketPro_Export_${periodLabel}_${today}.xlsx`;
      let exportStatus = "success";
      let exportError: string | null = null;

      try {
        const uploaded = await uploadToDrive(fileName, excelBuffer, folderId);
        driveLink = uploaded.webViewLink;
      } catch (uploadErr: any) {
        exportStatus = "error";
        exportError  = uploadErr.message;
        console.error("Drive upload error:", uploadErr);
      }

      await supabase.from("data_exports").insert({
        export_type:   fullExport ? "complet" : "trimestriel",
        period_start:  fmtDate(start),
        period_end:    fmtDate(end),
        rows_exported: ticketList.length,
        file_name:     fileName,
        file_url:      driveLink ?? null,
        status:        exportStatus,
        error_message: exportError,
        anonymized:    false,
      });

      if (exportStatus === "error") {
        return json({ success: false, error: exportError, tickets: ticketList.length });
      }
    }

    /* 8. Anonymisation RGPD */
    if (!dryRun) {
      const ticketIds = ticketList.map((t: any) => t.id);

      const { error: anonTicketsErr } = await supabase
        .from("tickets")
        .update({
          customer_first_name: "ANONYMISÉ",
          customer_last_name:  "ANONYMISÉ",
          customer_phone:      null,
          customer_email:      null,
        })
        .in("id", ticketIds);
      if (anonTicketsErr) console.error("Anonymization error (tickets):", anonTicketsErr);

      const { error: anonTxErr } = await supabase
        .from("payment_transactions")
        .update({
          customer_first_name: "ANONYMISÉ",
          customer_last_name:  "ANONYMISÉ",
          customer_phone:      "0000000000",
          customer_email:      null,
        })
        .gte("created_at", startIso)
        .lt("created_at", endIso)
        .neq("customer_first_name", "ANONYMISÉ");
      if (anonTxErr) console.error("Anonymization error (transactions):", anonTxErr);

      // Mark export as anonymized
      await supabase
        .from("data_exports")
        .update({ anonymized: true })
        .eq("period_start", fmtDate(start))
        .eq("period_end", fmtDate(end))
        .eq("status", "success");

      console.log(`RGPD: ${ticketIds.length} billets anonymisés pour ${periodLabel}`);
    }

    return json({
      success:   true,
      period:    periodLabel,
      tickets:   ticketList.length,
      dry_run:   dryRun,
      drive_url: driveLink ?? null,
      message:   dryRun
        ? "Dry-run OK — aucun upload ni anonymisation."
        : `Export ${periodLabel} → Google Drive. ${ticketList.length} billets anonymisés.`,
    });
  } catch (error: any) {
    console.error("quarterly-export error:", error);
    return json({ error: error.message }, 500);
  }
});
