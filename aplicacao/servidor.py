"""Painel local da Casa Hacker, com importação atômica dos seis CSVs."""
import csv
import io
import json
import sqlite3
from contextlib import closing
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser
import argparse

RAIZ = Path(__file__).resolve().parent
BANCO = RAIZ / 'casa_hacker.sqlite3'
CAMPOS = {
    'projetos': 'codigo projeto inscricoes presencas oportunidades frequencia_pct evadidos',
    'perfil': 'codigo eixo categoria n total',
    'frequencia': 'codigo eixo categoria pessoas oportunidades frequencia_pct',
    'retencao': 'codigo medida faixa n total',
    'territorio': 'codigo nivel rotulo n',
    'referencia_ibge_cor_raca': 'codigo categoria pct_populacao fonte periodo',
}
ARQUIVOS = {
    '/': ('index.html', 'text/html; charset=utf-8'),
    '/app.js': ('app.js', 'text/javascript; charset=utf-8'),
    '/styles.css': ('styles.css', 'text/css; charset=utf-8'),
    '/mapa.png': ('mapa.png', 'image/png'),
    '/prefixos.csv': ('prefixos.csv', 'text/csv; charset=utf-8'),
    '/mapa-interativo.js': ('mapa-interativo.js', 'text/javascript; charset=utf-8'),
    '/vendor/maplibre-gl.js': ('vendor/maplibre-gl.js', 'text/javascript; charset=utf-8'),
    '/vendor/maplibre-gl.css': ('vendor/maplibre-gl.css', 'text/css; charset=utf-8'),
    '/grade.json': ('grade.json', 'application/json'),
}

def importar(arquivos):
    if not isinstance(arquivos, dict) or arquivos.keys() != CAMPOS.keys():
        raise ValueError('Selecione os seis CSVs da mesma extração.')
    base = {}
    for nome, campos in CAMPOS.items():
        if not isinstance(arquivos[nome], str):
            raise ValueError(f'Conteúdo inválido em {nome}.csv.')
        leitor = csv.DictReader(io.StringIO(arquivos[nome].lstrip('\ufeff')), strict=True)
        colunas = campos.split()
        if not leitor.fieldnames or not set(colunas).issubset(leitor.fieldnames):
            raise ValueError(f'Colunas incompatíveis em {nome}.csv.')
        base[nome] = []
        for linha in leitor:
            if None in linha or any(linha[c] is None for c in colunas):
                raise ValueError(f'Linha incompleta em {nome}.csv.')
            base[nome].append(tuple(linha[c] for c in colunas))
    codigos = {r[0] for r in base['projetos']}
    if not codigos or '' in codigos or len(codigos) != len(base['projetos']):
        raise ValueError('A lista de projetos está vazia ou tem códigos inválidos.')
    if any(r[0] not in codigos for nome in CAMPOS if nome != 'projetos' for r in base[nome]):
        raise ValueError('Os seis CSVs devem pertencer à mesma extração.')
    with closing(sqlite3.connect(BANCO)) as db, db:
        db.execute('BEGIN IMMEDIATE')
        db.execute('PRAGMA user_version = 1')
        for nome, campos in CAMPOS.items():
            colunas = campos.split()
            esquema = ', '.join(c + ' TEXT NOT NULL' for c in colunas)
            db.execute(f'CREATE TABLE IF NOT EXISTS {nome} ({esquema})')
            db.execute(f'DELETE FROM {nome}')
            marcadores = ', '.join('?' for c in colunas)
            db.executemany(f'INSERT INTO {nome} VALUES ({marcadores})', base[nome])

def consultar():
    if not BANCO.exists():
        return None
    with closing(sqlite3.connect(BANCO)) as db:
        db.row_factory = sqlite3.Row
        db.execute('BEGIN')
        if not db.execute('PRAGMA user_version').fetchone()[0]:
            return None
        return {nome: [dict(r) for r in db.execute(f'SELECT * FROM {nome} ORDER BY rowid')]
                for nome in CAMPOS}

class Painel(BaseHTTPRequestHandler):
    def responder(self, status, dados, tipo):
        self.send_response(status)
        self.send_header('Content-Type', tipo)
        self.send_header('Content-Length', str(len(dados)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        self.wfile.write(dados)

    def json(self, status, dados):
        self.responder(status, json.dumps(dados, ensure_ascii=False).encode(), 'application/json; charset=utf-8')

    def do_GET(self):
        if self.path == '/api/base':
            try:
                self.json(200, consultar())
            except sqlite3.Error:
                self.json(500, {'erro': 'Falha ao consultar o banco local.'})
        elif self.path in ARQUIVOS:
            arquivo, tipo = ARQUIVOS[self.path]
            self.responder(200, (RAIZ / arquivo).read_bytes(), tipo)
        else:
            self.send_error(404)

    def do_POST(self):
        if self.path != '/api/base':
            self.send_error(404)
            return
        origem = f'http://127.0.0.1:{self.server.server_port}'
        if self.headers.get('Origin', origem) != origem or self.headers.get_content_type() != 'application/json':
            self.json(403, {'erro': 'Use a interface local para importar os dados.'})
            return
        try:
            tamanho = int(self.headers.get('Content-Length', '0'))
            if not 0 < tamanho <= 8_000_000:
                raise ValueError('Importação vazia ou maior que 8 MB.')
            importar(json.loads(self.rfile.read(tamanho)))
        except (ValueError, csv.Error) as erro:
            self.json(400, {'erro': str(erro)})
        except sqlite3.Error:
            self.json(500, {'erro': 'Falha ao gravar no SQLite. A importação anterior foi preservada.'})
        else:
            self.json(200, {'importado': True})

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--porta', type=int, default=8765)
    parser.add_argument('--sem-abrir', action='store_true')
    args = parser.parse_args()
    with ThreadingHTTPServer(('127.0.0.1', args.porta), Painel) as servidor:
        url = f'http://127.0.0.1:{servidor.server_port}'
        print(f'Conecta Casa Hacker — {url}', flush=True)
        if not args.sem_abrir:
            webbrowser.open(url)
        try:
            servidor.serve_forever()
        except KeyboardInterrupt:
            pass
