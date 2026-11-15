import csv,io,zipfile,math,re,sys
from collections import defaultdict,Counter
from pathlib import Path

centro=(-22.908246,-47.066752)
def ler(arquivo,nome,sep):
    with zipfile.ZipFile(arquivo) as z:
        membro=next(n for n in z.namelist() if n.endswith('/'+nome) or n==nome)
        with z.open(membro) as f:
            yield from csv.DictReader(io.TextIOWrapper(f,encoding='utf-8-sig'),delimiter=sep)

def distancia(lat,lon):
    a,b=map(math.radians,(lat,centro[0]))
    h=math.sin((a-b)/2)**2+math.cos(a)*math.cos(b)*math.sin(math.radians(lon-centro[1])/2)**2
    return 6371.0088*2*math.asin(math.sqrt(h))

def faixa(d):
    return 'Abaixo de 6 km' if d<6 else '6 a 8 km' if d<=8 else 'Acima de 8 km'

cnefe,casa=map(Path,sys.argv[1:3])
territorio=[r for r in ler(casa,'territorio.csv',',') if r['nivel'].startswith('prefixo')]
prefixos={r['rotulo'] for r in territorio if re.fullmatch(r'\d{5}',r['rotulo'])}
pontos=defaultdict(set)
for r in ler(cnefe,'3509502_CAMPINAS.csv',';'):
    cep=r['CEP']
    if not re.fullmatch(r'\d{8}',cep) or cep[:5] not in prefixos: continue
    try: lat,lon=float(r['LATITUDE']),float(r['LONGITUDE'])
    except ValueError: continue
    if -24<lat<-21 and -49<lon<-45: pontos[cep[:5]].add((lat,lon))
classes={}
saida=Path(__file__).parent
def escrever(nome,header,rows):
    with (saida/nome).open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.writer(f,delimiter=';');w.writerow(header);w.writerows(rows)
reg=[]
for p in sorted(prefixos):
    ds=[distancia(*xy) for xy in pontos[p]]
    fs={faixa(d) for d in ds}
    classes[p]=next(iter(fs)) if len(fs)==1 else 'Cruza faixas' if fs else 'Sem correspondência em Campinas'
    reg.append((p,len(ds),f'{min(ds):.3f}' if ds else '',f'{max(ds):.3f}' if ds else '',classes[p]))
escrever('prefixos.csv',['prefixo','pontos_distintos','min_km','max_km','classificacao'],reg)
projetos={r['codigo']:r for r in ler(casa,'projetos.csv',',')}
grupos=defaultdict(Counter)
for r in territorio:
    assert r['n'].isdigit()
    grupos[r['codigo']][classes.get(r['rotulo'],'Agrupado ou sem prefixo')]+=int(r['n'])
linhas=[]; soma=Counter()
for k,c in sorted(grupos.items()):
    total=int(projetos[k]['inscricoes'])
    assert sum(c.values())<=total
    c['Sem linha divulgada']=total-sum(c.values())
    soma.update(c)
    linhas.extend((k,projetos[k]['projeto'],f,n,total,round(100*n/total,2)) for f,n in c.items())
escrever('por_projeto.csv',['codigo','projeto','classificacao','inscricoes','total_do_projeto','percentual'],linhas)
print(len(prefixos),sum(bool(pontos[p]) for p in prefixos),len(grupos),sum(soma.values()),soma)
print(reg)

# Mapa dos pontos públicos de referência, sem registros da Casa Hacker.
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Circle
fig,ax=plt.subplots(figsize=(9,8),layout='constrained')
for i,(p,coords) in enumerate(sorted(pontos.items())):
    x=[(lon-centro[1])*111.195*math.cos(math.radians(centro[0])) for lat,lon in coords]
    y=[(lat-centro[0])*111.195 for lat,lon in coords]
    ax.scatter(x,y,s=1,alpha=.28,color='#678b80',label='Pontos públicos do CNEFE' if i==0 else None)
for raio,cor in [(6,'#245cb0'),(8,'#b65321')]:
    ax.add_patch(Circle((0,0),raio,fill=False,color=cor,lw=2,label=f'Raio de {raio} km'))
ax.scatter(0,0,marker='*',s=145,color='#161b29',label='Estação Cultura',zorder=4)
ax.set(aspect='equal',xlabel='Leste / oeste (km)',ylabel='Norte / sul (km)',title='Referência territorial por prefixo de CEP • Campinas')
ax.legend(loc='upper left',markerscale=2)
ax.set_xlabel('Leste / oeste (km)\n' + 'Fonte: IBGE, CNEFE 2022. Visualização em plano local aproximado. Classificação por distância de Haversine.',fontsize=9)
fig.savefig(saida/'mapa.png',dpi=180)

# Células de 500 m com ao menos um ponto público de referência.
import json
grade = {}
for prefixo, coords in pontos.items():
    if not coords:
        continue
    grade[prefixo] = sorted({
        (math.floor((lon-centro[1])*111.195*math.cos(math.radians(centro[0]))*2),
         math.floor((lat-centro[0])*111.195*2))
        for lat, lon in coords
    })
(saida/'grade.json').write_text(json.dumps(grade, separators=(',', ':')), encoding='utf-8')
