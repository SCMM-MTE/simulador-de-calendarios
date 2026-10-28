import {weekday} from './dates.mjs';
export function automaticChoice(day,year,current,previous,dailyMinutes=480){
 if(day.vacation||day.pfa||day.medicalRest||day.date.slice(5)<'02-01')return null;
 if(!day.rest){
  if(![0,6].includes(weekday(day.date))&&current>=dailyMinutes)return {date:day.date,kind:'rest_credit',originYear:year};
  if(previous>=dailyMinutes)return {date:day.date,kind:'rest_credit',originYear:year-1};
 }else if(previous<=-dailyMinutes)return {date:day.date,kind:'work_debit',originYear:year-1};
 return null;
}
export function allocateChoices(dates,daily,year,budget,dailyMinutes=480){
 let current=budget.currentPool,previous=budget.previousPool;
 return dates.map(date=>{
  const day=daily.find(d=>d.date===date),choice=day&&automaticChoice(day,year,current,previous,dailyMinutes);
  if(!choice)throw Error('No hay jornadas disponibles para esa fecha.');
  if(choice.originYear===year)current-=dailyMinutes;else previous-=choice.kind==='rest_credit'?dailyMinutes:-dailyMinutes;
  return choice;
 });
}
