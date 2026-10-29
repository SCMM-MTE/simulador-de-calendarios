import {dne} from './rotation.mjs';
import {profileFor,validateDataset} from './dataset.mjs';
import {periodCatalog} from './periods-2027.mjs';
export const REST_GROUPS=[1,2,3,4,'1N','2N','3N','4N','SDF'];
export const groupLabel=g=>g==='SDF'?'SDF':g==null?'Pendiente':`GR${g}`;
export function enroll(dataset,id,group,periodCode){
 id=dne(id);const original=profileFor(dataset,id);
 const profile=original?structuredClone(original):{dne:id,seniorityRank:null,restGroup:null,years:{}};
 if(profile.restGroup==null){
  const selected=REST_GROUPS.find(g=>String(g)===String(group));
  if(selected===undefined)throw Error('Elige tu grupo de descanso de 2027.');
  profile.restGroup=selected;
 }
 const plan=profile.years[2027];
 if(!plan||(!plan.vacations.length&&!plan.pfa.length)){
  const period=periodCatalog.periods.find(p=>p.code===periodCode);
  if(!period)throw Error('Elige tu periodo de vacaciones y PFA de 2027.');
  profile.years[2027]={vacations:period.vacations,pfa:period.pfa,medicalRestDates:period.medicalRestDate?[period.medicalRestDate]:[],periodLabel:period.code,dailyMinutes:480,annualTargetMinutes:null,openingBalanceMinutes:null,sourceReference:'Periodo del documento 2027 elegido por el usuario; sin preasignación documental para este DNE.'};
 }
 // Use the same validation for imported and user-declared profiles.
 return validateDataset({...dataset,entries:[profile]}).entries[0];
}
