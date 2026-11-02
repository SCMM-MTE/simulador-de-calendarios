import test from 'node:test';
import assert from 'node:assert/strict';
import {annualScenario,validateYearPlans} from '../core/annual-plan.mjs';
import {explainedExample} from '../core/example-2027.mjs';
import {actaLedger} from '../core/regularization.mjs';
import {restoreSimulation} from '../core/simulation.mjs';
import {yearDates} from '../core/dates.mjs';
function fixture(){const d=structuredClone(explainedExample(4));const days=yearDates(2027);d.calendars[2027].groups[2]=days.filter((_,i)=>i%28>=14&&i%28<22);return {d,p:d.entries[0]};}
test('Annual choices preserve roster and imported assignments while selecting another group',()=>{
 const {d,p}=fixture(),before=JSON.stringify({d,p});
 const options={yearPlans:{2027:{restGroup:2,periodCode:'2A1',projection:false}}};
 const r=actaLedger(d,p,{},2027,options)[0];
 assert.equal(r.restGroup,2);assert.match(r.plan.periodLabel,/2A1/);assert.equal(JSON.stringify({d,p}),before);
});
test('Future years use a continuous 28-day projection, shifted periods and previous balance',()=>{
 const {d,p}=fixture(),options={yearPlans:{2028:{restGroup:2,periodCode:'1A',projection:true}},medicalModes:{2027:'inside',2028:'inside'}};
 const results=actaLedger(d,p,{},2028,options);const r=results[1];
 assert.equal(r.ready,true);assert.equal(r.restGroup,2);assert.equal(r.budget.opening,results[0].projectedNextYearMinutes);
 assert.ok(r.plan.vacations.every(v=>v.start.startsWith('2028-')&&v.end.startsWith('2028-')));
 const scenario=annualScenario(d,p,options.yearPlans);assert.equal(scenario.dataset.calendars[2028].verified,false);
 const offset=(Date.UTC(2028,0,1)-Date.UTC(2027,0,1))/86400000;
 for(const [i,day] of r.daily.entries())assert.equal(day.rest,(offset+i)%28>=14&&(offset+i)%28<22);
});
test('An annual change does not change the preceding year or invent a future plan by default',()=>{
 const {d,p}=fixture(),a=actaLedger(d,p,{},2028),b=actaLedger(d,p,{},2028,{yearPlans:{2028:{restGroup:2,periodCode:'1B',projection:true}}});
 assert.equal(a[1].ready,false);assert.equal(b[0].workMinutes,a[0].workMinutes);assert.equal(b[0].projectedNextYearMinutes,a[0].projectedNextYearMinutes);
});
test('Future projection needs an explicit flag and rejects incomplete or altered selections',()=>{
 const {d,p}=fixture();assert.throws(()=>annualScenario(d,p,{2028:{restGroup:1,periodCode:'1A',projection:false}}));
 for(const plan of [{restGroup:9,periodCode:'1A',projection:true},{restGroup:1,periodCode:'invented',projection:true},{restGroup:1,periodCode:'1A',projection:true,dne:'1'}])assert.throws(()=>validateYearPlans({2028:plan}));
});
test('Export/restore retains annual groups, periods and valid future date choices',()=>{
 const {d,p}=fixture(),options={yearPlans:{2028:{restGroup:2,periodCode:'1A',projection:true}},medicalModes:{2027:'inside',2028:'inside'}};
 const r=actaLedger(d,p,{},2028,options)[1];const day=r.daily.find(d=>d.date.slice(5)>='02-01'&&!d.rest&&!d.vacation&&!d.pfa&&!d.medicalRest&&d.weekday>0&&d.weekday<6);
 const raw={schema:'scmm-personal-simulation-v1',datasetVersion:d.version,dne:p.dne,demo:d.demo,lottery:{number:'00000',mode:'nino'},overrides:{2028:{selections:[{date:day.date,kind:'rest_credit',originYear:2028}]}},calculationOptions:options};
 const restored=restoreSimulation(raw,d,p);const result=actaLedger(d,p,restored.overrides,2028,restored.calculationOptions)[1];
 assert.equal(result.plan.selections.length,1);assert.equal(result.restGroup,2);assert.equal(result.ready,true);
});
test('SDF future projection never reuses Madrid holidays from the previous reference year',()=>{
 const {d,p}=fixture();d.calendars[2027].groups.SDF=yearDates(2027).filter(d=>[0,6].includes(new Date(d+'T00:00:00Z').getUTCDay()));
 const s=annualScenario(d,p,{2028:{restGroup:'SDF',periodCode:'1A',projection:true}});assert.deepEqual(s.dataset.calendars[2028].holidays,[]);assert.equal(s.dataset.calendars[2028].verified,false);
});
