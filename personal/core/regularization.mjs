import {annualBalance} from './balance.mjs';
import {overridePlan} from './dataset.mjs';
import {weekday,yearDates} from './dates.mjs';
export const POLICY=Object.freeze({version:'acta-20260513-slides-20261027-v1',advanceDays:7,dailyMinutes:480,ordinaryFullYearDays:202,contractAnnualHours:1620,compensationMonths:[2,12],source:'Acta CSD 13/05/2026, apartados 1.2–1.4, 2.1–2.4, 3.5.1–3.5.4',clarification:'Criterios confirmados por el usuario en las diapositivas MTE, 27/10/2026: días del cómputo anterior de lunes a domingo; siete del año de lunes a viernes, aunque sea festivo; peticiones sujetas a cupo.'});
const minutes=(value,label)=>{if(!Number.isSafeInteger(value)||Math.abs(value)>600000)throw Error(label+' no válido.');return value;};
export function parseAmount(value,unit='days',sign='credit'){
 const raw=String(value).trim().replace(',','.');
 if(!/^\d+(?:\.\d{1,4})?$/.test(raw))throw Error('Introduce un importe positivo con hasta cuatro decimales.');
 if(!['days','hours'].includes(unit)||!['credit','debit','zero'].includes(sign))throw Error('Unidad o naturaleza del saldo no válida.');
 const amount=Number(raw)*(unit==='days'?480:60),rounded=Math.round(amount);
 if(Math.abs(amount-rounded)>1e-7)throw Error('El importe debe poder expresarse en minutos completos.');
 return minutes(sign==='zero'?0:(sign==='debit'?-1:1)*rounded,'Saldo de 2026');
}
export function validateOptions(raw={}){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).some(k=>!['opening2026Minutes','yearlyTotals'].includes(k)))throw Error('Configuración de cómputo no válida.');
 const opening2026Minutes=raw.opening2026Minutes==null?null:minutes(raw.opening2026Minutes,'Saldo de 2026');
 const yearlyTotals={};
 if(raw.yearlyTotals!=null&&(typeof raw.yearlyTotals!=='object'||Array.isArray(raw.yearlyTotals)))throw Error('Totales anuales no válidos.');
 for(const [key,t] of Object.entries(raw.yearlyTotals??{})){
  const year=Number(key);if(!/^\d{4}$/.test(key)||year<2027||year>2100)throw Error('Año no válido.');
  if(!t||Object.keys(t).some(k=>!['baseDays','targetMinutes','reference','specialCase'].includes(k)))throw Error('Los totales no pueden modificar el grupo ni otros datos importados.');
  if(!Number.isSafeInteger(t.baseDays)||t.baseDays<0||t.baseDays>yearDates(year).length)throw Error('Número de jornadas previstas no válido.');
  if(!Number.isSafeInteger(t.targetMinutes)||t.targetMinutes<0||t.targetMinutes>600000)throw Error('Objetivo anual no válido.');
  if(typeof t.reference!=='string'||!t.reference.trim()||t.reference.length>300)throw Error('Falta la referencia del total anual.');
  yearlyTotals[year]={baseDays:t.baseDays,targetMinutes:t.targetMinutes,reference:t.reference.trim(),specialCase:t.specialCase===true};
 }
 return {opening2026Minutes,yearlyTotals};
}
export function requestBudget(opening,dailyMinutes=480){
 if(opening!=null)minutes(opening,'Saldo anterior');
 const advance=POLICY.advanceDays*dailyMinutes;
 if(opening==null)return {opening:null,advance,offset:0,previousPool:null,currentPool:null,net:null};
 const offset=Math.min(Math.max(-opening,0),advance);
 return {opening,advance,offset,previousPool:opening<0?opening+offset:opening,currentPool:advance-offset,net:opening+advance};
}
export function validateChoices(plan,year,budget){
 let previous=0,current=0;
 for(const s of plan.selections){
  if(budget.opening==null)throw Error('Introduce el saldo del cómputo de 2026 o completa el saldo inicial del año.');
  const amount=plan.dailyMinutes*(s.kind==='rest_credit'?1:-1);
  if(s.originYear===year){
   if(s.kind!=='rest_credit')throw Error('Los siete días del año son de descanso, no de trabajo por débito.');
   if([0,6].includes(weekday(s.date)))throw Error('Los días del año en curso se piden de lunes a viernes, aunque sea festivo.');
   current+=amount;
  }else previous+=amount;
 }
 if(current>(budget.currentPool??0))throw Error('La elección supera los días del año disponibles tras ajustar el saldo anterior.');
 if(previous!==0&&(budget.previousPool==null||Math.sign(previous)!==Math.sign(budget.previousPool)||Math.abs(previous)>Math.abs(budget.previousPool)))throw Error('La elección supera el saldo del año anterior pendiente o no corresponde a su naturaleza.');
 return {previous,current};
}
export function actaYear(dataset,profile,year,overrides={},opening=null,totals=null){
 let effective=profile;const imported=profile.years[year];
 if(!imported&&totals){
  effective={...profile,years:{...profile.years,[year]:{vacations:[],pfa:[],medicalRestDates:[],dailyMinutes:480,annualTargetMinutes:totals.targetMinutes,openingBalanceMinutes:opening,sourceReference:totals.reference}}};
 }else if(imported)effective={...profile,years:{...profile.years,[year]:{...imported,openingBalanceMinutes:opening}}};
 const dailyMinutes=effective.years[year]?.dailyMinutes??480,budget=requestBudget(opening,dailyMinutes);
 if(!effective.years[year])return {ready:false,year,reason:'Faltan el calendario y el plan de este año. Puedes introducir un total de jornadas para una estimación.',budget,calendarReady:false,periodsKnown:false,currentRemainingMinutes:budget.currentPool,unresolvedOpeningMinutes:budget.previousPool,netRemainingMinutes:budget.net};
 const plan=overridePlan(effective,year,overrides),chosen=validateChoices(plan,year,budget);
 const base=annualBalance(dataset,effective,year,overrides),calendarReady=base.ready;
 const priorSettled=chosen.previous-budget.offset,currentRemaining=budget.currentPool==null?null:budget.currentPool-chosen.current,previousRemaining=budget.previousPool==null?null:budget.previousPool-chosen.previous;
 const common={...base,year,budget,chosen,calendarReady,periodsKnown:Boolean(imported),previousSettledMinutes:priorSettled,currentRemainingMinutes:currentRemaining,unresolvedOpeningMinutes:previousRemaining,netRemainingMinutes:currentRemaining==null||previousRemaining==null?null:currentRemaining+previousRemaining,manualTotals:Boolean(totals),plan:base.plan??plan};
 if(totals?.specialCase)return {...common,ready:false,excludedCase:true,currentBalanceMinutes:null,projectedNextYearMinutes:null,reason:'Este caso requiere su regularización específica; el acta lo separa del cómputo anual ordinario. No se calcula un arrastre automático.'};
 if(!calendarReady&&!totals)return {...common,ready:false};
 // Aggregate entries describe work BEFORE regularization. Calendar entries use the actual
 // planned work, with previous credits/debits and current advances identified separately.
 const workMinutes=totals?totals.baseDays*dailyMinutes-chosen.previous-chosen.current:base.workMinutes;
 const ordinaryReference=!totals&&base.annualTargetMinutes==null&&dailyMinutes===POLICY.dailyMinutes;
 const target=totals?totals.targetMinutes:(base.annualTargetMinutes??(ordinaryReference?POLICY.ordinaryFullYearDays*dailyMinutes:null));
 const raw=target==null?null:workMinutes-target;
 // Current-year advances have already been issued: unused ones must not be generated
 // again as a new credit. Prior compensation, including netting, is also kept separate.
 const unconsumedAdvance=budget.advance-budget.offset-chosen.current;
 const generated=raw==null?null:raw+priorSettled-unconsumedAdvance;
 return {...common,ready:true,workMinutes,plannedWorkDays:workMinutes/dailyMinutes,baseWorkDays:totals?totals.baseDays:base.baseWorkDays,annualTargetMinutes:target,rawDifferenceMinutes:raw,priorCompensationMinutes:priorSettled,unissuedAgainMinutes:unconsumedAdvance,currentBalanceMinutes:generated,projectedNextYearMinutes:generated,advanceMinutes:budget.advance,targetOrigin:totals?'declared':ordinaryReference?'ordinary_reference':'imported',calculationReference:totals?.reference??(ordinaryReference?'Referencia ordinaria MTE de 202 jornadas completas, sin situaciones especiales.':plan.sourceReference)};
}
export function actaLedger(dataset,profile,overrides={},lastYear=2028,rawOptions={}){
 const options=validateOptions(rawOptions),results=[];
 for(let year=2027;year<=lastYear;year++){
  const previous=results.at(-1)?.projectedNextYearMinutes??null,imported=profile.years[year]?.openingBalanceMinutes??null;
  const opening=year===2027?(options.opening2026Minutes??imported):(imported??previous);
  let r;try{r=actaYear(dataset,profile,year,overrides[year]??{},opening,options.yearlyTotals[year]??null);}catch(error){r={ready:false,year,invalidPlan:true,reason:error.message,budget:requestBudget(opening)}}
  r.projectedFromPreviousYear=previous;r.openingOrigin=year===2027&&options.opening2026Minutes!==null?'user':imported!==null?'imported':previous!==null?'projection':'pending';results.push(r);
 }
 return results;
}
