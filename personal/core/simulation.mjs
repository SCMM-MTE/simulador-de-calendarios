import {lotteryNumber} from './rotation.mjs';
import {overridePlan} from './dataset.mjs';
import {actaLedger,validateOptions} from './regularization.mjs';
export function restoreSimulation(raw,dataset,profile){
  if(raw?.schema!=='scmm-personal-simulation-v1'||raw.datasetVersion!==dataset.version||raw.dne!==profile.dne||raw.demo!==dataset.demo)throw Error('Esta simulación no corresponde al DNE y a la versión del archivo cargado.');
  lotteryNumber(raw.lottery?.number);
  if(!['once','random','nino'].includes(raw.lottery.mode))throw Error('Referencia de sorteo no válida.');
  if(!raw.overrides||typeof raw.overrides!=='object'||Array.isArray(raw.overrides))throw Error('Faltan las elecciones guardadas.');
  const overrides={};
  for(const [key,changes] of Object.entries(raw.overrides)){
    const year=Number(key);if(!/^\d{4}$/.test(key)||year<2027||year>2100)throw Error('Año de simulación no válido.');
    const safe=overridePlan(profile,year,changes);
    overrides[year]={vacations:safe.vacations,pfa:safe.pfa,selections:safe.selections};
  }
  const calculationOptions=validateOptions(raw.calculationOptions??{});
  const results=actaLedger(dataset,profile,overrides,Math.max(2027,...Object.keys(overrides).map(Number),...Object.keys(calculationOptions.yearlyTotals).map(Number)),calculationOptions);
  if(results.some(r=>r.invalidPlan))throw Error('La simulación contiene elecciones incompatibles con los saldos o periodos cargados.');
  return {overrides,number:raw.lottery.number,mode:raw.lottery.mode,calculationOptions};
}
