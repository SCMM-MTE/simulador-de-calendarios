"""Create an offline HTML copy of the personal app without private datasets."""
from pathlib import Path
import re,json,argparse,base64
p=argparse.ArgumentParser();p.add_argument('output',type=Path);a=p.parse_args()
repo=Path(__file__).resolve().parents[1];root=repo/'personal';modules={}
def collect(file):
 file=file.resolve();key=file.relative_to(root).as_posix()
 if key in modules:return key
 if not file.is_relative_to(root):raise ValueError('Module outside personal app')
 text=file.read_text(encoding='utf-8-sig');modules[key]=''
 pattern=r"^import\s+(.+?)\s+from\s+['\"](.+?)['\"];?\s*$"
 def imp(m):
  names,url=m.groups();dep=collect(file.parent/url)
  if names.startswith('{'):target=names.replace(' as ',': ')
  elif re.fullmatch(r'\w+',names):target='{default:'+names+'}'
  else:raise ValueError('Unsupported import '+names)
  return f'const {target}=__load({json.dumps(dep)});'
 text=re.sub(pattern,imp,text,flags=re.M)
 exports=re.findall(r'\bexport\s+(?:async\s+)?(?:function|const|let|class)\s+(\w+)',text)
 default=''
 if 'export default ' in text:text=text.replace('export default ','const __default=');default=',default:__default'
 text=re.sub(r'\bexport\s+(?=(?:async\s+)?(?:function|const|let|class)\b)','',text)
 if re.search(r'^\s*(?:import|export)\b',text,re.M):raise ValueError('Unsupported module syntax')
 modules[key]=text+'\nreturn {'+(','.join(exports)+default).lstrip(',')+'};'
 return key
entry=collect(root/'app.mjs')
js="(()=>{'use strict';const __modules={"+','.join(json.dumps(k)+':()=>{'+v+'}' for k,v in modules.items())+"};const __cache={};function __load(k){return __cache[k]??(__cache[k]=__modules[k]());}__load("+json.dumps(entry)+");})();"
html=(root/'index.html').read_text(encoding='utf8')
css=(root/'styles.css').read_text(encoding='utf8')+'\n'+(root/'learning.css').read_text(encoding='utf8')
html=html.replace('<link rel="stylesheet" href="./styles.css"><link rel="stylesheet" href="./learning.css">','<style>'+css+'</style>')
svg='data:image/svg+xml;base64,'+base64.b64encode((root/'assets/scmm-logo.svg').read_bytes()).decode()
html=html.replace('./assets/scmm-logo.svg',svg)
html=html.replace('<script type="module" src="./app.mjs"></script>','<script>'+js.replace('</script','<\\/script')+'</script>')
a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(html,encoding='utf8');a.output.with_suffix('.check.js').write_text(js,encoding='utf8')
print('Offline HTML ready:',a.output,'modules:',len(modules))

