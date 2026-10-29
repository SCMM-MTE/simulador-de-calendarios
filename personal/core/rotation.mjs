// Acta CSD 13/05/2026, apartados 3.1–3.4, PDF pp. 4–6.
// Original read and visually checked 28/10/2026. No roster or personal data here.
export const evidence = Object.freeze({title:'Acta CSD de jornada y regularización MTE, 13/05/2026',sha256:'c9c19383040e32b34d77b8d7686a0c94449053a6fcb1c79675a8efefa803aae4',pages:[4,5,6],firstYear:2027,officialLottery:'Sorteo del Niño · 06/01/2027',continuationReference:'Continuidad anual confirmada por el usuario el 18/10/2026; tabla original 2027–2039.'});
export const BLOCK_CYCLE=Object.freeze([1,13,2,12,3,11,4,10,5,9,6,8,7]);
const GROUPS=['A','B','C'];
export function dne(value) {
  const raw=String(value??'').trim();
  if(!/^\d{1,10}$/.test(raw))throw Error('El DNE debe contener únicamente dígitos.');
  const n=BigInt(raw);if(n===0n)throw Error('El DNE no puede ser cero.');return String(n);
}
export function lotteryNumber(value) {
  if(!/^\d{5}$/.test(String(value)))throw Error('Introduce las cinco cifras del sorteo, incluidos sus ceros iniciales.');
  return Number(value);
}
export function randomLottery(cryptoApi=globalThis.crypto) {
  // Rejection sampling avoids modulo bias.
  const threshold=Math.floor(2**32/100000)*100000,buffer=new Uint32Array(1);
  do{cryptoApi.getRandomValues(buffer);}while(buffer[0]>=threshold);
  return String(buffer[0]%100000).padStart(5,'0');
}
export function initialPosition(number,population) {
  lotteryNumber(number);
  if(!Number.isSafeInteger(population)||population<=0)throw Error('Falta una plantilla válida para realizar el sorteo.');
  return Number(BigInt(number)*BigInt(population)/100000n)+1;
}
export function slotAt(index) {
  if(!Number.isSafeInteger(index)||index<0)throw Error('Posición de relleno no válida.');
  const within=index%156;
  return {initialBlock:within%13+1,group:GROUPS[Math.floor(within/13)%3],subgroup:Math.floor(within/39)+1,seat:Math.floor(index/156)+1};
}
export function drawRoster(entries,number) {
  if(!Array.isArray(entries)||entries.length<1||entries.length>20000)throw Error('Carga antes un escalafón válido.');
  const sorted=entries.map(e=>({...e,dne:dne(e.dne)})).sort((a,b)=>BigInt(a.dne)<BigInt(b.dne)?-1:1);
  if(new Set(sorted.map(e=>e.dne)).size!==sorted.length)throw Error('El escalafón contiene DNE duplicados.');
  const start=initialPosition(number,sorted.length)-1;
  return sorted.map((_,i)=>{const person=sorted[(start+i)%sorted.length];return {...person,lotteryOrder:i+1,assignment:person.officialAssignment??slotAt(i),assignmentOrigin:person.officialAssignment?'Asignación importada; prevalece sobre la simulación del sorteo':'Simulación del reparto inicial según acta'};});
}
export function slotOrder(year) {
  if(!Number.isInteger(year)||year<2027||year>2100)throw Error('Año de rotación no válido.');
  const elapsed=year-2027,slots=[];
  for(let g=0;g<3;g++)for(let s=0;s<4;s++)slots.push(GROUPS[(g+elapsed)%3]+((s+elapsed)%4+1));
  return slots;
}
export function annualPreference(assignment,year) {
  const {initialBlock,group,subgroup}=assignment??{};
  if(!BLOCK_CYCLE.includes(initialBlock)||!GROUPS.includes(group)||!Number.isInteger(subgroup)||subgroup<1||subgroup>4)throw Error('Falta una asignación válida de bloque, grupo y subgrupo.');
  const order=slotOrder(year),block=BLOCK_CYCLE[(BLOCK_CYCLE.indexOf(initialBlock)+(year-2027)%13)%13],within=order.indexOf(group+subgroup)+1;
  return {year,block,permanentSlot:group+subgroup,withinBlockPriority:within,subgroupPriority:(block-1)*12+within,order,documentaryRange:year<=2039};
}
export function annualRosterOrder(roster,year) {
  return roster.map(p=>({...p,preference:annualPreference(p.assignment,year)})).sort((a,b)=>a.preference.subgroupPriority-b.preference.subgroupPriority||(a.assignment.seat??20001)-(b.assignment.seat??20001)||a.lotteryOrder-b.lotteryOrder).map((p,i)=>({...p,simulatedAnnualOrder:i+1}));
}
