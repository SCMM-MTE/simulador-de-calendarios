import test from 'node:test';
import assert from 'node:assert/strict';
import {allocateChoices} from '../core/automatic-choices.mjs';
const daily=['2027-02-01','2027-02-02','2027-02-06','2027-02-07'].map(date=>({date,rest:false}));
const budget={currentPool:480,previousPool:1440};
test('Weekdays use current allowance first; weekends and overflow use previous',()=>{
 const choices=allocateChoices(daily.map(d=>d.date),daily,2027,budget);
 assert.deepEqual(choices.map(c=>c.originYear),[2027,2026,2026,2026]);
});
test('Removing a current choice reallocates the next weekday and preserves weekend origin',()=>{
 assert.deepEqual(allocateChoices(['2027-02-02','2027-02-06'],daily,2027,budget).map(c=>c.originYear),[2027,2026]);
});
test('Weekend cannot consume current allowance; exhausted previous balance is rejected',()=>{
 assert.throws(()=>allocateChoices(['2027-02-06'],daily,2027,{currentPool:3360,previousPool:0}));
});
test('Previous debit selects work on a fixed rest without consuming current allowance',()=>{
 const day={date:'2027-02-06',rest:true};
 assert.deepEqual(allocateChoices([day.date],[day],2027,{currentPool:0,previousPool:-480}),[{date:day.date,kind:'work_debit',originYear:2026}]);
});
