# Conecta Casa Hacker

Projeto acadêmico de extensão de Análise e Desenvolvimento de Sistemas, Fatec Campinas. Organização de referência: Casa Hacker.

## Conteúdo publicado

- `aplicacao/`: painel V13 completo recebido no ZIP, com HTML, CSS, JavaScript, MapLibre e servidor Python/SQLite.
- `banco/01_criacao_e_carga.sql`: script MySQL enviado pela equipe, preservado sem alterações; 11 tabelas e dados didáticos.
- `banco/02_consultas_01_a_12.sql`: 12 consultas transcritas do relatório enviado, com USE ajustado ao banco do script de carga.
- `modelos/`: DER original recebido e recortes do DER e da UML do banner V13.
- `documentacao/`: banner V13 em PDF, relatório e apresentação das consultas em PDF e PowerPoint.
- `docs/`: página de apresentação, com espaço reservado ao futuro vídeo; também acessível por `/apresentacao/` após publicar Pages.

## Executar o painel

Requer Python 3. No Windows, abra `aplicacao/iniciar.bat`. Em outros sistemas, entre em `aplicacao` e execute `python3 servidor.py`. Acesse http://127.0.0.1:8765 e mantenha o terminal aberto.

Importe juntos os seis CSVs da mesma extração da Casa Hacker, obtidos pela equipe diretamente da fonte. Os CSVs do cliente e o SQLite preenchido não integram este repositório. A referência territorial pública incluída é documentada no README da aplicação. O código do painel foi mantido como recebido.

## MySQL e phpMyAdmin

Use MySQL 8.0.16 ou superior. Importe `banco/01_criacao_e_carga.sql` uma vez em ambiente novo. Ele cria e seleciona `casa_hacker_projeto_membros`, sem excluir bancos anteriores. Execute as consultas do arquivo 02 individualmente na aba SQL.

O relatório registra a execução anterior no banco `exercício 11`. Para reproduzir as consultas com o script enviado, somente o USE do arquivo 02 foi ajustado. As consultas foram recuperadas dos blocos “Comando SQL” do relatório, removendo apenas números de página da extração de texto. O relatório e os slides originais foram preservados.

Os nomes dos membros, perfis e coordenadas individuais da carga são fictícios. Os códigos e nomes de projetos vêm da referência acadêmica. Este MySQL é separado do SQLite do painel, sem integração automática. Resultados da carga didática não descrevem pessoas reais da Casa Hacker.

## DER e classes

O DER enviado em 15/11/2026 tem 10 entidades e 9 relacionamentos. Inscrição é um relacionamento N:N com atributos. A UML do banner representa Inscricao como classe de associação ligada ao vínculo Projeto–Membro. A implementação física mantém a tabela inscricao, totalizando 11 tabelas. As operações da UML são propostas de domínio.

Os PNGs DER_banner e UML_banner foram extraídos visualmente do banner recebido; não são novos modelos. O arquivo nativo do DER atual não foi enviado. O relatório e os slides registram a execução anterior à revisão visual do DER.

## Página de apresentação e vídeo

Em **Settings → Pages**, selecione **Deploy from a branch → main → /docs → Save**. A página está preparada; sua disponibilização depende da ativação de Pages no repositório. GitHub Pages não executa o servidor Python do painel.

O vídeo ainda não foi gravado. A página exibe “Vídeo em breve”. Quando estiver pronto, edite `docs/video.json` com `tipo: mp4` e uma URL pública HTTPS para o MP4, ou `tipo: youtube` e uma URL `https://www.youtube.com/embed/ID`. O endereço da página permanece o mesmo.

## Equipe e orientação

Raquel G. Quitério Cruz, Roge Silva Antonio, Cristopher Kurita e Felipe Longhi.
Orientadores: Nelson Koshoji e Anderson Barbosa.

Protótipo acadêmico independente. Não é o site oficial da Casa Hacker. Nenhuma licença adicional foi adicionada; a licença do MapLibre está preservada em aplicacao/vendor/LICENSE.txt.
