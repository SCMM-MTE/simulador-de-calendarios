import {yearDates,inRanges,weekday} from './dates.mjs';
import {overridePlan} from './dataset.mjs';
export const ACTA={minimumWeekdayRest:7,ordinaryDailyMinutes:480,year:2027,annualReferenceMinutes:1620*60,compensationWindow:{start:'02-01',end:'12-31'},reference:'Acta CSD 13/05/2026, apartados 1.1, 1.2, 1.4, 2.1–2.4 y 3.5'};
export function papQuotaDecember31(date) {
  if(!/^\d{4}-12-31$/.test(date))return null;
  return weekday(date)===0?37:55;
}
export function annualBalance(dataset,profile,year,overrides={}) {
  const original=profile?.years?.[year],calendar=dataset?.calendars?.[year];
  if(!original)return {ready:false,year,reason:'Faltan las vacaciones/PFA y el objetivo anual de este DNE.'};
  const plan=overridePlan(profile,year,overrides),medicalRests=new Set(plan.medicalRestDates??[]);
  const missing=profile.restGroup==null?'Falta el grupo de descanso importado. No se puede elegir manualmente.':!calendar?.groups?.[profile.restGroup]?'Falta el calendario de descansos de este año y grupo.':null;
  if(missing){
    if(plan.selections.length)throw Error(missing+' No se pueden validar elecciones todavía.');
    return {ready:false,periodsReady:true,year,reason:missing,plan,restGroup:profile.restGroup,daily:yearDates(year).map(date=>({date,weekday:weekday(date),rest:null,medicalRest:medicalRests.has(date),vacation:inRanges(date,plan.vacations),pfa:inRanges(date,plan.pfa),holiday:calendar?.holidays?.includes(date)??false,selection:null}))};
  }
  const rests=new Set(calendar.groups[profile.restGroup]),holidays=new Set(calendar.holidays),selected=new Map(plan.selections.map(s=>[s.date,s]));
  let workMinutes=0,priorCompensation=0,currentRestDays=0,currentWeekdayRests=0,baseWorkDays=0,plannedWorkDays=0;
  const daily=yearDates(year).map(date=>{
    const rest=rests.has(date),vacation=inRanges(date,plan.vacations),pfa=inRanges(date,plan.pfa),medicalRest=medicalRests.has(date),selection=selected.get(date);
    if(selection){
      if(vacation||pfa||medicalRest)throw Error('No se puede elegir regularización dentro de vacaciones, PFA o descanso R.M.');
      if(selection.date.slice(5)<'02-01')throw Error('La elección ordinaria de regularización se realiza de febrero a diciembre.');
      if(selection.kind==='rest_credit'&&rest)throw Error('El día seleccionado ya es descanso del grupo fijo.');
      if(selection.kind==='work_debit'&&!rest)throw Error('Para trabajar por débito elige un día de descanso.');
      if(selection.originYear===year-1){
        const opening=original.openingBalanceMinutes;
        if(opening==null||opening===0||(selection.kind==='rest_credit'?opening<0:opening>0))throw Error('La elección no corresponde a la naturaleza del saldo anterior.');
        priorCompensation+=(selection.kind==='rest_credit'?1:-1)*plan.dailyMinutes;
      }
      else if(selection.kind==='rest_credit'){currentRestDays++;if(weekday(date)>=1&&weekday(date)<=5)currentWeekdayRests++;}
    }
    const baseWork=!rest&&!vacation&&!pfa&&!medicalRest;
    if(baseWork)baseWorkDays++;
    const work=selection?selection.kind==='work_debit':baseWork;
    if(work){plannedWorkDays++;workMinutes+=plan.dailyMinutes;}
    return {date,weekday:weekday(date),rest,medicalRest,vacation,pfa,holiday:holidays.has(date),baseWork,work,selection:selection??null};
  });
  const opening=original.openingBalanceMinutes;
  if(priorCompensation!==0&&(opening==null||Math.sign(priorCompensation)!==Math.sign(opening)||Math.abs(priorCompensation)>Math.abs(opening)))throw Error('La compensación elegida supera el saldo inicial importado o no corresponde a su naturaleza.');
  const rawDifference=plan.annualTargetMinutes==null?null:workMinutes-plan.annualTargetMinutes;
  // A rest compensating a previous year cannot create another debit in the new year.
  const currentBalance=rawDifference==null?null:rawDifference+priorCompensation;
  const remainingOpening=opening==null?null:opening-priorCompensation;
  return {ready:true,year,daily,plan,restGroup:profile.restGroup,workMinutes,baseWorkDays,plannedWorkDays,medicalRestDays:daily.filter(d=>d.medicalRest).length,restDays:daily.filter(d=>d.rest).length,vacationWorkDays:daily.filter(d=>d.vacation&&!d.rest).length,pfaWorkDays:daily.filter(d=>d.pfa&&!d.rest).length,annualTargetMinutes:plan.annualTargetMinutes,openingBalanceMinutes:opening,priorCompensationMinutes:priorCompensation,unresolvedOpeningMinutes:remainingOpening,currentBalanceMinutes:currentBalance,projectedNextYearMinutes:currentBalance,currentRestDays,currentWeekdayRests,sourceReference:original.sourceReference,calendarReference:calendar.sourceReference};
}
export function yearLedger(dataset,profile,overridesByYear={},lastYear=2028) {
  const results=[];
  for(let year=2027;year<=lastYear;year++){
    const previous=results.at(-1)?.projectedNextYearMinutes??null;
    const original=profile.years[year];
    const projectedOpening=original!=null&&original.openingBalanceMinutes==null&&previous!=null;
    const effective=projectedOpening?{...profile,years:{...profile.years,[year]:{...original,openingBalanceMinutes:previous}}}:profile;
    let result;
    try{result=annualBalance(dataset,effective,year,overridesByYear[year]??{});}
    catch(error){result={ready:false,year,invalidPlan:true,reason:error.message};}
    result.projectedFromPreviousYear=previous;
    result.openingOrigin=projectedOpening?'projection':'imported';
    results.push(result);
  }
  return results;
}
export function amount(minutes,dailyMinutes=480) {
  if(minutes==null)return 'Pendiente';
  const sign=minutes<0?'−':minutes>0?'+':'',abs=Math.abs(minutes),days=Math.floor(abs/dailyMinutes),remainder=abs% dailyMinutes;
  const hours=Math.floor(remainder/60),mins=remainder%60;
  return `${sign}${days} d${hours?' '+hours+' h':''}${mins?' '+mins+' min':''}`;
}
