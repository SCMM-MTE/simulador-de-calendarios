import {yearDates,weekday,inRanges} from './dates.mjs';
import {validateDataset} from './dataset.mjs';
// Explicitly fictional and never loaded as the real roster.
export function demoDataset() {
  const calendars={},entries=[];
  for(const year of [2027,2028,2029]){
    const groups={};
    for(let group=1;group<=4;group++)groups[group]=yearDates(year).filter((date,i)=>(Math.floor(i/7)+group)%4<2?[0,6].includes(weekday(date)):[(group+1)%7,(group+2)%7].includes(weekday(date)));
    calendars[year]={groups,holidays:[`${year}-01-01`,`${year}-12-25`,`${year}-12-31`],verified:false,sourceReference:'Calendario ficticio de demostración. No es el calendario de Metro.'};
  }
  for(let i=0;i<24;i++){
    const restGroup=i%4+1,years={};
    for(const year of [2027,2028,2029]){
      const vacations=[{start:`${year}-07-01`,end:`${year}-07-30`}],pfa=[{start:`${year}-02-03`,end:`${year}-02-23`}],rests=new Set(calendars[year].groups[restGroup]);
      const workDays=yearDates(year).filter(d=>!rests.has(d)&&!inRanges(d,vacations)&&!inRanges(d,pfa)).length;
      years[year]={vacations,pfa,dailyMinutes:480,annualTargetMinutes:(workDays-11)*480,openingBalanceMinutes:year===2027?0:null,sourceReference:'Objetivo y periodos ficticios para probar la interfaz.'};
    }
    entries.push({dne:String(9000000001+i),seniorityRank:i+1,restGroup,years});
  }
  return validateDataset({schema:'scmm-personal-simulator-v1',version:'demo-v1',demo:true,sourceReference:'Demostración con DNE, escalafón, objetivos y calendarios ficticios. Sin datos reales.',entries,calendars});
}
