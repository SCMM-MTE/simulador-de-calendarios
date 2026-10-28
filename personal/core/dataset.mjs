import {dne} from './rotation.mjs';
import {yearDates,parseDate,validateRanges,datesBetween} from './dates.mjs';
const integer=(value,min,max,label)=>{if(!Number.isSafeInteger(value)||value<min||value>max)throw Error(label+' no válido.');return value;};
const text=(value,label)=>{if(typeof value!=='string'||!value.trim()||value.length>1000)throw Error('Falta '+label+'.');return value.trim();};
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
function assignment(raw) {
  if(raw==null)return null;
  if(!['A','B','C'].includes(raw.group))throw Error('Grupo de regularización no válido.');
  return {initialBlock:integer(raw.initialBlock,1,13,'Bloque inicial'),group:raw.group,subgroup:integer(raw.subgroup,1,4,'Subgrupo'),seat:integer(raw.seat,1,20000,'Posición dentro del subgrupo'),sourceReference:text(raw.sourceReference,'la referencia de la asignación oficial')};
}
export function validateDataset(input) {
  if(input?.schema!=='scmm-personal-simulator-v1')throw Error('El archivo no tiene el formato de escalafón y calendario del simulador.');
  const sourceReference=text(input.sourceReference,'la referencia del escalafón'),version=text(input.version,'la versión del archivo');
  if(!Array.isArray(input.entries)||!input.entries.length||input.entries.length>20000)throw Error('El escalafón debe contener entre 1 y 20.000 registros.');
  const ids=new Set(),ranks=new Set();
  const entries=input.entries.map(raw=>{
    const id=dne(raw.dne);if(ids.has(id))throw Error('DNE duplicado: '+id);ids.add(id);
    const seniorityRank=raw.seniorityRank==null?null:integer(raw.seniorityRank,1,20000,'Orden de escalafón');
    if(seniorityRank!==null){if(ranks.has(seniorityRank))throw Error('El orden de escalafón está duplicado.');ranks.add(seniorityRank);}
    const restGroup=raw.restGroup==null?null:integer(raw.restGroup,1,4,'Grupo de descanso');
    const years={};for(const [key,plan] of Object.entries(raw.years??{})){
      const year=integer(Number(key),2027,2100,'Año');
      const vacations=validateRanges(plan.vacations??[],year),pfa=validateRanges(plan.pfa??[],year);validateRanges([...vacations,...pfa],year);
      years[year]={vacations,pfa,dailyMinutes:integer(plan.dailyMinutes??480,1,1440,'Duración de jornada'),annualTargetMinutes:plan.annualTargetMinutes==null?null:integer(plan.annualTargetMinutes,0,600000,'Objetivo anual'),openingBalanceMinutes:plan.openingBalanceMinutes==null?null:integer(plan.openingBalanceMinutes,-600000,600000,'Saldo inicial'),sourceReference:text(plan.sourceReference,'la referencia del plan anual')};
    }
    return {dne:id,seniorityRank,restGroup,officialAssignment:assignment(raw.officialAssignment),years};
  });
  const calendars={};for(const [key,raw] of Object.entries(input.calendars??{})){
    const year=integer(Number(key),2027,2100,'Año del calendario');yearDates(year);
    const groups={};for(const [g,dates] of Object.entries(raw.groups??{})){
      const group=integer(Number(g),1,4,'Grupo del calendario');
      if(!Array.isArray(dates)||dates.length>366)throw Error('Lista de descansos no válida.');
      const unique=new Set();for(const date of dates){parseDate(date);if(!date.startsWith(year+'-')||unique.has(date))throw Error('Fecha de descanso duplicada o fuera del año.');unique.add(date);}
      groups[group]=[...unique].sort();
    }
    if(!Array.isArray(raw.holidays??[])||(raw.holidays??[]).length>100)throw Error('Lista de festivos no válida.');
    const holidays=[...new Set(raw.holidays??[])];holidays.forEach(d=>{parseDate(d);if(!d.startsWith(year+'-'))throw Error('Festivo fuera de su año.');});
    calendars[year]={groups,holidays,sourceReference:text(raw.sourceReference,'la referencia del calendario'),verified:raw.verified===true};
  }
  return freeze({schema:input.schema,version,sourceReference,entries,calendars,demo:input.demo===true});
}
export function profileFor(dataset,id) {return dataset.entries.find(p=>p.dne===dne(id))??null;}
export function overridePlan(profile,year,override={}) {
  if(!profile.years[year])throw Error('Falta el plan anual de este DNE.');
  const keys=Object.keys(override);
  if(keys.some(k=>!['vacations','pfa','selections'].includes(k)))throw Error('El grupo de descanso y los datos del escalafón no se pueden cambiar desde una simulación.');
  const original=profile.years[year];
  const vacations=validateRanges(override.vacations??original.vacations,year),pfa=validateRanges(override.pfa??original.pfa,year);validateRanges([...vacations,...pfa],year);
  const selections=override.selections??[];
  if(!Array.isArray(selections)||selections.length>366)throw Error('La lista de días elegidos no es válida.');
  const seen=new Set();const safe=selections.map(s=>{
    parseDate(s.date);if(!s.date.startsWith(year+'-')||seen.has(s.date))throw Error('Día elegido repetido o fuera de su año.');seen.add(s.date);
    if(!['rest_credit','work_debit'].includes(s.kind)||![year,year-1].includes(s.originYear))throw Error('Tipo u origen del día de regularización no válido.');
    return {date:s.date,kind:s.kind,originYear:s.originYear};
  });
  return {...original,vacations,pfa,selections:safe,restGroup:profile.restGroup};
}
export function rosterCsvToDataset(csv) {
  // Deliberately small, quoted RFC-4180 CSV parser; no spreadsheet formulas executed.
  if(typeof csv!=='string'||csv.length>10_000_000)throw Error('El archivo supera el tamaño permitido.');
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<=csv.length;i++){
    const c=csv[i];if(c==='"'){if(quoted&&csv[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
    else if((c===','||c===';'||c==='\n'||c===undefined)&&!quoted){row.push(cell.replace(/\r$/,''));cell='';if(c==='\n'||c===undefined){if(row.some(v=>v.trim()))rows.push(row);row=[];}}else if(c!==undefined)cell+=c;
  }
  if(quoted||rows.length<2)throw Error('CSV incompleto.');
  const headers=rows.shift().map(h=>h.replace(/^\uFEFF/,'').trim().toLowerCase());
  const id=headers.indexOf('dne'),rank=headers.indexOf('escalafon'),group=headers.indexOf('grupo_descanso');if(id<0)throw Error('Falta la columna dne.');
  return validateDataset({schema:'scmm-personal-simulator-v1',version:new Date().toISOString(),sourceReference:'Archivo CSV importado localmente',entries:rows.map(r=>({dne:r[id],seniorityRank:rank<0||!r[rank]?null:Number(r[rank]),restGroup:group<0||!r[group]?null:Number(r[group]),years:{}})),calendars:{}});
}
