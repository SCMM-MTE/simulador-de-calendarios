// Retire only the old nominal roster, preserving unrelated legacy settings.
export function retireLegacyRoster(storage){
 for(const key of ['scmm_portal_config_v1','scmmConfig']){
  try{
   const saved=storage.getItem(key);if(!saved)continue;
   const raw=JSON.parse(saved);let changed=false;
   for(const candidate of [raw,raw?.config,raw?.state?.config]){
    if(!candidate||typeof candidate!=='object')continue;
    for(const field of ['rotationDneList','rotationDneFileName'])if(Object.hasOwn(candidate,field)){delete candidate[field];changed=true;}
   }
   if(changed)storage.setItem(key,JSON.stringify(raw));
  }catch{/* Unavailable storage never blocks a private simulation. */}
 }
}
