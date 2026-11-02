import data from './example-2027-data.mjs';
import {validateDataset} from './dataset.mjs';
// Documentary calendar, fictional person and explicitly assumed prior balance.
export function explainedExample(openingDays=4){
 if(![4,-3].includes(openingDays))throw Error('Elige uno de los dos supuestos explicados.');
 return validateDataset({schema:'scmm-personal-simulator-v1',version:'example-2027-approved-v1',demo:true,sourceReference:'Ejemplo explicado: GR1, periodo 1A, calendario 2027 contrastado con la presentación. DNE ficticio, saldo anterior supuesto y disponibilidad de cupo no comprobada.',entries:[{dne:'9000000001',seniorityRank:1,restGroup:1,years:{2027:{vacations:data.period.vacations,pfa:data.period.pfa,medicalRestDates:[data.period.medicalRestDate],dailyMinutes:480,annualTargetMinutes:202*480,openingBalanceMinutes:openingDays*480,periodLabel:'Ejemplo explicado · Periodo 1A',sourceReference:'Calendario GR1 y periodo 1A del ejemplo revisado. Se supone año completo y jornada completa.'}}}],calendars:{2027:{groups:{1:data.rest},holidays:data.holidays,verified:true,sourceReference:'Calendario GR1 de 2027 usado en los ejemplos de la presentación revisada.'}}});
}
