import test from 'node:test';
import assert from 'node:assert/strict';
import {datesBetween,yearDates,parseDate,validateRanges} from '../core/dates.mjs';
import {slotAt,drawRoster,initialPosition,lotteryNumber,annualPreference,slotOrder,randomLottery} from '../core/rotation.mjs';
import {validateDataset,overridePlan,rosterCsvToDataset} from '../core/dataset.mjs';
import {annualBalance,yearLedger,papQuotaDecember31,amount} from '../core/balance.mjs';
import {demoDataset} from '../core/demo.mjs';
const fixture=()=>{const d=JSON.parse(JSON.stringify(demoDataset()));return d;};
const pick=(dataset,year,rest=false)=>annualBalance(dataset,dataset.entries[0],year).daily.filter(d=>d.rest===rest&&!d.pfa&&!d.vacation&&d.date.slice(5)>='02-01').map(d=>d.date);
const select=(date,kind='rest_credit',originYear=2027)=>({date,kind,originYear});

test('Días civiles: cambios de hora, bisiesto y fechas inválidas',()=>{
 assert.equal(datesBetween('2028-03-20','2028-04-16').length,28);
 assert.equal(datesBetween('2027-10-20','2027-11-16').length,28);
 assert.equal(yearDates(2028).length,366);assert.equal(yearDates(2027).length,365);
 assert.throws(()=>parseDate('2027-02-29'));assert.throws(()=>parseDate('2027-13-01'));
 assert.throws(()=>validateRanges([{start:'2027-01-01',end:'2027-01-05'},{start:'2027-01-05',end:'2027-01-10'}],2027));
});
test('Relleno literal del acta: bloques primero, grupo, subgrupo y nueva plaza',()=>{
 const expected={0:[1,'A',1,1],12:[13,'A',1,1],13:[1,'B',1,1],26:[1,'C',1,1],39:[1,'A',2,1],155:[13,'C',4,1],156:[1,'A',1,2]};
 for(const [i,tuple] of Object.entries(expected))assert.deepEqual(Object.values(slotAt(Number(i))),tuple);
 assert.equal(new Set(Array.from({length:156},(_,i)=>JSON.stringify(slotAt(i)))).size,156);
});
test('Sorteo: ceros, extremos, orden numérico de DNE y vuelta circular',()=>{
 const entries=[{dne:'100'},{dne:'2'},{dne:'10'}];
 assert.equal(initialPosition('00000',3),1);assert.equal(initialPosition('99999',3),3);
 assert.deepEqual(drawRoster(entries,'99999').map(p=>p.dne),['100','2','10']);
 assert.equal(lotteryNumber('00001'),1);assert.throws(()=>lotteryNumber('1234'));
 assert.throws(()=>drawRoster([{dne:'2'},{dne:'002'}],'00000'));
 let count=0;assert.equal(randomLottery({getRandomValues:b=>{b[0]=count++?99999:4294967295;}}),'99999');
});
test('La asignación importada prevalece; grupo de descanso y escalafón no se sortean',()=>{
 const officialAssignment={initialBlock:7,group:'C',subgroup:3,seat:4,sourceReference:'prueba'};
 for(const number of ['00000','99999']){
  const p=drawRoster([{dne:'3',restGroup:2,seniorityRank:1,officialAssignment},{dne:'5'}],number).find(p=>p.dne==='3');
  assert.deepEqual(p.assignment,officialAssignment);assert.equal(p.restGroup,2);assert.equal(p.seniorityRank,1);
 }
});
test('Rotación anual continua de bloque y unidad, incluida 2040',()=>{
 assert.deepEqual(slotOrder(2028).slice(0,5),['B2','B3','B4','B1','C2']);
 const a={initialBlock:1,group:'A',subgroup:1};
 assert.equal(annualPreference(a,2028).block,13);assert.equal(annualPreference(a,2029).block,2);
 assert.equal(annualPreference(a,2040).block,1);assert.equal(slotOrder(2040)[0],'B2');
 for(const year of [2027,2028,2039,2040,2100])assert.equal(new Set(Array.from({length:156},(_,i)=>annualPreference(slotAt(i),year).subgroupPriority)).size,156);
});
test('Importación privada: lista blanca, datos inmutables y duplicados rechazados',()=>{
 const raw=fixture();raw.entries[0].nombre='NO RETENER';raw.entries[0].nif='NO RETENER';
 const d=validateDataset(raw);assert.ok(Object.isFrozen(d.entries[0].years[2027]));
 assert.equal(d.entries[0].nombre,undefined);assert.equal(d.entries[0].nif,undefined);
 assert.throws(()=>{d.entries[0].restGroup=4;});
 raw.entries[1].dne=raw.entries[0].dne;assert.throws(()=>validateDataset(raw));
});
test('CSV de escalafón: columnas nominales ignoradas, sin asumir planes/calendarios',()=>{
 const d=rosterCsvToDataset('\uFEFFdne;escalafon;grupo_descanso;nombre\r\n"9000000001";1;2;"Ficticio; privado"\r\n');
 assert.equal(d.entries.length,1);assert.equal(d.entries[0].restGroup,2);assert.equal(d.entries[0].nombre,undefined);
 assert.equal(annualBalance(d,d.entries[0],2027).ready,false);
});
test('Solo vacaciones, PFA y elecciones son editables',()=>{
 const d=demoDataset(),p=d.entries[0];
 assert.throws(()=>overridePlan(p,2027,{restGroup:4}));assert.throws(()=>overridePlan(p,2027,{annualTargetMinutes:0}));
 const plan=overridePlan(p,2027,{vacations:[{start:'2027-08-01',end:'2027-08-30'}]});
 assert.equal(plan.restGroup,p.restGroup);assert.equal(p.years[2027].vacations[0].start,'2027-07-01');
 assert.throws(()=>overridePlan(p,2027,{vacations:[{start:'2027-02-05',end:'2027-02-10'}]}));
});
test('Balance exacto en minutos y variación al elegir un día',()=>{
 const d=demoDataset(),p=d.entries[0],base=annualBalance(d,p,2027),date=pick(d,2027)[0];
 const changed=annualBalance(d,p,2027,{selections:[select(date)]});
 assert.equal(base.currentBalanceMinutes,11*480);assert.equal(changed.currentBalanceMinutes,10*480);
 assert.equal(changed.workMinutes,base.workMinutes-480);assert.equal(base.currentRestDays,0);
 assert.equal(amount(500),'+1 d 20 min');assert.equal(amount(null),'Pendiente');
});
test('No se inventan objetivos ni calendarios pendientes',()=>{
 const d=fixture(),p=d.entries[0];p.years[2027].annualTargetMinutes=null;
 assert.equal(annualBalance(d,p,2027).projectedNextYearMinutes,null);
 delete d.calendars[2027];assert.equal(annualBalance(d,p,2027).ready,false);
 p.restGroup=null;assert.equal(annualBalance(d,p,2028).ready,false);
});
test('Sin plan posterior se conserva la proyección como dato pendiente, sin fabricar ficha',()=>{
 const d=fixture(),p=d.entries[0];delete p.years[2028];delete p.years[2029];
 const rows=yearLedger(d,p,{},2028);assert.equal(rows[1].ready,false);assert.equal(rows[1].projectedFromPreviousYear,5280);
});
test('Compensar el año previo no genera débito nuevo; resto antiguo queda separado',()=>{
 const d=fixture(),p=d.entries[0];p.years[2028].openingBalanceMinutes=960;
 const date=pick(d,2028)[0],base=annualBalance(d,p,2028);
 const b=annualBalance(d,p,2028,{selections:[select(date,'rest_credit',2027)]});
 assert.equal(b.currentBalanceMinutes,base.currentBalanceMinutes);assert.equal(b.unresolvedOpeningMinutes,480);
 const rows=yearLedger(d,p,{2028:{selections:[select(date,'rest_credit',2027)]}},2029);
 assert.equal(rows[2].openingBalanceMinutes,base.currentBalanceMinutes);assert.equal(rows[2].openingOrigin,'projection');
});
test('Débito anterior: trabajar un descanso compensa, sin crear nuevo crédito',()=>{
 const d=fixture(),p=d.entries[0];p.years[2028].openingBalanceMinutes=-480;
 const b=annualBalance(d,p,2028,{selections:[select(pick(d,2028,true)[0],'work_debit',2027)]});
 assert.equal(b.currentBalanceMinutes,11*480);assert.equal(b.unresolvedOpeningMinutes,0);
});
test('No compensa más saldo, ni mezcla naturaleza de compensaciones para ocultarlo',()=>{
 const d=fixture(),p=d.entries[0];p.years[2028].openingBalanceMinutes=480;
 const work=pick(d,2028),rest=pick(d,2028,true);
 assert.throws(()=>annualBalance(d,p,2028,{selections:work.slice(0,2).map(date=>select(date,'rest_credit',2027))}));
 assert.throws(()=>annualBalance(d,p,2028,{selections:[select(work[0],'rest_credit',2027),select(rest[0],'work_debit',2027)]}));
});
test('Elecciones ordinarias: no enero, vacaciones/PFA, descanso ya existente ni origen lejano',()=>{
 const d=demoDataset(),p=d.entries[0],base=annualBalance(d,p,2027);
 const jan=base.daily.find(x=>x.baseWork&&x.date<'2027-02-01').date;
 for(const s of [select(jan),select('2027-07-01'),select(pick(d,2027,true)[0]),select(pick(d,2027)[0],'rest_credit',2025)])assert.throws(()=>annualBalance(d,p,2027,{selections:[s]}));
});
test('Cadena 2027→2029, prioridad del saldo importado y conflictos futuros aislados',()=>{
 const d=fixture(),p=d.entries[0],date=pick(d,2027)[0];
 let rows=yearLedger(d,p,{2027:{selections:[select(date)]}},2029);
 assert.equal(rows[1].openingBalanceMinutes,4800);assert.equal(rows[2].openingBalanceMinutes,5280);
 p.years[2028].openingBalanceMinutes=1234;rows=yearLedger(d,p,{},2029);
 assert.equal(rows[1].openingBalanceMinutes,1234);assert.equal(rows[1].openingOrigin,'imported');
 rows=yearLedger(d,p,{2028:{selections:[select(pick(d,2028,true)[0],'work_debit',2027)]}},2029);
 assert.equal(rows[0].ready,true);assert.equal(rows[1].invalidPlan,true);assert.equal(rows[2].ready,true);assert.equal(rows[2].openingBalanceMinutes,null);
});
test('PAP del 31/12 separado: 55 salvo domingo, 37 en domingo',()=>{
 assert.equal(papQuotaDecember31('2027-12-31'),55);assert.equal(papQuotaDecember31('2028-12-31'),37);
 assert.equal(papQuotaDecember31('2033-12-31'),55);assert.equal(papQuotaDecember31('2027-12-30'),null);
});

test('Recuperar simulación exige mismo DNE, versión y elecciones válidas',async()=>{
 const {restoreSimulation}=await import('../core/simulation.mjs');const d=demoDataset(),p=d.entries[0];
 const raw={schema:'scmm-personal-simulation-v1',datasetVersion:d.version,dne:p.dne,demo:true,lottery:{number:'00001',mode:'once'},overrides:{2027:{selections:[select(pick(d,2027)[0])]}}};
 assert.equal(restoreSimulation(raw,d,p).overrides[2027].selections.length,1);
 assert.throws(()=>restoreSimulation({...raw,dne:'9000000002'},d,p));
 assert.throws(()=>restoreSimulation({...raw,datasetVersion:'otra'},d,p));
 assert.throws(()=>restoreSimulation({...raw,overrides:{2027:{restGroup:3}}},d,p));
 assert.throws(()=>restoreSimulation({...raw,overrides:{2027:{selections:[select('2027-07-01')]}}},d,p));
 assert.equal(d.entries[0].restGroup,1);
});

test('Retira la plantilla cacheada anterior sin borrar otros ajustes ni bloquear con almacenamiento denegado',async()=>{
 const {retireLegacyRoster}=await import('../core/storage.mjs');
 const map=new Map([['scmm_portal_config_v1',JSON.stringify({rotationDneList:['FICTICIO'],rotationDneFileName:'mtes.xlsx',otro:17})],['scmmConfig',JSON.stringify({state:{config:{rotationDneList:['FICTICIO'],otro:18}}})],['noTocar','contenido']]);
 retireLegacyRoster({getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)});
 assert.deepEqual(JSON.parse(map.get('scmm_portal_config_v1')),{otro:17});
 assert.deepEqual(JSON.parse(map.get('scmmConfig')),{state:{config:{otro:18}}});assert.equal(map.get('noTocar'),'contenido');
 assert.doesNotThrow(()=>retireLegacyRoster({getItem:()=>{throw Error('denegado')}}));
});
