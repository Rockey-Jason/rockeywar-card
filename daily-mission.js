import{createClient}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL="https://scttowfhygcpdirrekqm.supabase.co";
const SUPABASE_ANON_KEY="sb_publishable_-ZvJjR5oRhWxGge0l-l86g_Nv0ttZLF";
const supabase=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);

window.doriCompleteDailyMission=async key=>{
  try{
    const{data:sessionData,error:sessionError}=await supabase.auth.getSession();
    if(sessionError)throw sessionError;
    if(!sessionData?.session){
      console.warn("🎯 일일 미션 실패: 로그인 세션이 없습니다.");
      return{completed:false,error:"AUTH_REQUIRED"};
    }
    const{data,error}=await supabase.rpc("complete_daily_mission",{p_mission_key:key});
    if(error){
      console.error("🎯 일일 미션 RPC 오류:",error);
      return{completed:false,error:error.message||String(error),details:error};
    }
    console.log("🎯 일일 미션 완료:",key,data);
    window.dispatchEvent(new CustomEvent("dori:daily-mission-completed",{detail:data}));
    return data;
  }catch(e){
    console.error("🎯 일일 미션 처리 실패:",e);
    return{completed:false,error:e?.message||String(e)};
  }
};