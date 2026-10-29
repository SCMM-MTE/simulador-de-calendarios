import test from 'node:test';
import assert from 'node:assert/strict';
import {demoDataset} from '../core/demo.mjs';
import {annualBalance} from '../core/balance.mjs';
import {actaYear,actaLedger,requestBudget,parseAmount,validateOptions,POLICY} from '../core/regularization.mjs';
import {restoreSimulation} from '../core/simulation.mjs';
const fixture=()=>JSON.parse(JSON.stringify(demoDataset()));
const selection=(date,originYear=2027,kind='rest_credit')=>({date,originYear,kind});
function eligible(d,year=2027,rest=false,weekend=false){return annualBalance(d,d.entries[0],year).daily.filter(x=>x.rest===rest&&!x.pfa&&!x.vacation&&!x.medicalRest&&x.date.slice(5)>='02-01'&&([0,6].includes(x.weekday)===weekend)).map(x=>x.date);}
const totals=(baseDays=213,specialCase=false)=>({baseDays,targetMinutes:202*480,reference:'Escenario de jornada completa declarado',specialCase});

test('Saldo de 2026: signo, unidades, coma decimal y minutos exactos',()=>{
 assert.equal(parseAmount('3','days','credit'),1440);assert.equal(parseAmount('3','days','debit'),-1440);
 assert.equal(parseAmount('0,5','days','credit'),240);assert.equal(parseAmount('1.25','hours','debit'),-75);assert.equal(parseAmount('0','hours','zero'),0);
 for(const v of ['-3','NaN','Infinity','1e3','0.0001'])assert.throws(()=>parseAmount(v,'days','credit'));
});
test('Créditos suman y débitos descuentan de los siete, manteniendo origen',()=>{
 assert.deepEqual(requestBudget(3*480),{opening:1440,advance:3360,offset:0,previousPool:1440,currentPool:3360,net:4800});
 assert.deepEqual(requestBudget(-3*480),{opening:-1440,advance:3360,offset:1440,previousPool:0,currentPool:1920,net:1920});
 assert.deepEqual(requestBudget(-10*480),{opening:-4800,advance:3360,offset:3360,previousPool:-1440,currentPool:0,net:-1440});
 assert.equal(requestBudget(null).net,null);assert.equal(requestBudget(0).net,3360);
});
test('Siete del año: no sábado/domingo; saldo anterior sí puede elegirlos',()=>{
 const d=fixture(),date=eligible(d,2027,false,true)[0];assert.ok(date);
 assert.throws(()=>actaYear(d,d.entries[0],2027,{selections:[selection(date)]},480),/lunes a viernes/);
 const r=actaYear(d,d.entries[0],2027,{selections:[selection(date,2026)]},480);assert.equal(r.ready,true);assert.equal(r.unresolvedOpeningMinutes,0);
});
test('Festivo entre semana es elegible para los siete días',()=>{
 const d=fixture(),date=eligible(d)[0];d.calendars[2027].holidays.push(date);
 const r=actaYear(d,d.entries[0],2027,{selections:[selection(date)]},0);assert.equal(r.ready,true);assert.equal(r.daily.find(x=>x.date===date).holiday,true);
});
test('Ni enero, vacaciones, PFA, R.M. ni descanso ya fijo se convierten en crédito',()=>{
 const d=fixture(),p=d.entries[0],base=annualBalance(d,p,2027),january=base.daily.find(x=>x.baseWork&&x.date<'2027-02-01'&&![0,6].includes(x.weekday)).date;
 for(const date of [january,'2027-07-01','2027-02-05',eligible(d,2027,true)[0]])assert.throws(()=>actaYear(d,p,2027,{selections:[selection(date)]},0));
 const medical=eligible(d)[0];p.years[2027].medicalRestDates=[medical];assert.throws(()=>actaYear(d,p,2027,{selections:[selection(medical)]},0));
});
test('No se eligen más de siete; un débito previo reduce ese disponible',()=>{
 const d=fixture(),dates=eligible(d);assert.throws(()=>actaYear(d,d.entries[0],2027,{selections:dates.slice(0,8).map(x=>selection(x))},0),/supera/);
 assert.throws(()=>actaYear(d,d.entries[0],2027,{selections:dates.slice(0,5).map(x=>selection(x))},-3*480),/supera/);
 assert.throws(()=>actaYear(d,d.entries[0],2027,{selections:[selection(eligible(d,2027,true)[0],2027,'work_debit')]},0),/no de trabajo/);
});
test('No conocer el saldo anterior no equivale a cero ni habilita peticiones',()=>{
 const d=fixture(),r=actaYear(d,d.entries[0],2027,{},null);assert.equal(r.budget.net,null);
 assert.throws(()=>actaYear(d,d.entries[0],2027,{selections:[selection(eligible(d)[0])]},null),/Introduce el saldo/);
});
test('Los siete ya adelantados no reaparecen por no haber sido elegidos',()=>{
 const d=fixture(),p=d.entries[0],base=actaYear(d,p,2027,{},0),one=actaYear(d,p,2027,{selections:[selection(eligible(d)[0])]},0);
 assert.equal(base.currentBalanceMinutes,4*480);assert.equal(base.currentRemainingMinutes,7*480);assert.equal(one.currentBalanceMinutes,4*480);assert.equal(one.currentRemainingMinutes,6*480);
 assert.equal(one.workMinutes,base.workMinutes-480);
});
test('Compensación anterior se separa del cómputo nuevo',()=>{
 const d=fixture(),days=eligible(d),r=actaYear(d,d.entries[0],2027,{selections:days.slice(0,3).map(x=>selection(x,2026))},3*480);
 assert.equal(r.currentBalanceMinutes,4*480);assert.equal(r.unresolvedOpeningMinutes,0);assert.equal(r.currentRemainingMinutes,3360);
});
test('Débito anterior menor de siete: neteo no crea crédito duplicado',()=>{
 const d=fixture(),days=eligible(d),r=actaYear(d,d.entries[0],2027,{selections:days.slice(0,4).map(x=>selection(x))},-3*480);
 assert.equal(r.budget.net,4*480);assert.equal(r.previousSettledMinutes,-3*480);assert.equal(r.netRemainingMinutes,0);assert.equal(r.currentBalanceMinutes,4*480);
});
test('Débito mayor de siete: queda trabajo adicional y el mismo neto nuevo',()=>{
 const d=fixture(),rests=eligible(d,2027,true),r=actaYear(d,d.entries[0],2027,{selections:rests.slice(0,3).map(x=>selection(x,2026,'work_debit'))},-10*480);
 assert.equal(r.budget.net,-3*480);assert.equal(r.netRemainingMinutes,0);assert.equal(r.workMinutes,annualBalance(d,d.entries[0],2027).workMinutes+3*480);assert.equal(r.currentBalanceMinutes,4*480);
});
test('Cadena 2027→2028→2029: solo viaja el neto nuevo, no el saldo anterior pendiente',()=>{
 const d=fixture(),p=d.entries[0];p.years[2028].openingBalanceMinutes=null;p.years[2029].openingBalanceMinutes=null;
 const rows=actaLedger(d,p,{},2029,{opening2026Minutes:10*480});
 assert.equal(rows[0].unresolvedOpeningMinutes,10*480);assert.equal(rows[0].projectedNextYearMinutes,4*480);
 assert.equal(rows[1].budget.opening,4*480);assert.equal(rows[1].budget.net,11*480);assert.equal(rows[2].budget.opening,4*480);
});
test('Estimación con total declarado funciona sin grupo y para años sin plan, sin inventar fechas',()=>{
 const d=fixture(),p=d.entries[0];p.restGroup=null;delete p.years[2028];
 const options={opening2026Minutes:3*480,yearlyTotals:{2027:totals(),2028:totals(214)}};
 const rows=actaLedger(d,p,{},2028,options);
 assert.equal(rows[0].calendarReady,false);assert.equal(rows[0].manualTotals,true);assert.equal(rows[0].currentBalanceMinutes,4*480);assert.ok(rows[0].daily.every(d=>d.rest===null));
 assert.equal(rows[1].periodsKnown,false);assert.equal(rows[1].currentBalanceMinutes,5*480);assert.equal(rows[1].budget.net,11*480);
 assert.equal(p.years[2028],undefined);assert.equal(p.restGroup,null);
});
test('Situación excluida del acta detiene el arrastre ordinario',()=>{
 const d=fixture(),r=actaLedger(d,d.entries[0],{},2028,{yearlyTotals:{2027:totals(213,true)}});
 assert.equal(r[0].ready,false);assert.equal(r[0].excludedCase,true);assert.equal(r[1].budget.opening,null);
});
test('Importado prevalece frente a una proyección y no se cambian campos fijos',()=>{
 const d=fixture();d.entries[0].years[2028].openingBalanceMinutes=2*480;
 const rows=actaLedger(d,d.entries[0],{},2028,{opening2026Minutes:480});assert.equal(rows[1].budget.opening,960);assert.equal(rows[1].openingOrigin,'imported');
 assert.throws(()=>validateOptions({restGroup:4}));assert.throws(()=>validateOptions({yearlyTotals:{2027:{...totals(),restGroup:4}}}));assert.throws(()=>validateOptions({yearlyTotals:{2027:totals(366)}}));
});
test('Descarga y recuperación conservan saldo 2026 y totales futuros, sin otra plantilla',()=>{
 const d=demoDataset(),p=d.entries[0],raw={schema:'scmm-personal-simulation-v1',datasetVersion:d.version,dne:p.dne,demo:true,lottery:{number:'00000',mode:'random'},overrides:{},calculationOptions:{opening2026Minutes:-1440,yearlyTotals:{2028:totals(213)}}};
 const r=restoreSimulation(raw,d,p);assert.equal(r.calculationOptions.opening2026Minutes,-1440);assert.equal(r.calculationOptions.yearlyTotals[2028].baseDays,213);assert.equal(r.dataset,undefined);
});
test('Datos ausentes no fabrican un cómputo anual, aunque se conozca el saldo inicial',()=>{
 const d=fixture();d.entries[0].restGroup=null;const r=actaLedger(d,d.entries[0],{},2028,{opening2026Minutes:480});assert.equal(r[0].ready,false);assert.equal(r[0].projectedNextYearMinutes,undefined);
 assert.equal(r[0].budget.net,8*480);
});

test('El neto generado en 2027 pasa a origen anterior en 2028 y puede elegirse en fin de semana',()=>{
 const d=fixture(),date=eligible(d,2028,false,true)[0];d.entries[0].years[2028].openingBalanceMinutes=null;
 const rows=actaLedger(d,d.entries[0],{2028:{selections:[selection(date,2027)]}},2028,{opening2026Minutes:0});
 assert.equal(rows[0].projectedNextYearMinutes,4*480);assert.equal(rows[1].ready,true);assert.equal(rows[1].unresolvedOpeningMinutes,3*480);assert.equal(rows[1].currentBalanceMinutes,4*480);
});

test('CSV final de escalafón conserva la columna orden_total como antigüedad',async()=>{
 const {rosterCsvToDataset}=await import('../core/dataset.mjs');
 const d=rosterCsvToDataset('orden_total;DNE\n37;9000000001\n');assert.equal(d.entries[0].seniorityRank,37);assert.equal(d.entries[0].dne,'9000000001');
});

test('Calendario ordinario completo aplica la referencia de 202 jornadas e identifica su origen',()=>{
 const d=fixture();d.entries[0].years[2027].annualTargetMinutes=null;
 const r=actaYear(d,d.entries[0],2027,{},0);assert.equal(r.ready,true);assert.equal(r.targetOrigin,'ordinary_reference');assert.equal(r.annualTargetMinutes,202*480);
 d.entries[0].years[2027].dailyMinutes=360;const other=actaYear(d,d.entries[0],2027,{},0);assert.equal(other.projectedNextYearMinutes,null);
});
