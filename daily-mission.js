import{createClient}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL="https://scttowfhygcpdirrekqm.supabase.co";
const SUPABASE_ANON_KEY="sb_publishable_-ZvJjR5oRhWxGge0l-l86g_Nv0ttZLF";
const supabase=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);

window.doriCompleteDailyMission=async key=>{
  try{
    const{data,error}=await supabase.rpc("complete_daily_mission",{p_mission_key:key});
    if(error)throw error;
    console.log("🎯 일일 미션 완료:",key,data);
    return data;
  }catch(e){
    console.warn("daily mission unavailable",e);
    return null;
  }
};