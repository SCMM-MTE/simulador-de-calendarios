export const DAY_MS = 86400000;
export function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw Error('La fecha debe tener formato AAAA-MM-DD.');
  const date = new Date(value+'T00:00:00Z');
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10)!==value) throw Error('Fecha no válida.');
  return date;
}
export const iso = date => date.toISOString().slice(0,10);
export const weekday = date => parseDate(date).getUTCDay();
export function addDays(date, amount) {
  if (!Number.isSafeInteger(amount)) throw Error('El desplazamiento debe ser un número entero de días.');
  return iso(new Date(parseDate(date).getTime()+amount*DAY_MS));
}
export function datesBetween(start,end) {
  const first=parseDate(start).getTime(),last=parseDate(end).getTime();
  if(first>last || (last-first)/DAY_MS>366) throw Error('Intervalo no válido o superior a un año.');
  return Array.from({length:(last-first)/DAY_MS+1},(_,i)=>iso(new Date(first+i*DAY_MS)));
}
export const yearDates = year => {
  if (!Number.isInteger(year)||year<2027||year>2100) throw Error('El calendario admite años entre 2027 y 2100.');
  return datesBetween(`${year}-01-01`,`${year}-12-31`);
};
export function validateRanges(ranges,year) {
  if (!Array.isArray(ranges)||ranges.length>24) throw Error('Los periodos deben ser una lista de hasta 24 intervalos.');
  const occupied=new Set();
  return ranges.map(range=>{
    const {start,end}=range??{};
    const dates=datesBetween(start,end);
    if(!dates.every(d=>d.startsWith(year+'-')))throw Error('El periodo debe pertenecer al año de su ficha.');
    if(dates.some(d=>occupied.has(d)))throw Error('Hay periodos solapados.');
    dates.forEach(d=>occupied.add(d));return {start,end};
  });
}
export const inRanges = (date,ranges) => ranges.some(r=>date>=r.start&&date<=r.end);
export const displayDate = date => parseDate(date).toLocaleDateString('es-ES',{timeZone:'UTC',day:'2-digit',month:'2-digit',year:'numeric'});
