import test from 'node:test';
import assert from 'node:assert/strict';
import {explainedExample} from '../core/example-2027.mjs';
import {actaYear,actaLedger} from '../core/regularization.mjs';
import {allocateChoices} from '../core/automatic-choices.mjs';
import {balanceExplanation,explainDate} from '../core/explanation.mjs';
import {drawRoster} from '../core/rotation.mjs';
import {validateDataset} from '../core/dataset.mjs';
const run=(d,choices=[],mode='inside')=>actaYear(d,d.entries[0],2027,{selections:choices},d.entries[0].years[2027].openingBalanceMinutes,null,mode);
test('Ejemplo revisado: 213 previstas, objetivo 202, siete del año y cuatro nuevos',()=>{
 const d=explainedExample(4),r=run(d),s=balanceExplanation(r,2027);
 assert.equal(s.base,213);assert.equal(s.target,202);assert.equal(s.generated,4);assert.equal(s.formula,'213 − 202 − 7 = 4');
 assert.equal(s.opening,4);assert.equal(s.currentRemaining,7);
 const dates=['2027-02-01','2027-02-02','2027-02-03','2027-02-04','2027-02-05','2027-02-13','2027-02-14','2027-02-08','2027-03-19','2027-02-20','2027-02-21'];
 const choices=allocateChoices(dates,r.daily,2027,r.budget),end=run(d,choices),story=balanceExplanation(end,2027);
 assert.equal(end.workMinutes/480,202);assert.equal(story.generated,4);assert.equal(story.previousRemaining,0);assert.equal(story.currentRemaining,0);
 assert.deepEqual(choices.filter(x=>x.originYear===2026).map(x=>x.date),['2027-02-13','2027-02-14','2027-02-20','2027-02-21']);
});
test('Débito anterior: cuatro descansos, saldo nuevo cuatro y débito compensado aparte',()=>{
 const d=explainedExample(-3),r=run(d),choices=allocateChoices(['2027-02-01','2027-02-02','2027-02-03','2027-02-04'],r.daily,2027,r.budget),s=balanceExplanation(run(d,choices),2027);
 assert.equal(s.offset,3);assert.equal(s.currentRemaining,0);assert.equal(s.previousRemaining,0);assert.equal(s.generated,4);assert.match(s.explanation,/se compensa aparte/);
});
test('Reconocimiento fuera: cambian ambas referencias y se conserva el saldo nuevo',()=>{
 const r=run(explainedExample(4),[],'outside'),s=balanceExplanation(r,2027);
 assert.equal(s.formula,'212 − 201 − 7 = 4');assert.equal(r.daily.find(x=>x.date==='2027-06-15').medicalRest,true);
});
test('Explicar la fecha respeta origen, festivo, cupos, vacaciones y periodo ordinario',()=>{
 const credit=run(explainedExample(4)),debit=run(explainedExample(-3));
 assert.equal(explainDate('2027-02-13',credit,2027).origin,2026);
 assert.equal(explainDate('2027-02-13',debit,2027).allowed,false);
 assert.equal(explainDate('2027-03-19',credit,2027).origin,2027);
 assert.match(explainDate('2027-03-19',credit,2027).text,/festivo/);
 assert.equal(explainDate('2027-06-20',credit,2027).title,'Vacaciones');
 assert.equal(explainDate('2027-01-04',credit,2027).allowed,false);
 assert.equal(explainDate('2028-02-01',credit,2027).allowed,false);
 assert.equal(explainDate('',credit,2027).allowed,false);
});
test('Años sin calendario y casos excluidos no muestran una ecuación inventada',()=>{
 const d=explainedExample(4),r=actaLedger(d,d.entries[0],{},2028,{medicalModes:{2027:'inside'}})[1],s=balanceExplanation(r,2028);
 assert.equal(s.opening,4);assert.equal(s.generated,null);assert.equal(s.formula,null);
 assert.equal(balanceExplanation({ready:false,excludedCase:true},2027).formula,null);
});
test('El DNE inicial se obtiene del escalafón y nunca de ordenar los identificadores',()=>{
 const entries=[{dne:'99',seniorityRank:1},{dne:'10',seniorityRank:2},{dne:'1',seniorityRank:3}];
 assert.equal(drawRoster(entries,'00000')[0].dne,'99');
 assert.deepEqual(drawRoster(entries,'50000').map(p=>p.dne),['10','1','99']);
 assert.throws(()=>drawRoster([{dne:'1'}],'00000'),/escalafón completo/);
 assert.throws(()=>drawRoster([{dne:'1',seniorityRank:1},{dne:'2',seniorityRank:1}],'00000'),/escalafón completo/);
 const raw=JSON.parse(JSON.stringify(explainedExample()));delete raw.entries[0].seniorityRank;assert.equal(validateDataset(raw).rosterReady,false);
});
