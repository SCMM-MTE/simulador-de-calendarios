import test from 'node:test';
import assert from 'node:assert/strict';
import {enroll} from '../core/enrollment.mjs';
import {demoDataset} from '../core/demo.mjs';
import {validateDataset} from '../core/dataset.mjs';
import {periodCatalog} from '../core/periods-2027.mjs';
const setup=()=>structuredClone(demoDataset());
test('Preasignación documental prevalece sobre grupo y periodo enviados por el formulario',()=>{
 const data=setup(),first=data.entries[0];const p=enroll(data,first.dne,'4N','16B');
 assert.equal(p.restGroup,first.restGroup);assert.deepEqual(p.years,first.years);
});
test('DNE existente sin grupo puede declararlo sin alterar su escalafón ni sus periodos',()=>{
 const data=setup(),first=data.entries[0];first.restGroup=null;
 const p=enroll(data,first.dne,'2N','');assert.equal(p.restGroup,'2N');assert.equal(p.seniorityRank,first.seniorityRank);assert.deepEqual(p.years,first.years);assert.equal(first.restGroup,null);
 assert.throws(()=>enroll(data,first.dne,'5',''),/grupo/);
});
test('DNE ausente elige grupo y periodo del PDF, incluido R.M., sin entrar en el sorteo del escalafón',()=>{
 const data=setup(),size=data.entries.length,period=periodCatalog.periods[0],p=enroll(data,'99999','SDF',period.code);
 assert.equal(p.seniorityRank,null);assert.equal(p.restGroup,'SDF');assert.deepEqual(p.years[2027].vacations,period.vacations);assert.deepEqual(p.years[2027].pfa,period.pfa);assert.deepEqual(p.years[2027].medicalRestDates,[period.medicalRestDate]);assert.equal(data.entries.length,size);
 assert.throws(()=>enroll(data,'99999','',''),/grupo/);assert.throws(()=>enroll(data,'99999','1',''),/periodo/);
});
test('No se confunden grupos nocturnos y diurnos al validar el calendario',()=>{
 const data=setup();data.calendars[2027].groups['1N']=['2027-01-02'];data.entries[0].restGroup='1N';
 const safe=validateDataset(data);assert.equal(safe.entries[0].restGroup,'1N');assert.deepEqual(safe.calendars[2027].groups['1N'],['2027-01-02']);assert.notDeepEqual(safe.calendars[2027].groups['1'],safe.calendars[2027].groups['1N']);
});
