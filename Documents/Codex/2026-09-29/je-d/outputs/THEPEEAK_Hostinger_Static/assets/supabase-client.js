(() => {
  const config=window.THE_PEAK_SUPABASE;
  if(!config?.url||!config?.publishableKey||!window.supabase?.createClient)throw new Error('Configuration Supabase manquante.');
  const projectRef=new URL(config.url).hostname.split('.')[0];
  const storageKey=`sb-${projectRef}-auth-token`;
  window.peakSupabase=window.supabase.createClient(config.url,config.publishableKey,{auth:{storageKey,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  window.peakSignOut=async()=>{
    const signOut=window.peakSupabase.auth.signOut({scope:'local'}).catch(()=>null);
    try{localStorage.removeItem(storageKey)}catch{}
    try{sessionStorage.removeItem(storageKey)}catch{}
    await Promise.race([signOut,new Promise(resolve=>setTimeout(resolve,500))]);
  };
})();
