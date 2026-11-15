# Conecta Casa Hacker

Projeto acadêmico de extensão de Análise e Desenvolvimento de Sistemas, Fatec Campinas. Organização de referência: Casa Hacker.

## Conteúdo

- `aplicacao/`: versão V13 do portal local, com HTML, CSS, JavaScript, MapLibre e servidor Python/SQLite.
- `banco/01_criacao_e_carga.sql`: banco MySQL, 11 tabelas, chaves e dados didáticos.
- `banco/02_consultas_01_a_12.sql`: sequência executada, com quatro consultas básicas, quatro intermediárias e quatro avançadas.
- `modelos/`: DER enviado pela equipe, versão azul, UML compatível e modelo BrModelo anterior identificado como tal.
- `documentacao/`: banner atualizado, relatório e apresentação das consultas.
- `docs/`: página pública de apresentação e espaço para o futuro vídeo.

## Executar a aplicação

Requer Python 3. No Windows, abra `aplicacao/iniciar.bat`. Em outro sistema, entre na pasta `aplicacao` e execute `python3 servidor.py`. Acesse http://127.0.0.1:8765 e mantenha o terminal aberto.

Para usar o painel, importe juntos os seis CSVs da mesma extração da Casa Hacker, obtidos pela equipe diretamente da fonte. Os CSVs do cliente e o banco SQLite preenchido não integram este repositório. A referência territorial pública incluída é documentada no README da aplicação.

## MySQL e phpMyAdmin

Use MySQL 8.0.16 ou superior. Na aba Importar do phpMyAdmin, importe `banco/01_criacao_e_carga.sql` uma vez em ambiente novo. O script cria e seleciona `casa_hacker_projeto_membros`, sem excluir bancos anteriores. Depois selecione esse banco e execute as consultas de `banco/02_consultas_01_a_12.sql` individualmente na aba SQL.

O script de consultas mantém a sequência executada e ajusta somente o comando USE ao nome do banco criado pelo script de carga.

Os nomes dos membros, perfis e coordenadas individuais são fictícios. Os códigos e nomes de projetos vêm da referência acadêmica. Este MySQL é separado do SQLite usado pelo portal, sem integração automática.

## DER e classes

O DER atual, enviado pela equipe em 15/11/2026, tem 10 entidades e 9 relacionamentos. Inscrição é um relacionamento N:N com atributos. A UML tem 10 classes correspondentes às entidades e a classe de associação Inscricao, conectada por linha tracejada a Projeto–Membro. A implementação física continua com a tabela inscricao e totaliza 11 tabelas.

`Modelo_anterior_11_entidades.brM3` é a versão nativa anterior, em que Inscrição aparece como entidade. Ele é preservado como histórico, não como a versão nativa do DER atual. O arquivo nativo do novo DER ainda não foi fornecido. As operações da UML são propostas de domínio.

O relatório e os slides registram as consultas executadas antes da revisão visual do DER. O banner contém o DER e a UML mais recentes.

## Página de apresentação e vídeo

Em Settings > Pages, publique a branch main, pasta /docs. A página funciona sem servidor Python. O portal completo com /api/base é local e não roda como backend em GitHub Pages.

O vídeo ainda não foi gravado. A página exibe “Vídeo em breve”. Quando estiver pronto, atualize `docs/video.json` com o endereço público do MP4 ou use `tipo: youtube` e uma URL https://www.youtube.com/embed/ID. O endereço da página permanece o mesmo e pode ser usado no QR code do banner.

## Equipe e orientação

Raquel G. Quitério Cruz, Roge Silva Antonio, Cristopher Kurita e Felipe Longhi.
Orientadores: Nelson Koshoji e Anderson Barbosa.

Protótipo acadêmico independente. Não é o site oficial da Casa Hacker. Nenhuma licença adicional foi adicionada.
