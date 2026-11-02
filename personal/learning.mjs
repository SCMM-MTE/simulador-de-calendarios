import {balanceExplanation,daysText,explainDate} from './core/explanation.mjs';
import {displayDate} from './core/dates.mjs';
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const q=id=>document.getElementById(id);
function part(label,value,help,cls){const a=el('article',undefined,'year-part '+cls);a.append(el('span',label,'eyebrow'),el('strong',value),el('p',help));return a;}
export function renderLearning(result,year){
 const m=balanceExplanation(result,year);
 const signed=n=>n==null?'Pendiente':`${n>0?'+':''}${daysText(n)}`;
 q('yearBridge').replaceChildren(part(`${year-1} · Lo que compensas`,signed(m.opening),'Saldo anterior. Conserva su origen.','origin-old'),part(`${year} · Los días del año`,daysText(m.currentRemaining),'Restan de los siete. Lunes a viernes, festivos incluidos.','origin-current'),part(`${year+1} · Saldo nuevo`,signed(m.generated),m.outcome,'origin-next'));
 q('storyEquation').textContent=m.formula??'Saldo nuevo pendiente';
 q('storyExplanation').textContent=m.explanation;
 q('storyOutcome').textContent=m.outcome;
 q('calendarEquation').textContent=m.formula??'Completa los datos del año';
 q('calendarOutcome').textContent=m.outcome;
 q('calendarAccounting').textContent=m.explanation;
 const selected=result?.plan?.selections??[];
 const list=q('selectedOrigins');list.replaceChildren();
 for(const [origin,tone] of [[year,'origin-current'],[year-1,'origin-old']]){const count=selected.filter(s=>s.originYear===origin).length;const r=el('div',undefined,'origin-count '+tone);r.append(el('strong',String(count)),el('span',`fechas elegidas con días de ${origin}`));list.append(r);}
 const rest=m.currentRemaining,previous=m.previousRemaining;
 q('remainingNarrative').textContent=`Por elegir: ${daysText(rest)} jornadas de ${year}. Saldo de ${year-1} pendiente: ${signed(previous)} jornadas.${m.offset?` ${daysText(m.offset)} de los siete ya compensan débito anterior.`:''}`;
 q('guideYearNotice').textContent=year===2027?'Fechas de petición para 2027':'El cronograma siguiente corresponde a 2027. No presupone fechas de convocatorias posteriores.';
 const input=q('inspectDate');if(!input.value.startsWith(year+'-'))input.value='';input.min=`${year}-01-01`;input.max=`${year}-12-31`;
 if(input.value)showDayExplanation(input.value,result,year);
 else{q('dateExplanation').replaceChildren(el('h3','Cada fecha tiene una naturaleza'),el('p','Pulsa o enfoca una fecha del calendario, o consúltala aquí, para saber qué día consumiría y por qué.'));}
}
export function showDayExplanation(date,result,year){
 const info=explainDate(date,result,year),box=q('dateExplanation');
 box.className='date-explanation '+(info.origin===year?'origin-current':info.origin===year-1?'origin-old':'');
 box.replaceChildren(el('span',date?displayDate(date):'Consulta de fecha','eyebrow'),el('h3',info.title),el('p',info.text));
 q('inspectDate').value=date;
}
export function renderDrawStart(roster,number){
 const box=q('drawStart');box.replaceChildren();
 if(!roster.length){box.append(el('h3','El DNE de inicio está pendiente'),el('p','Para localizarlo hace falta el orden completo del escalafón. Puedes seguir consultando tu calendario.'));return;}
 const first=roster[0];box.append(el('span','El reparto empieza por','eyebrow'),el('strong',`DNE ${first.dne}`),el('p',`Puesto de escalafón ${first.seniorityRank}. Fórmula: parte entera de ${number} × ${roster.length} / 100.000, más 1. Desde esa persona se recorre el escalafón y se vuelve al principio al terminar la lista.`));
}
