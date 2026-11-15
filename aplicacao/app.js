'use strict';
const iniciativas = [
 {nome:'Hackerclubes',area:'Educação STEAM',simbolo:'</>',texto:'Espaços de experimentação que aproximam jovens da tecnologia, da arte e da invenção.'},
 {nome:'Minas em Tech',area:'Educação STEAM',simbolo:'✳',texto:'Iniciativa de educação STEAM apresentada pela Casa Hacker, com foco em ampliar oportunidades.'},
 {nome:'Inclusão Tech',area:'Inclusão Digital',simbolo:'↗',texto:'Aprendizagem e participação no mundo digital para pessoas com diferentes trajetórias.'},
 {nome:'PerifaImpacto',area:'Inovação Social',simbolo:'◎',texto:'Formação e conexão de lideranças e iniciativas de impacto dos territórios periféricos.'},
 {nome:'Quebrada em Movimento',area:'Inovação Social',simbolo:'↔',texto:'Participação comunitária e cidadania, com protagonismo das organizações e lideranças locais.'},
 {nome:'Internet Segura',area:'Inclusão Digital',simbolo:'⌘',texto:'Educação para uma participação digital mais consciente, com atenção à privacidade e à segurança.'},
 {nome:'Legisla STEAM',area:'Políticas Públicas',simbolo:'⌁',texto:'Iniciativa ligada à participação e à incidência em políticas públicas de educação e tecnologia.'}
];
const $ = id => document.getElementById(id);
const normalizar = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function renderCards(){
 const busca=normalizar($('busca').value.trim()), area=$('area').value;
 const lista=iniciativas.filter(i=>(!area||i.area===area)&&normalizar(i.nome+' '+i.texto).includes(busca));
 $('cards').replaceChildren();
 lista.forEach(i=>{
  const card=document.createElement('article');card.className='card';
  const visual=document.createElement('div');visual.className='card-visual';visual.setAttribute('aria-hidden','true');
  const icon=document.createElement('span');icon.textContent=i.simbolo;const numero=document.createElement('small');numero.textContent=String(iniciativas.indexOf(i)+1).padStart(2,'0');visual.append(icon,numero);
  const content=document.createElement('div');content.className='card-content';
  const tag=document.createElement('p');tag.className='eyebrow';tag.textContent=i.area;
  const titulo=document.createElement('h3');titulo.textContent=i.nome;
  const texto=document.createElement('p');texto.textContent=i.texto;
  const botao=document.createElement('button');botao.textContent='Conhecer a iniciativa ↗';botao.setAttribute('aria-label','Conhecer '+i.nome);
  botao.addEventListener('click',()=>{$('modal-area').textContent=i.area;$('modal-titulo').textContent=i.nome;$('modal-texto').textContent=i.texto;$('detalhe').showModal();});
  content.append(tag,titulo,texto,botao);card.append(visual,content);$('cards').append(card);
 });
 $('resultado').textContent=lista.length?`${lista.length} iniciativa(s) encontrada(s)`:'Nenhuma iniciativa encontrada. Tente outro termo ou área.';
}
$('busca').addEventListener('input', renderCards);
$('area').addEventListener('change', renderCards);
$('fechar').addEventListener('click', () => $('detalhe').close());
renderCards();

const fontes = ['projetos', 'perfil', 'frequencia', 'retencao', 'territorio',
  'referencia_ibge_cor_raca'];
let base = {};
let geografia = new Map();
let grade = {};

const mostrar = valor => valor === '' || valor == null ? '—' : String(valor);
const percentual = valor => /^\d+(\.\d+)?$/.test(valor ?? '')
  ? Number(valor).toLocaleString('pt-BR', {maximumFractionDigits: 2}) + '%' : '—';
const razao = (n, total) => /^\d+$/.test(n ?? '') && /^\d+$/.test(total ?? '') && Number(total) > 0
  ? percentual(String(100 * Number(n) / Number(total))) : '—';

function proporcao(n, total) {
  const taxa = razao(n, total);
  return taxa === '—' ? 'Não calculável' : `${n} ÷ ${total} = ${taxa}`;
}

function tabela(titulo, colunas, linhas, destino = $('tabelas-dados')) {
  const bloco = document.createElement('section');
  bloco.className = 'dados-bloco';
  const h = document.createElement('h3');
  h.textContent = titulo;
  bloco.append(h);
  if (!linhas.length) {
    bloco.append('Sem registros divulgados para este recorte.');
  } else {
    const scroll = document.createElement('div');
    scroll.className = 'dados-scroll';
    const table = document.createElement('table');
    table.setAttribute('aria-label', titulo);
    const header = table.createTHead().insertRow();
    for (const coluna of colunas) {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = coluna;
      header.append(th);
    }
    const corpo = table.createTBody();
    for (const linha of linhas) {
      const tr = corpo.insertRow();
      for (const valor of linha) tr.insertCell().textContent = mostrar(valor);
    }
    scroll.append(table);
    bloco.append(scroll);
  }
  destino.append(bloco);
}

const eixosDestaque = ['Identidade de gênero', 'Cor, raça ou etnia',
  'Renda da casa (faixa declarada)', 'Renda familiar por pessoa (salários mínimos)'];

function desenharMapa(projeto, prefixos) {
  const mapa = $('mapa-projeto');
  const ctx = mapa.getContext('2d');
  const centro = [mapa.width / 2, mapa.height / 2];
  const escala = 12;
  ctx.fillStyle = '#f2f8ff';
  ctx.fillRect(0, 0, mapa.width, mapa.height);
  ctx.fillStyle = '#d7e4de';
  function pintar(celulas) {
    for (const [x, y] of celulas) {
      ctx.fillRect(centro[0] + x * escala / 2, centro[1] - (y + 1) * escala / 2, escala / 2, escala / 2);
    }
  }

  const correspondentes = prefixos.filter(r => Object.hasOwn(grade, r.rotulo));
  ctx.fillStyle = '#8b43bd';
  for (const r of correspondentes) pintar(grade[r.rotulo]);
  for (const [km, cor] of [[6, '#245cb0'], [8, '#007189']]) {
    ctx.beginPath();
    ctx.strokeStyle = cor;
    ctx.lineWidth = 2;
    ctx.arc(...centro, km * escala, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = cor;
    ctx.font = '15px sans-serif';
    ctx.fillText(km + ' km', centro[0] + km * escala + 4, centro[1] - (km === 6 ? 18 : 0));
  }
  ctx.fillStyle = '#13294b';
  ctx.beginPath();
  ctx.arc(...centro, 4, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillText('Estação Cultura', centro[0] - 56, centro[1] + 20);
  ctx.fillText('↑ Norte', 20, 28);
  $('legenda-projeto').textContent = projeto
    ? projeto.projeto + (correspondentes.length ? ' • ' + correspondentes.length + ' prefixo(s) mapeado(s).' : ' • Sem prefixos mapeáveis em Campinas. Consulte a tabela por município, quando disponível.')
    : 'Selecione um projeto para destacar as áreas de referência.';
  atualizarMapaInterativo(correspondentes, grade, projeto?.inscricoes);
}

function renderDistancias(projeto, territorio) {
  const destino = $('distancias-dados');
  destino.replaceChildren();
  const prefixos = territorio.filter(r => r.nivel === 'prefixo de CEP (5 dígitos)');
  desenharMapa(projeto, prefixos);
  const total = projeto.inscricoes;
  const grupos = new Map([
    ['Abaixo de 6 km', 0], ['6 a 8 km', 0], ['Acima de 8 km', 0],
    ['Cruza faixas', 0], ['Sem correspondência em Campinas', 0],
    ['Agrupado ou sem prefixo', 0], ['Prefixo fora da referência disponível', 0],
  ]);
  if (!prefixos.length || !/^\d+$/.test(total) || Number(total) === 0 ||
      prefixos.some(r => !/^\d+$/.test(r.n))) {
    destino.textContent = 'Distribuição por distância indisponível para este projeto.';
    return;
  }
  let soma = 0;
  for (const r of prefixos) {
    const grupo = /^\d{5}$/.test(r.rotulo)
      ? geografia.get(r.rotulo)?.classe ?? 'Prefixo fora da referência disponível'
      : 'Agrupado ou sem prefixo';
    grupos.set(grupo, grupos.get(grupo) + Number(r.n));
    soma += Number(r.n);
  }
  if (soma > Number(total)) {
    destino.textContent = 'Os registros por prefixo excedem o total de inscrições do projeto.';
    return;
  }
  if (soma < Number(total)) grupos.set('Sem linha divulgada', Number(total) - soma);
  const semFaixa = [...grupos.values()].slice(3).reduce((a, b) => a + b, 0);
  const nota = document.createElement('p');
  nota.textContent = semFaixa
    ? 'Faixa de 6 a 8 km: total exato indeterminado. Inscrições sem faixa atribuída: ' + proporcao(String(semFaixa), total) + '.'
    : 'Faixa de 6 a 8 km: ' + proporcao(String(grupos.get('6 a 8 km')), total) + ' pela classificação dos prefixos.';
  destino.append(nota);
  tabela(projeto.projeto, ['Faixa estimada ou motivo da indeterminação', 'Inscrições ÷ total'],
    Array.from(grupos, ([grupo, n]) => [grupo, proporcao(String(n), total)]), destino);
  tabela('Prefixos divulgados', ['Prefixo de CEP', 'Inscrições ÷ total', 'Intervalo observado no IBGE'],
    prefixos.filter(r => /^\d{5}$/.test(r.rotulo)).map(r => {
      const ref = geografia.get(r.rotulo);
      const km = ref?.min ? ref.min.replace('.', ',') + ' a ' + ref.max.replace('.', ',') + ' km'
        : 'Sem intervalo disponível';
      return [r.rotulo, proporcao(r.n, total), km];
    }), destino);
}

function resumirBaixaRenda(perfil) {
  const linhas = perfil.filter(r => r.eixo === 'Renda familiar por pessoa (salários mínimos)');
  const total = linhas[0]?.total;
  if (!/^\d+$/.test(total ?? '') || Number(total) === 0 ||
      linhas.some(r => r.total !== total)) return null;
  let ate = 0;
  let acima = 0;
  let informado = 0;
  for (const r of linhas) {
    if (!/^\d+$/.test(r.n ?? '')) continue;
    const n = Number(r.n);
    informado += n;
    if (['Até ½ salário mínimo', 'Até 0,5 salário mínimo'].includes(r.categoria)) ate += n;
    if (['De 1 a 2 salários mínimos'].includes(r.categoria)) acima += n;
  }
  if (informado > Number(total)) return null;
  return {total, ate, acima, indeterminado: Number(total) - ate - acima};
}

function renderBaixaRenda(perfil) {
  const r = resumirBaixaRenda(perfil);
  const titulo = 'Baixa renda por pessoa • corte de renda do CadÚnico (até ½ salário mínimo)';
  const linhas = [['Percentual de inscrições na faixa de baixa renda',
    r && !r.indeterminado ? proporcao(String(r.ate), r.total) : 'Indisponível']];
  if (r) {
    if (r.ate > 0 && r.indeterminado) {
      linhas.push(['Parcela mínima identificada no corte', proporcao(String(r.ate), r.total)]);
    }
    linhas.push(['Acima do corte, identificadas na fonte', proporcao(String(r.acima), r.total)]);
    linhas.push(['Sem classificação pelo corte', proporcao(String(r.indeterminado), r.total)]);
  }
  tabela(titulo, ['Medida', 'Inscrições ÷ total do eixo de renda por pessoa'], linhas);
}

function renderDados() {
  const codigo = $('projeto-dados').value;
  const projeto = base.projetos.find(item => item.codigo === codigo);
  const linhas = nome => base[nome].filter(item => item.codigo === codigo);
  renderDistancias(projeto, linhas('territorio'));
  const eixo = $('eixo-dados').value;
  $('metricas').replaceChildren();
  for (const [rotulo, valor, detalhe] of [
    ['Inscrições', projeto.inscricoes, 'Universo da extração'],
    ['Frequência', percentual(projeto.frequencia_pct), mostrar(projeto.presencas) + ' de ' + mostrar(projeto.oportunidades) + ' oportunidades'],
    ['Saídas registradas', projeto.evadidos, proporcao(projeto.evadidos, projeto.inscricoes) + ' das inscrições'],
  ]) {
    const card = document.createElement('article');
    card.className = 'metric';
    const numero = document.createElement('strong');
    numero.textContent = mostrar(valor);
    card.append(rotulo, numero, detalhe);
    $('metricas').append(card);
  }
  $('tabelas-dados').replaceChildren();
  const dimensoes = eixo === 'destaques' ? eixosDestaque : [eixo];
  const perfil = linhas('perfil');
  renderBaixaRenda(perfil);
  for (const dimensao of dimensoes) {
    tabela('Perfil: ' + dimensao, ['Categoria','Inscrições','Total do eixo','Proporção (inscrições ÷ total do eixo)'],
      perfil.filter(r => r.eixo === dimensao).map(r => [r.categoria,r.n,r.total,proporcao(r.n,r.total)]));
  }
  tabela('Frequência por grupo', ['Eixo','Categoria','Pessoas','Oportunidades','Frequência na fonte'],
    linhas('frequencia').map(r => [r.eixo,r.categoria,r.pessoas,r.oportunidades,percentual(r.frequencia_pct)]));
  tabela('Retenção por medida', ['Medida','Faixa','Contagem','Total da medida','Proporção (contagem ÷ total da medida)'],
    linhas('retencao').map(r => [r.medida,r.faixa,r.n,r.total,proporcao(r.n,r.total)]));
  tabela('Residência agregada por município', ['Município ou grupo','Inscrições','Total do projeto','Proporção (inscrições ÷ total do projeto)'],
    linhas('territorio').filter(r => r.nivel === 'município').map(r => [r.rotulo,r.n,projeto.inscricoes,proporcao(r.n,projeto.inscricoes)]));
  tabela('Referência de raça ou cor na população', ['Categoria','% da população de referência','Fonte','Período'],
    linhas('referencia_ibge_cor_raca').map(r => [r.categoria,percentual(r.pct_populacao),r.fonte,r.periodo]));
}

async function carregarBase() {
  const resposta = await fetch('/api/base');
  if (!resposta.ok) throw new Error('Não foi possível consultar o banco local.');
  const registros = await resposta.json();
  if (!registros) {
    $('dados-status').textContent = 'Selecione os seis arquivos para a primeira importação.';
    return;
  }
  const selecionado = $('projeto-dados').value;
  base = registros;
  const codigos = new Set(base.projetos.map(r => r.codigo));
  $('projeto-dados').replaceChildren(...base.projetos.map(r => new Option(r.projeto, r.codigo)));
  if (codigos.has(selecionado)) $('projeto-dados').value = selecionado;
  else if (codigos.has('IO-5F2J')) $('projeto-dados').value = 'IO-5F2J';
  $('projeto-mapa').replaceChildren(...base.projetos.map(r => new Option(r.projeto, r.codigo)));
  $('projeto-mapa').value = $('projeto-dados').value;
  $('projeto-mapa').disabled = false;
  renderDados();
  $('projeto-dados').disabled = false;
  $('dados-painel').hidden = false;
  $('dados-status').textContent = 'Base consultada no SQLite local. — indica valor indisponível ou percentual não calculável.';
}

const eixos = ['Identidade de gênero','Sexo','Cor, raça ou etnia','Renda da casa (faixa declarada)',
  'Renda familiar por pessoa (salários mínimos)','Escolaridade','Faixa etária'];
$('eixo-dados').replaceChildren(new Option('Gênero, raça e renda', 'destaques'), ...eixos.map(eixo => new Option(eixo, eixo)));

async function iniciar() {
  $('arquivos').disabled = true;
  try {
    const [prefixos, mapa] = await Promise.all([fetch('/prefixos.csv'), fetch('/grade.json')]);
    if (!prefixos.ok || !mapa.ok) throw new Error('Arquivos de referência territorial indisponíveis.');
    const linhas = (await prefixos.text()).trim().split(/\r?\n/).slice(1);
    geografia = new Map(linhas.map(linha => {
      const [codigo, , min, max, classe] = linha.split(';');
      return [codigo, {min, max, classe}];
    }));
    grade = await mapa.json();
    desenharMapa(null, []);
    await carregarBase();
    $('arquivos').disabled = false;
  } catch (erro) {
    $('dados-status').textContent = location.protocol === 'file:'
      ? 'Abra o painel usando iniciar.bat ou python servidor.py.' : erro.message;
  }
}

$('arquivos').addEventListener('change', async () => {
  const entrada = $('arquivos');
  if (!entrada.files.length) return;
  entrada.disabled = true;
  $('dados-status').textContent = 'Importando os seis arquivos…';
  try {
    const arquivos = new Map(Array.from(entrada.files, f => [f.name, f]));
    const entradas = await Promise.all(fontes.map(async nome => {
      const arquivo = arquivos.get(nome + '.csv');
      if (!arquivo) throw new Error('Arquivo faltando: ' + nome + '.csv.');
      return [nome, await arquivo.text()];
    }));
    const resposta = await fetch('/api/base', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(Object.fromEntries(entradas))
    });
    if (!resposta.ok) throw new Error((await resposta.json()).erro);
    await carregarBase();
  } catch (erro) {
    $('dados-status').textContent = erro.message;
  } finally {
    entrada.value = '';
    entrada.disabled = false;
  }
});
$('projeto-dados').addEventListener('change', () => {
  $('projeto-mapa').value = $('projeto-dados').value;
  renderDados();
});
$('projeto-mapa').addEventListener('change', () => {
  $('projeto-dados').value = $('projeto-mapa').value;
  renderDados();
});
$('eixo-dados').addEventListener('change', renderDados);
iniciar();
