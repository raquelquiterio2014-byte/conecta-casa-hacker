# Conecta Casa Hacker V13

## Abrir e preparar a apresentação

1. Extraia todo este ZIP em uma pasta com permissão de escrita.
2. No Windows, abra `iniciar.bat`. É necessário Python 3 instalado.
   Pelo terminal, na pasta extraída, use `python servidor.py` (ou
   `python3 servidor.py` no macOS/Linux). Mantenha o terminal aberto.
3. Acesse http://127.0.0.1:8765 se o navegador não abrir automaticamente.
4. Na primeira execução, extraia o ZIP original da Casa Hacker e selecione
   os seis CSVs juntos no painel. Escolha um projeto no seletor.
5. Para ensaiar, feche o servidor e execute-o novamente. A base é lida de
   `casa_hacker.sqlite3`, criado ao lado do servidor. O mesmo arquivo é
   reutilizado desde que você mantenha a pasta. Após a importação, o painel
   funciona offline, incluindo o mapa. O servidor escuta apenas no próprio
   computador.

A importação substitui a extração completa em uma transação. Uma importação
rejeitada preserva a base anterior. O ZIP entrega o programa e a referência
geográfica. A exportação da Casa Hacker e o banco preenchido ficam na máquina
de demonstração, conforme as condições de uso da fonte.

## Como apresentar o território

Escolha um projeto em **Indicadores** e abra **Território**. O mapa destaca
células de 500 m com pontos públicos do CNEFE 2022 nos prefixos divulgados
para esse projeto. O quadro de intervalos mínimo–máximo
ajudam a interpretar a distribuição. As faixas são relativas à Estação
Cultura (coordenada de referência aproximada −22,908246°, −47,066752°).

O painel apresenta contagem ÷ total de inscrições do projeto. A área
destacada representa a cobertura geográfica observada dos prefixos.
Inscrições sem faixa atribuída incluem prefixos que cruzam faixas,
prefixos sem correspondência, registros agrupados e linhas indisponíveis.
Os pontos de referência são endereços do IBGE. A exportação da Casa Hacker
contém inscrições agregadas e não permite identificar residências, nem
determinar a distância individual. A distância mede alcance territorial.

Para a renda, o percentual de baixa renda usa o corte de até meio salário
mínimo por pessoa e exige a classificação de todo o eixo. A renda total da
casa aparece separadamente. As faixas da extração atual mantêm o percentual
exato de baixa renda indisponível.

## Fontes

- Casa Hacker. Perfil por projeto. Extração de 15/10/2026.
- IBGE. CNEFE 2022. Arquivo municipal de Campinas, código 3509502.
  https://ftp.ibge.gov.br/Cadastro_Nacional_de_Enderecos_para_Fins_Estatisticos/Censo_Demografico_2022/Arquivos_CNEFE/CSV/Municipio/35_SP/

Para reproduzir o cruzamento em uma cópia de trabalho, use
`python reproduzir_mapa.py 3509502_CAMPINAS.zip membros-pesquisa-20261015.zip`
com matplotlib instalado. O script gera arquivos no diretório onde está.

A seção Território inclui um seletor sincronizado com Indicadores. Use o
zoom do MapLibre e clique nas células roxas para consultar o total agregado
por prefixo. Os raios azul e ciano correspondem a 6 km e 8 km. O mapa usa
uma base esquemática local, sem camada de ruas. Se o WebGL estiver
indisponível, o painel exibe o mapa simplificado com o mesmo filtro.

Para aproveitar um banco da V11 ou V12, encerre o servidor antigo e copie
`casa_hacker.sqlite3` da pasta anterior para a nova antes de abrir a V13.
