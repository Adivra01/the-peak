(() => {
  const config=window.THE_PEAK_SUPABASE;
  if(!config?.url||!config?.publishableKey||!window.supabase?.createClient)throw new Error('Configuration Supabase manquante.');
  window.peakSupabase=window.supabase.createClient(config.url,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
})();
