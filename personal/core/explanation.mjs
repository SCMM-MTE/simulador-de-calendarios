import {automaticChoice} from './automatic-choices.mjs';
import {parseDate,weekday} from './dates.mjs';

export const daysText=value=>value==null?'Pendiente':new Intl.NumberFormat('es-ES',{maximumFractionDigits:4}).format(value);
export function balanceExplanation(result,year){
 const r=result??{},daily=r.plan?.dailyMinutes??480,b=r.budget??{};
 const base=r.baseWorkDays??null,target=r.annualTargetMinutes==null?null:r.annualTargetMinutes/daily;
 const generated=r.projectedNextYearMinutes==null?null:r.projectedNextYearMinutes/daily;
 const opening=b.opening==null?null:b.opening/daily;
 return {year,previousYear:year-1,nextYear:year+1,opening,generated,base,target,
  currentRemaining:r.currentRemainingMinutes==null?null:r.currentRemainingMinutes/daily,
  previousRemaining:r.unresolvedOpeningMinutes==null?null:r.unresolvedOpeningMinutes/daily,
  offset:(b.offset??0)/daily,
  formula:r.ready&&base!=null&&target!=null&&generated!=null?`${daysText(base)} − ${daysText(target)} − ${daysText((b.advance??0)/daily)} = ${daysText(generated)}`:null,
  explanation:!r.ready?(r.reason??'Completa los datos del año para calcular el saldo nuevo.'):opening==null?'El saldo anterior todavía está pendiente.':opening<0?`El débito de ${year-1} se compensa aparte. ${daysText((b.offset??0)/daily)} de los siete días se utilizan para compensarlo.`:`Los descansos que compensan ${year-1} se cuentan aparte. No aumentan ni reducen el saldo nuevo de ${year}.`,
  outcome:generated==null?'Faltan datos para calcularlo.':generated>0?`${daysText(generated)} jornadas nuevas de crédito para regularizar en ${year+1}.`:generated<0?`${daysText(Math.abs(generated))} jornadas nuevas de débito para regularizar en ${year+1}.`:'El año cierra sin crédito ni débito nuevo.'};
}
export function explainDate(date,result,year){
 try{parseDate(date);}catch{return {allowed:false,title:'Elige una fecha válida',text:'Introduce una fecha del calendario para conocer su naturaleza.'};}
 if(!date.startsWith(year+'-'))return {allowed:false,title:'Otro año',text:`Selecciona una fecha de ${year}, el año que estás simulando.`};
 const r=result??{},day=r.daily?.find(d=>d.date===date);
 if(day?.selection){const origin=day.selection.originYear;return {allowed:true,selected:true,origin,title:day.selection.kind==='work_debit'?`Trabajo para compensar ${origin}`:`Descanso con un día de ${origin}`,text:origin===year?`Consume un día del año en curso. ${day.holiday?'Aunque sea festivo, cae entre lunes y viernes. ':''}Puedes pulsarlo de nuevo para retirar la elección.`:`Compensa el saldo anterior. Esta compensación se separa del cómputo nuevo de ${year}. Puedes pulsarlo de nuevo para retirarla.`};}
 if(date.slice(5)<'02-01')return {allowed:false,title:'Enero queda fuera del periodo ordinario',text:'Los saldos anteriores se compensan del 1 de febrero al 31 de diciembre. Los traslados excepcionales a enero siguen otro procedimiento.'};
 if(day?.vacation||day?.pfa||day?.medicalRest)return {allowed:false,title:day.vacation?'Vacaciones':day.pfa?'Fiestas agrupadas':'Descanso por reconocimiento médico',text:'Este día ya tiene su propia naturaleza. No consume los siete días ni un crédito anterior.'};
 if(!r.ready||!r.calendarReady||!day)return {allowed:false,title:'Faltan datos para elegir',text:r.reason??'Completa el calendario y el saldo anterior. La ausencia de datos no equivale a saldo cero.'};
 const choice=automaticChoice(day,year,r.currentRemainingMinutes,r.unresolvedOpeningMinutes,r.plan.dailyMinutes);
 if(choice)return {allowed:true,origin:choice.originYear,title:choice.kind==='work_debit'?`Compensaría débito de ${year-1}`:`Consumiría un día de ${choice.originYear}`,text:choice.originYear===year?`Es de lunes a viernes${day.holiday?', aunque sea festivo':''}. Se utilizan primero los días del año. La elección sigue sujeta al cupo disponible.`:choice.kind==='work_debit'?'Era un descanso fijo y pasaría a trabajo para compensar débito anterior. La elección sigue sujeta a cupo.':'Puedes usar un crédito anterior de lunes a domingo, con cupo disponible. Se cuenta aparte del saldo nuevo.'};
 const weekend=[0,6].includes(weekday(date));
 return {allowed:false,title:day.rest?'Ya era descanso fijo':weekend?'Fin de semana sin crédito anterior disponible':'Sin jornadas disponibles para esta fecha',text:day.rest?'No se consume otro descanso sobre el que ya tenías. Solo un débito anterior pendiente podría convertirlo en trabajo.':weekend?'Los siete días del año se piden de lunes a viernes. Para descansar este sábado o domingo necesitarías crédito del año anterior.':'Revisa los días restantes de cada origen o retira una elección para volver a disponer de ella.'};
}
