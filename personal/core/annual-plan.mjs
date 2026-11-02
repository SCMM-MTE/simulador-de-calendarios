import {periodCatalog} from './periods-2027.mjs';
import {yearDates,weekday} from './dates.mjs';
const groups=[1,2,3,4,'1N','2N','3N','4N','SDF'];
export function validateYearPlans(raw={}){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Planes anuales no válidos.');
 const plans={};
 for(const [key,p] of Object.entries(raw)){
  const year=Number(key);
  if(!/^\d{4}$/.test(key)||year<2027||year>2100||!p||Object.keys(p).some(k=>!['restGroup','periodCode','projection'].includes(k)))throw Error('Plan anual no válido.');
  const restGroup=groups.find(g=>String(g)===String(p.restGroup));
  if(restGroup===undefined||!['original',...periodCatalog.periods.map(p=>p.code)].includes(p.periodCode)||typeof p.projection!=='boolean')throw Error('Elige un grupo y un periodo válidos.');
  plans[year]={restGroup,periodCode:p.periodCode,projection:p.projection};
 }
 return plans;
}
const shift=(date,year)=>`${year}${date.slice(4)}`;
export function annualScenario(dataset,profile,rawPlans={}){
 const plans=validateYearPlans(rawPlans),years={...profile.years},calendars={...dataset.calendars},restGroups={};
 for(const [key,choice] of Object.entries(plans)){
  const year=Number(key),original=profile.years[year];restGroups[year]=choice.restGroup;
  if(choice.periodCode==='original'){
   if(!original)throw Error('No hay periodos preasignados para ese año.');
  }else{
   const period=periodCatalog.periods.find(p=>p.code===choice.periodCode);
   if(year!==periodCatalog.year&&!choice.projection)throw Error('Este periodo solo está publicado para 2027. Marca la proyección para simular otro año.');
   years[year]={...(original??{}),vacations:period.vacations.map(r=>({start:shift(r.start,year),end:shift(r.end,year)})),pfa:period.pfa.map(r=>({start:shift(r.start,year),end:shift(r.end,year)})),
    medicalRestDates:original?.medicalRestDates??[shift(period.medicalRestDate,year)],dailyMinutes:original?.dailyMinutes??480,
    annualTargetMinutes:original?.annualTargetMinutes??null,openingBalanceMinutes:original?.openingBalanceMinutes??null,
    periodLabel:`Grupo ${period.code}${year!==2027?' · proyección de fechas 2027':''}`,
    sourceReference:year===2027?'Grupo del catálogo de vacaciones 2027 elegido para esta simulación.':`Escenario ${year}: mismos días y meses del grupo ${period.code} de 2027. No es una asignación oficial de ${year}.`};
  }
  if(!calendars[year]?.groups?.[choice.restGroup]&&choice.projection){
   const reference=dataset.calendars[2027],dates=yearDates(year),seed=reference?.groups?.[choice.restGroup];
   if(!seed)continue;
   let rests;
   if(choice.restGroup==='SDF')rests=dates.filter(d=>[0,6].includes(weekday(d))||calendars[year]?.holidays?.includes(d));
   else{
    const all=yearDates(2027),set=new Set(seed),pattern=all.slice(0,28).map(d=>set.has(d));
    if(!all.every((d,i)=>set.has(d)===pattern[i%28]))throw Error('No se ha verificado un ciclo de 28 días para este grupo.');
    const anchor=Date.UTC(2027,0,1);rests=dates.filter(d=>pattern[Math.round((Date.parse(d+'T00:00:00Z')-anchor)/86400000)%28]);
   }
   const current=calendars[year]??{};
   calendars[year]={...current,groups:{...current.groups,[choice.restGroup]:rests},holidays:current.holidays??[],verified:false,
    sourceReference:choice.restGroup==='SDF'?`Simulación SDF ${year}: fines de semana y festivos del año cargados, si existen. No se inventan ni trasladan festivos de 2027.`:`Proyección continua del ciclo de 28 días del grupo ${choice.restGroup}, anclado al 01/01/2027. No es calendario oficial de ${year}.`};
  }
 }
 return {dataset:{...dataset,calendars},profile:{...profile,years},restGroups};
}
