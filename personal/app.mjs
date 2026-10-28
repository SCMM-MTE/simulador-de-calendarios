import {validateDataset,profileFor,rosterCsvToDataset,overridePlan} from './core/dataset.mjs';
import {dne,lotteryNumber,randomLottery,drawRoster,annualPreference,annualRosterOrder,slotAt,evidence} from './core/rotation.mjs';
import {yearLedger,amount} from './core/balance.mjs';
import {displayDate,weekday,inRanges,datesBetween} from './core/dates.mjs';
import {demoDataset} from './core/demo.mjs';
import {restoreSimulation} from './core/simulation.mjs';
import {retireLegacyRoster} from './core/storage.mjs';
import {periodCatalog} from './core/periods-2027.mjs';
const $=id=>document.getElementById(id);
const months=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const dayNames=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const state={dataset:null,profile:null,draw:[],number:'00000',mode:'once',year:2027,view:'calendar',overrides:{},month:'all',period:'all'};
const node=(tag,text,className)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;};
const cell=text=>node('td',text);
const hours=minutes=>minutes==null?'Pendiente':`${Math.floor(minutes/60)} h${minutes%60?' '+minutes%60+' min':''}`;
const signClass=value=>value==null?'':value>0?'positive':value<0?'negative':'';
const datesText=ranges=>ranges?.length?ranges.map(r=>`${displayDate(r.start)} – ${displayDate(r.end)}`).join(' · '):'Pendiente o sin periodo asignado';
function ledger(){return yearLedger(state.dataset,state.profile,state.overrides,Math.min(2100,Math.max(state.year+1,...Object.keys(state.profile.years).map(Number),2028)));}
function current(){return ledger().find(r=>r.year===state.year);}
function setNotice(text){$('notice').textContent=text;}
function fact(label,value){const row=node('div');row.append(node('dt',label),node('dd',value));return row;}
function metric(title,value,help,color=''){const box=node('div',undefined,'metric');const strong=node('strong',value,color);box.append(node('h2',title),strong,node('p',help));return box;}
function card(title,value,help,color=''){const box=node('article',undefined,'analysis-card');box.append(node('span',title,'eyebrow'),node('div',value,'value '+color),node('p',help));return box;}
function enter(event){
  event?.preventDefault();$('entryError').textContent='';
  try{
    if(!state.dataset)throw Error('Todavía no está cargado el nuevo escalafón. Puedes revisar el ejemplo ficticio mientras se incorpora.');
    const id=dne($('dne').value);lotteryNumber($('lottery').value);const profile=profileFor(state.dataset,id);
    if(!profile)throw Error('Ese DNE no figura en el archivo cargado.');
    state.profile=profile;state.number=$('lottery').value;state.mode=$('lotteryMode').value;state.year=2027;state.overrides={};state.view='calendar';state.month='all';state.period='all';$('periodFilter').value='all';$('month').value='all';
    state.draw=state.dataset.rosterReady?drawRoster(state.dataset.entries,state.number):[];$('entry').hidden=true;$('workspace').hidden=false;$('exit').hidden=false;$('profileDetails').open=!matchMedia('(max-width:900px)').matches;
    render();window.scrollTo(0,0);
  }catch(error){$('entryError').textContent=error.message;}
}
function periodsModified(plan){const original=state.profile?.years[state.year];return Boolean(plan&&original&&(JSON.stringify(plan.vacations)!==JSON.stringify(original.vacations)||JSON.stringify(plan.pfa)!==JSON.stringify(original.pfa)));}
function renderProfile(result){
  const p=state.profile,person=state.draw.find(e=>e.dne===p.dne),preference=person?annualPreference(person.assignment,state.year):null,annualOrder=person?annualRosterOrder(state.draw,state.year).find(e=>e.dne===p.dne):null;
  $('profileDne').textContent=`DNE ${p.dne}`;
  $('profileFacts').replaceChildren(fact('Grupo de descanso',p.restGroup?'G'+p.restGroup+' · fijo':'Pendiente de carga'),fact('Escalafón',p.seniorityRank??'Pendiente'),fact('Número simulado',state.number),fact('Orden inicial del sorteo',person?`${person.lotteryOrder} / ${state.draw.length}`:'Pendiente de escalafón'),fact('Asignación personal',person?`B${person.assignment.initialBlock} · ${person.assignment.group}${person.assignment.subgroup}`:'Pendiente de escalafón'),fact('Preferencia '+state.year,preference?`B${preference.block} · ${preference.withinBlockPriority}/12`:'Pendiente'),fact('Puesto anual simulado',annualOrder?`${annualOrder.simulatedAnnualOrder} / ${state.draw.length}`:'Pendiente'));
  const plan=result?.plan??p.years[state.year];
  $('vacations').textContent=datesText(plan?.vacations);$('pfa').textContent=datesText(plan?.pfa);
  $('medicalRest').textContent=plan?(plan.medicalRestDates?.length?plan.medicalRestDates.map(displayDate).join(' · '):'Sin fecha importada'):'Pendiente';
  $('periodLabel').textContent=(plan?.periodLabel?'Referencia PDF: '+plan.periodLabel:'')+(periodsModified(plan)?' · Fechas modificadas en este escenario.':'');
  $('profileSource').textContent=`Archivo: ${state.dataset.version}. ${plan?.sourceReference??state.dataset.sourceReference}`;
  $('editPeriods').disabled=!p.years[state.year];$('restorePeriods').disabled=!p.years[state.year];
}
const periodDays=ranges=>(ranges??[]).reduce((total,r)=>total+datesBetween(r.start,r.end).length,0);
function renderPeriodAnalysis(result){
 const plan=result?.plan??state.profile.years[state.year];
 $('periodAnalysisTitle').textContent=plan?.periodLabel??'Periodos del año';
 $('periodAnalysisHelp').textContent=plan?'Días naturales, incluidos ambos extremos. Criterio del PDF: invierno de 28 días = 7 iniciales de vacaciones y 21 de PFA. R.M. es descanso compensatorio y se mantiene separado.'+(periodsModified(plan)?' Estás viendo fechas modificadas en el escenario; puedes restaurar las del PDF.':'')+((plan.medicalRestDates??[]).some(d=>inRanges(d,plan.vacations)||inRanges(d,plan.pfa))?' R.M. coincide con un periodo modificado: conserva su fecha de origen y no añade un segundo día libre.':''):'Faltan los periodos preasignados de este año.';
 const rows=[];
 if(plan){for(const kind of ['vacations','pfa'])for(const range of plan[kind]){const tr=node('tr');tr.append(cell(kind==='vacations'?'Vacaciones':'PFA'),cell(displayDate(range.start)),cell(displayDate(range.end)),cell(datesBetween(range.start,range.end).length));rows.push(tr);}
 for(const date of plan.medicalRestDates??[]){const tr=node('tr');tr.append(cell('Descanso R.M.'),cell(displayDate(date)),cell(displayDate(date)),cell(1));rows.push(tr);}}
 $('periodRows').replaceChildren(...rows);
 $('periodTotals').textContent=plan?`${periodDays(plan.vacations)} días de vacaciones · ${periodDays(plan.pfa)} días de PFA · ${plan.medicalRestDates?.length??0} día(s) R.M.`:'Periodos pendientes';
}
function renderMetrics(result){
  const next=state.year+1;
  if(!result?.ready&&result?.periodsReady){$('metrics').replaceChildren(metric('Vacaciones',`${periodDays(result.plan.vacations)} d`,'Incluye los 7 días iniciales del invierno de 28 días, cuando corresponde.'),metric('Fiestas agrupadas',`${periodDays(result.plan.pfa)} d`,'PFA separado de vacaciones; días naturales.'),metric('Descanso R.M.',`${result.plan.medicalRestDates?.length??0} d`,result.reason));return;}
  if(!result?.ready){const carry=result?.projectedFromPreviousYear??null;$('metrics').replaceChildren(metric('Datos del año','Pendientes',result?.reason??'Falta el plan anual.'),metric('Proyección recibida',amount(carry),`Generada en ${state.year-1}; no es un saldo publicado.`,signClass(carry)),metric('Grupo de descanso',state.profile.restGroup?'G'+state.profile.restGroup:'Pendiente','Dato importado, sin selector manual.'));return;}
  $('metrics').replaceChildren(metric('Trabajo previsto',`${result.plannedWorkDays} d`,`${hours(result.workMinutes)} · objetivo: ${hours(result.annualTargetMinutes)}`),metric(`Proyección para ${next}`,amount(result.projectedNextYearMinutes,result.plan.dailyMinutes),result.annualTargetMinutes==null?'Falta el objetivo anual para calcular el balance.':'Saldo provisional generado este año.',signClass(result.projectedNextYearMinutes)),metric('Descansos elegidos',`${result.plan.selections.filter(s=>s.kind==='rest_credit').length} d`,`${result.currentWeekdayRests} del plan actual en lunes a viernes.`));
}
function allowedDay(day,result){
  if(!result?.ready)return false;
  if(day.selection)return true;
  if(day.date.slice(5)<'02-01'||day.vacation||day.pfa||day.medicalRest)return false;
  if($('choiceKind').value==='rest_credit'&&day.rest)return false;
  if($('choiceKind').value==='work_debit'&&!day.rest)return false;
  if($('choiceOrigin').value==='previous'){
    const balance=result.unresolvedOpeningMinutes;
    if(balance==null||balance===0)return false;
    if(($('choiceKind').value==='rest_credit'&&balance<0)||($('choiceKind').value==='work_debit'&&balance>0))return false;
  }
  return true;
}
function chooseDate(date){
  const old=state.overrides[state.year]??{},result=current();if(!result?.ready)return;
  const choices=[...(old.selections??[])],i=choices.findIndex(s=>s.date===date);
  if(i>=0)choices.splice(i,1);else choices.push({date,kind:$('choiceKind').value,originYear:$('choiceOrigin').value==='previous'?state.year-1:state.year});
  const proposed={...old,selections:choices};
  try{overridePlan(state.profile,state.year,proposed);state.overrides[state.year]=proposed;const check=current();if(!check.ready)throw Error(check.reason);render();$('calendar').querySelector(`[data-date="${date}"]`)?.focus({preventScroll:true});}
  catch(error){state.overrides[state.year]=old;setNotice(error.message);}
}
function renderCalendar(result){
  $('calendar').replaceChildren();
  for(const id of ['choiceKind','choiceOrigin'])$(id).disabled=!result?.ready;
  $('month').disabled=!result?.ready&&!result?.periodsReady;$('periodFilter').disabled=$('month').disabled;
  if(!result?.ready&&!result?.periodsReady){$('calendarHelp').textContent=result?.reason??'Falta el calendario del año.';return;}
  $('calendarHelp').textContent='Pulsa un día para añadirlo o retirarlo. Descansos de grupo, vacaciones y PFA no se convierten en créditos. La elección ordinaria empieza en febrero. Los cupos reales y las incidencias personales necesitan sus datos de referencia; aquí guardas un escenario.';
  if(!result.ready)$('calendarHelp').textContent=(periodsModified(result.plan)?'Vacaciones y PFA modificados en el escenario; R.M. conserva su fecha de origen. ':'Vacaciones, PFA y R.M. extraídos del PDF. ')+result.reason+' Los demás días no tienen descanso/trabajo determinado; las elecciones y el balance laboral quedan pendientes.';
  $('workLegend').textContent=result.ready?'Trabajo':'Descanso/trabajo pendiente';
  for(let month=0;month<12;month++){
    if(state.month!=='all'&&Number(state.month)!==month)continue;
    if(state.period!=='all'&&!result.daily.some(d=>Number(d.date.slice(5,7))===month+1&&({vacations:d.vacation,pfa:d.pfa,medical:d.medicalRest}[state.period])))continue;
    const box=node('article',undefined,'month');box.append(node('h3',months[month]));const labels=node('div',undefined,'week-labels');
    for(const label of ['L','M','X','J','V','S','D']){const span=node('span',label);span.setAttribute('aria-hidden','true');labels.append(span);}box.append(labels);
    const grid=node('div',undefined,'month-days'),prefix=`${state.year}-${String(month+1).padStart(2,'0')}-`,first=prefix+'01',offset=(weekday(first)+6)%7;
    for(let i=0;i<offset;i++)grid.append(node('span'));
    for(const date of result.daily.filter(d=>d.date.startsWith(prefix))){
      const label=date.vacation?'Vacaciones':date.pfa?'PFA':date.medicalRest?'Descanso R.M.':date.rest?'Descanso fijo':date.rest==null?'Descanso/trabajo pendiente':'Trabajo';
      const kind=date.selection?.kind;const button=node('button',String(Number(date.date.slice(8))),'day'+(date.vacation?' vacation':date.pfa?' pfa':date.medicalRest?' medical':date.rest?' rest':date.rest==null?' unknown':'')+(date.holiday?' holiday':'')+(kind?' chosen':''));button.type='button';button.dataset.date=date.date;
      if(date.medicalRest)button.append(node('small','RM'));
      if(kind)button.append(node('small',kind==='rest_credit'?'CR':'DT'));
      button.setAttribute('aria-pressed',String(Boolean(kind)));button.setAttribute('aria-label',`${displayDate(date.date)}, ${dayNames[date.weekday]}. ${label}${date.holiday?', festivo':''}${kind?', elegido '+(kind==='rest_credit'?'descanso':'trabajo'):''}`);
      button.title=button.getAttribute('aria-label');button.disabled=!allowedDay(date,result);button.onclick=()=>chooseDate(date.date);grid.append(button);
    }
    box.append(grid);$('calendar').append(box);
  }
}
function renderAnalysis(result){
  renderPeriodAnalysis(result);
  $('catalog2027').hidden=state.year!==2027;
  $('catalogBody').replaceChildren(...periodCatalog.periods.map(p=>{const tr=node('tr'),winterVac=p.vacations[1];tr.append(cell(p.code),cell(datesText([p.summer])),cell(winterVac?datesText([winterVac]):'—'),cell(datesText(p.pfa)),cell(displayDate(p.medicalRestDate)));return tr;}));
  const all=ledger(),prior=result?.ready?result.unresolvedOpeningMinutes:null;
  $('analysisCards').replaceChildren(card('Generado este año',amount(result?.currentBalanceMinutes),result?.annualTargetMinutes==null?'Pendiente de un objetivo anual documentado.':'Trabajo previsto frente al objetivo, sin volver a cargar las compensaciones anteriores.',signClass(result?.currentBalanceMinutes)),card('Llega al año siguiente',amount(result?.projectedNextYearMinutes),'Proyección del escenario. No es una nueva asignación publicada.',signClass(result?.projectedNextYearMinutes)),card('Anterior sin compensar',amount(prior),'Se muestra por separado. No se traslada indefinidamente ni se cancela por conjetura.',signClass(prior)));
  $('ledgerBody').replaceChildren(...all.map(r=>{const tr=node('tr');tr.append(cell(r.year),cell(r.ready?hours(r.workMinutes):r.invalidPlan?'Revisar elecciones':'Faltan datos anuales'),cell(hours(r.annualTargetMinutes)),cell(amount(r.currentBalanceMinutes)),cell(amount(r.projectedNextYearMinutes)),cell(amount(r.unresolvedOpeningMinutes)));if(!r.ready)tr.title=r.reason;return tr;}));
  const choices=result?.ready?[...result.plan.selections].sort((a,b)=>a.date.localeCompare(b.date)):[];
  $('choicesBody').replaceChildren(...choices.map(s=>{const tr=node('tr'),action=cell(''),button=node('button','Retirar');button.type='button';button.setAttribute('aria-label',`Retirar elección del ${displayDate(s.date)}`);button.onclick=()=>chooseDate(s.date);action.append(button);tr.append(cell(displayDate(s.date)),cell(s.kind==='rest_credit'?'Descanso por crédito':'Trabajo por débito'),cell(s.originYear),action);return tr;}));
  if(!choices.length){const tr=node('tr'),td=cell('Todavía no has elegido días de este año.');td.colSpan=4;tr.append(td);$('choicesBody').append(tr);}
}
function renderRotation(){
  const person=state.draw.find(p=>p.dne===state.profile.dne);
  if(!person){$('rotationCards').replaceChildren(card('Escalafón pendiente','Sin sorteo','El listado de vacaciones no se usa como plantilla para calcular el orden del sorteo.'));$('fillOrder').replaceChildren();$('rotationBody').replaceChildren();$('rotationSource').textContent='Los periodos del PDF pueden consultarse sin deducir una asignación de regularización. Se incorporará el escalafón cuando esté disponible.';return;}
  const pref=annualPreference(person.assignment,state.year);
  $('rotationCards').replaceChildren(card('Asignación personal',`B${person.assignment.initialBlock} · ${person.assignment.group}${person.assignment.subgroup}`,person.assignmentOrigin),card('Preferencia '+state.year,`Bloque ${pref.block}`,`${pref.permanentSlot}: posición ${pref.withinBlockPriority} de las 12 unidades del bloque.`),card('Orden inicial',`${person.lotteryOrder} / ${state.draw.length}`,`Plantilla ordenada por DNE. El escalafón importado se muestra por separado.`));
  $('fillOrder').replaceChildren(...[0,1,12,13,26,39,155,156].map(i=>{const s=slotAt(i);return node('span',`${i+1}: B${s.initialBlock} · ${s.group}${s.subgroup} · p${s.seat}`);}));
  $('rotationBody').replaceChildren(...Array.from({length:Math.min(15,2101-2027)},(_,i)=>{const r=annualPreference(person.assignment,2027+i),tr=node('tr');tr.append(cell(r.year),cell(r.block),cell(r.permanentSlot),cell(`${r.withinBlockPriority} / 12`));return tr;}));
  $('rotationSource').textContent=`${evidence.title}, páginas 4–6. SHA-256 ${evidence.sha256}. ${evidence.continuationReference} El puesto anual mostrado es una ordenación del escenario, no una cita oficial. Los ajustes de Nombramiento importados prevalecen.`;
}
function render(){
  if(!state.profile)return;
  let result;try{result=current();}catch(error){setNotice(error.message);return;}
  $('year').value=state.year;$('previousYear').disabled=state.year<=2027;$('nextYear').disabled=state.year>=2100;
  $('dataBanner').textContent=state.dataset.demo?'DEMOSTRACIÓN · Todos los DNE, periodos, objetivos y calendarios son ficticios.':'DATOS IMPORTADOS PARA SIMULAR · Consulta la referencia del archivo. Las elecciones no modifican el escalafón ni se envían a Metro.';
  $('pageTitle').textContent={calendar:'Mi calendario',analysis:'Mi balance anual',rotation:'Mi rotación'}[state.view];
  document.querySelectorAll('[data-view]').forEach(b=>{if(b.dataset.view===state.view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  for(const view of ['calendar','analysis','rotation'])$(view+'View').hidden=view!==state.view;
  renderProfile(result);renderMetrics(result);renderCalendar(result);renderAnalysis(result);renderRotation();
}
function setYear(year){
  if(!Number.isInteger(year)||year<2027||year>2100){setNotice('Elige un año entre 2027 y 2100.');$('year').value=state.year;return;}
  state.year=year;setNotice('');render();
}
function rangeRow(container,kind,range={start:'',end:''}){
  const row=node('div',undefined,'range-row');
  for(const [key,label] of [['start','Desde'],['end','Hasta']]){const wrapper=node('label',`${kind}: ${label}`),input=node('input');input.type='date';input.required=true;input.min=`${state.year}-01-01`;input.max=`${state.year}-12-31`;input.dataset.rangeKey=key;input.value=range[key];wrapper.append(input);row.append(wrapper);}
  const remove=node('button','Quitar');remove.type='button';remove.onclick=()=>row.remove();row.append(remove);container.append(row);
}
function openPeriods(){const plan=current()?.plan??state.profile.years[state.year];$('vacationRows').replaceChildren();$('pfaRows').replaceChildren();for(const r of plan.vacations)rangeRow($('vacationRows'),'Vacaciones',r);for(const r of plan.pfa)rangeRow($('pfaRows'),'PFA',r);$('periodError').textContent='';$('periodDialog').showModal();}
function readRows(id){return [...$(id).querySelectorAll('.range-row')].map(row=>Object.fromEntries([...row.querySelectorAll('input')].map(i=>[i.dataset.rangeKey,i.value])));}
function applyPeriods(vacations,pfa){
  const old=state.overrides[state.year]??{},existing=old.selections??[],selections=existing.filter(s=>!inRanges(s.date,vacations)&&!inRanges(s.date,pfa));
  const next={...old,vacations,pfa,selections};overridePlan(state.profile,state.year,next);state.overrides[state.year]=next;render();
  setNotice(`Fechas actualizadas solo en tu simulación.${existing.length!==selections.length?' Se han retirado '+(existing.length-selections.length)+' elecciones que coinciden con los nuevos periodos.':''}`);
}
$('entryForm').onsubmit=enter;
$('random').onclick=()=>{$('lottery').value=randomLottery();$('lotteryMode').value='random';};
$('lotteryMode').onchange=()=>{if($('lotteryMode').value==='random')$('lottery').value=randomLottery();};
$('demo').onclick=()=>{state.dataset=demoDataset();$('dne').value=state.dataset.entries[0].dne;$('lottery').value='00000';$('lotteryMode').value='random';$('datasetStatus').textContent='Ejemplo ficticio: no contiene datos de maquinistas.';enter();};
$('load').onclick=()=>$('datasetFile').click();
$('datasetFile').onchange=async()=>{const file=$('datasetFile').files[0];if(!file)return;try{if(file.size>10_000_000)throw Error('El archivo supera 10 MB.');const content=await file.text();state.dataset=file.name.toLowerCase().endsWith('.csv')?rosterCsvToDataset(content):validateDataset(JSON.parse(content));$('datasetStatus').textContent=`Archivo cargado: ${state.dataset.entries.length} DNE. ${state.dataset.rosterReady?'':'Escalafón pendiente; los periodos pueden consultarse. '}${state.dataset.sourceReference}`;$('entryError').textContent='';}catch(error){$('entryError').textContent=error.message;}finally{$('datasetFile').value='';}};
$('exit').onclick=()=>{state.profile=null;state.draw=[];state.overrides={};$('workspace').hidden=true;$('entry').hidden=false;$('exit').hidden=true;$('dne').value='';window.scrollTo(0,0);};
$('previousYear').onclick=()=>setYear(state.year-1);$('nextYear').onclick=()=>setYear(state.year+1);$('year').onchange=()=>setYear(Number($('year').value));
for(const id of ['choiceKind','choiceOrigin'])$(id).onchange=()=>renderCalendar(current());
for(let i=0;i<12;i++){const option=node('option',months[i]);option.value=i;$('month').append(option);}
$('periodFilter').onchange=()=>{state.period=$('periodFilter').value;renderCalendar(current());};
$('month').onchange=()=>{state.month=$('month').value;renderCalendar(current());};
for(const button of document.querySelectorAll('[data-view]'))button.onclick=()=>{state.view=button.dataset.view;setNotice('');render();};
$('editPeriods').onclick=openPeriods;$('closePeriods').onclick=()=>$('periodDialog').close();
$('addVacation').onclick=()=>rangeRow($('vacationRows'),'Vacaciones');$('addPfa').onclick=()=>rangeRow($('pfaRows'),'PFA');
$('periodForm').onsubmit=event=>{event.preventDefault();try{applyPeriods(readRows('vacationRows'),readRows('pfaRows'));$('periodDialog').close();}catch(error){$('periodError').textContent=error.message;}};
$('restorePeriods').onclick=()=>{const plan=state.profile.years[state.year];try{applyPeriods(plan.vacations,plan.pfa);}catch(error){setNotice(error.message);}};
$('resetChoices').onclick=()=>{state.overrides[state.year]={...(state.overrides[state.year]??{}),selections:[]};render();setNotice('Se han vaciado las elecciones de este año. La preasignación importada se conserva.');};
$('download').onclick=()=>{const result={schema:'scmm-personal-simulation-v1',datasetVersion:state.dataset.version,dne:state.profile.dne,lottery:{number:state.number,mode:state.mode},overrides:state.overrides,exportedAt:new Date().toISOString(),demo:state.dataset.demo};const url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}));const a=node('a');a.href=url;a.download=`simulacion-mte-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;a.click();URL.revokeObjectURL(url);};
$('restoreSimulation').onclick=()=>$('simulationFile').click();
$('simulationFile').onchange=async()=>{const file=$('simulationFile').files[0];if(!file)return;try{
 if(file.size>500000)throw Error('El archivo de simulación supera el tamaño permitido.');
 const restored=restoreSimulation(JSON.parse(await file.text()),state.dataset,state.profile);
 state.overrides=restored.overrides;state.number=restored.number;state.mode=restored.mode;
 state.draw=state.dataset.rosterReady?drawRoster(state.dataset.entries,state.number):[];render();setNotice('Simulación recuperada. Los datos importados y el grupo de descanso se conservan.');
}catch(error){setNotice(error.message);}finally{$('simulationFile').value='';}};
const themes=['system','light','dark'];let theme='system';try{retireLegacyRoster(localStorage);theme=localStorage.getItem('scmm.theme')??'system';}catch{};if(!themes.includes(theme))theme='system';const media=matchMedia('(prefers-color-scheme: dark)');
function applyTheme(){document.documentElement.dataset.theme=theme==='system'?(media.matches?'dark':'light'):theme;$('theme').setAttribute('aria-label','Apariencia: '+{system:'Sistema',light:'Claro',dark:'Oscuro'}[theme]+'. Cambiar apariencia.');}
$('theme').onclick=()=>{theme=themes[(themes.indexOf(theme)+1)%themes.length];try{if(theme==='system')localStorage.removeItem('scmm.theme');else localStorage.setItem('scmm.theme',theme);}catch{}applyTheme();};media.addEventListener('change',applyTheme);applyTheme();
