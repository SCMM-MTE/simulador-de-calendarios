#!/usr/bin/env python3
"""Extract nominal MTE periods privately. Never writes names or publishes data.
Requires PyMuPDF. Outputs to an explicitly supplied directory outside the repo.
"""
from __future__ import annotations
import argparse, collections, datetime as dt, hashlib, json, re
from pathlib import Path
import fitz

MONTHS={m:i+1 for i,m in enumerate(('ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'))}
MONTH_PATTERN='(?:'+'|'.join(MONTHS)+')'
RANGE=rf'(?:DE)?(\d{{1,2}})({MONTH_PATTERN})A(\d{{1,2}})({MONTH_PATTERN})'
YEAR=2027
RULE={'reference':'Convenio MTE 2025–2027, PDF 89 (impresa 88) y PDF 199 (impresa 198), anexo XI.B; contraste confirmado 18/10/2026', 'winter28':'primeros 7 días vacaciones; últimos 21 días PFA', 'winter21':'21 días íntegros PFA', 'rm':'descanso compensatorio, no vacaciones ni cita médica; referencia PDF 210 (impresa 209)'}

def compact(text):return re.sub(r'\s+','',text).upper()
def required(pattern,text,label):
    found=re.search(pattern,text)
    if not found:raise ValueError('No se ha reconocido '+label)
    return found

def date(day,month):return dt.date(YEAR,MONTHS[month],int(day)).isoformat()
def interval(match):
    a,b,c,d=match.groups();start,end=date(a,b),date(c,d)
    if end<start:raise ValueError('Periodo invertido')
    return {'start':start,'end':end}
def days(period):return (dt.date.fromisoformat(period['end'])-dt.date.fromisoformat(period['start'])).days+1

def composition(summer,winter):
    summer_days,winter_days=days(summer),days(winter)
    if (summer_days,winter_days) not in ((30,21),(23,28)):raise ValueError('Composición anual distinta de 30+21 o 23+28')
    vacations=[summer.copy()]
    if winter_days==28:
        first=dt.date.fromisoformat(winter['start']);vacations.append({'start':winter['start'],'end':(first+dt.timedelta(days=6)).isoformat()})
        pfa=[{'start':(first+dt.timedelta(days=7)).isoformat(),'end':winter['end']}]
    else:pfa=[winter.copy()]
    if sum(map(days,vacations))!=30 or sum(map(days,pfa))!=21:raise ValueError('Totales de vacaciones/PFA no válidos')
    return vacations,pfa

def parse_periods(text,special=False):
    t=compact(text)
    if special:
        summer_code=required(r'PERIODOVERANO\(([1-5])\)',t,'periodo de verano especial').group(1)
        winter_code=required(r'PERIODOINVIERNO\(([1-5][A-D][12]?)\)',t,'periodo de invierno especial').group(1)
        summer=interval(required(r'PERIODOVERANO\([1-5]\)'+RANGE,t,'fechas de verano especiales'))
        winter=interval(required(r'PERIODOINVIERNO\([1-5][A-D][12]?\)'+RANGE,t,'fechas de invierno especiales'))
    else:
        winter_code=required(r'PERIODO([1-5][A-D][12]?)(?=VERANO:)',t,'periodo').group(1);summer_code=winter_code[0]
        summer=interval(required(r'VERANO:'+RANGE,t,'verano'))
        winter=interval(required(r'INVIERNO:'+RANGE,t,'invierno'))
    rm=required(r'R\.M\.:?(\d{1,2})('+MONTH_PATTERN+')',t,'R.M.')
    medical=date(*rm.groups());vacations,pfa=composition(summer,winter)
    if any(r['start']<=medical<=r['end'] for r in [summer,winter]):raise ValueError('R.M. solapado con periodos')
    return {'summerPeriodCode':summer_code,'winterPeriodCode':winter_code,'summer':summer,'winter':winter,'vacations':vacations,'pfa':pfa,'medicalRestDate':medical,'specialMarriage':special}

def extract(source:Path):
    doc=fitz.open(source);records=[];page_counts=[];sections={};ids=set()
    if len(doc)!=56:raise ValueError('Este formato requiere comprobar de nuevo el número de páginas')
    for i,page in enumerate(doc):
        words=page.get_text('words')
        text=compact(page.get_text('text',clip=fitz.Rect(0,80,595,265)))
        if 'AÑO2027' not in text:raise ValueError(f'Falta año 2027 en página {i+1}')
        special='PORMATRIMONIO' in text
        numeric=[w for w in words if re.fullmatch(r'\d{3,6}',w[4]) and w[1]>265]
        identifiers=[w for w in numeric if 76<w[0]<104]
        # Reconcile all body numeric tokens, not just the expected DNE column.
        if len(identifiers)!=len(numeric):raise ValueError(f'Número fuera de columna esperado en página {i+1}')
        independent=re.findall(r'^\d{3,6}$',page.get_text('text',clip=fitz.Rect(76,265,110,810)),re.M)
        if collections.Counter(independent)!=collections.Counter(w[4] for w in identifiers):raise ValueError(f'Conteo independiente no coincide en página {i+1}')
        identifiers.sort(key=lambda w:w[1]);page_counts.append(len(identifiers))
        if not identifiers:raise ValueError('Página sin DNE')
        common=None if special else parse_periods(page.get_text('text',clip=fitz.Rect(0,160,595,265)))
        for row,w in enumerate(identifiers):
            identifier=str(int(w[4]))
            if identifier in ids:raise ValueError('DNE repetido: se requiere resolver el conflicto antes de importar')
            ids.add(identifier)
            end=identifiers[row+1][1]-1 if row+1<len(identifiers) else 810
            periods=parse_periods(page.get_text('text',clip=fitz.Rect(76,w[1]-.5,560,end),sort=True),True) if special else common
            record={'dne':identifier,**periods,'sourcePage':i+1,'sourceRow':row+1};records.append(record)
            if not special:
                code=periods['winterPeriodCode'];signature={k:v for k,v in periods.items() if k not in ('specialMarriage',)}
                if code in sections and sections[code]['periods']!=signature:raise ValueError('Cabeceras inconsistentes entre páginas')
                sections.setdefault(code,{'periods':signature,'pages':set(),'count':0});sections[code]['pages'].add(i+1);sections[code]['count']+=1
    return records,page_counts,{k:{**v,'pages':sorted(v['pages'])} for k,v in sections.items()}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('pdf',type=Path);parser.add_argument('output',type=Path);args=parser.parse_args()
    repo=Path(__file__).resolve().parents[1];output=args.output.resolve()
    if output.is_relative_to(repo):raise SystemExit('La salida nominal debe estar fuera del repositorio público')
    output.mkdir(parents=True,exist_ok=True);output.chmod(0o700)
    records,page_counts,sections=extract(args.pdf);digest=hashlib.sha256(args.pdf.read_bytes()).hexdigest()
    reference=f'{args.pdf.name}; SHA-256 {digest}'
    report={'schema':'scmm-mte-periods-extraction-v1','year':YEAR,'sourceFile':args.pdf.name,'sha256':digest,'pages':len(page_counts),'records':len(records),'uniqueDne':len(set(r['dne'] for r in records)),'standardRecords':sum(not r['specialMarriage'] for r in records),'marriageRecords':sum(r['specialMarriage'] for r in records),'pageCounts':page_counts,'sections':sections,'compositionRule':RULE,'validation':{'duplicateDne':0,'missingPeriods':0,'invalidAnnualComposition':0,'namesRetained':False,'seniorityAssigned':False,'restGroupAssigned':False},'recordsData':records}
    entries=[]
    for r in records:
        label=f"Verano {r['summerPeriodCode']} · Invierno {r['winterPeriodCode']}"+(' · matrimonio' if r['specialMarriage'] else '')
        entries.append({'dne':r['dne'],'seniorityRank':None,'restGroup':None,'years':{'2027':{'vacations':r['vacations'],'pfa':r['pfa'],'medicalRestDates':[r['medicalRestDate']],'periodLabel':label,'dailyMinutes':480,'annualTargetMinutes':None,'openingBalanceMinutes':None,'sourceReference':f"{reference}; página {r['sourcePage']}, fila {r['sourceRow']}; composición de invierno: Convenio PDF 89 y 199, validación 18/10/2026"}}})
    dataset={'schema':'scmm-personal-simulator-v1','version':'periodos-2027-'+digest[:12],'sourceReference':reference,'demo':False,'rosterReady':False,'entries':sorted(entries,key=lambda p:int(p['dne'])),'calendars':{}}
    for name,data in [('extraccion-con-trazabilidad.json',report),('vacaciones-pfa-mte-2027.json',dataset)]:
        path=output/name;path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps({k:report[k] for k in ['pages','records','uniqueDne','standardRecords','marriageRecords','validation']},ensure_ascii=False))

if __name__=='__main__':main()
