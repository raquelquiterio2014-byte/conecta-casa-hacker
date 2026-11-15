-- Consultas transcritas do relatório enviado pela equipe em 15/11/2026.
-- USE ajustado ao nome do banco do script 01. Executar uma consulta por vez.
USE casa_hacker_projeto_membros;

-- Consulta 1: nível básico
SELECT
    codigo,
    nome,
    programa,
    situacao
FROM projeto
ORDER BY nome;

-- Consulta 2: nível básico
SELECT
    codigo,
    nome,
    programa,
    situacao,
    data_inicio,
    data_fim
FROM projeto
WHERE situacao = 'execucao'
ORDER BY nome;

-- Consulta 3: nível básico
SELECT
    id,
    nome
FROM membro
WHERE nome LIKE '%Ana%'
ORDER BY nome, id;

-- Consulta 4: nível básico
SELECT
    id AS codigo_inscricao,
    codigo_projeto,
    id_membro,
    data_inscricao,
    situacao
FROM inscricao
WHERE codigo_projeto = 'IO-5F2J'
ORDER BY data_inscricao, id;

-- Consulta 5: nível intermediário
SELECT
    p.codigo AS codigo_projeto,
    p.nome AS nome_projeto,
    COUNT(i.id) AS total_inscricoes
FROM projeto AS p
LEFT JOIN inscricao AS i
    ON i.codigo_projeto = p.codigo
GROUP BY p.codigo, p.nome
ORDER BY total_inscricoes DESC, p.codigo;

-- Consulta 6: nível intermediário
SELECT
    p.codigo AS codigo_projeto,
    p.nome AS nome_projeto,
    i.id AS codigo_inscricao,
    m.id AS codigo_membro,
    m.nome AS nome_membro,
    i.situacao AS situacao_inscricao
FROM projeto AS p
INNER JOIN inscricao AS i
    ON i.codigo_projeto = p.codigo
INNER JOIN membro AS m
    ON m.id = i.id_membro
ORDER BY p.nome, m.nome, i.id;

-- Consulta 7: nível intermediário
SELECT
    g.descricao AS identidade_genero,
    COUNT(i.id) AS total_inscricoes
FROM inscricao AS i
INNER JOIN membro AS m
    ON m.id = i.id_membro
INNER JOIN identidade_genero AS g
    ON g.id = m.id_identidade_genero
WHERE i.codigo_projeto = 'IO-5F2J'
GROUP BY g.id, g.descricao
ORDER BY total_inscricoes DESC, g.descricao;

-- Consulta 8: nível intermediário
SELECT
    p.codigo AS codigo_projeto,
    p.nome AS nome_projeto,
    COUNT(i.id) AS total_inscricoes
FROM projeto AS p
INNER JOIN inscricao AS i
    ON i.codigo_projeto = p.codigo
GROUP BY p.codigo, p.nome
HAVING COUNT(i.id) > 50
ORDER BY total_inscricoes DESC, p.codigo;

-- Consulta 9: nível avançado
SELECT
    r.descricao AS cor_raca_etnia,
    COUNT(i.id) AS quantidade,
    (
        SELECT COUNT(*)
        FROM inscricao
        WHERE codigo_projeto = 'IO-5F2J'
    ) AS total_projeto,
    ROUND(
        100.0 * COUNT(i.id) /
        NULLIF(
            (
                SELECT COUNT(*)
                FROM inscricao
                WHERE codigo_projeto = 'IO-5F2J'
            ),
        ),
    ) AS percentual
FROM inscricao AS i
INNER JOIN membro AS m
    ON m.id = i.id_membro
INNER JOIN cor_raca_etnia AS r
    ON r.id = m.id_cor_raca_etnia
WHERE i.codigo_projeto = 'IO-5F2J'
GROUP BY r.id, r.descricao
ORDER BY quantidade DESC, r.descricao;

-- Consulta 10: nível avançado
SELECT
    p.codigo AS codigo_projeto,
    p.nome AS nome_projeto,
    COUNT(i.id) AS total_inscricoes,
    ROUND(
        (
            SELECT COUNT(*)
            FROM inscricao
        ) / NULLIF(
            (
                SELECT COUNT(*)
                FROM projeto
            ),
        ),
    ) AS media_inscricoes_por_projeto
FROM projeto AS p
LEFT JOIN inscricao AS i
    ON i.codigo_projeto = p.codigo
GROUP BY p.codigo, p.nome
HAVING COUNT(i.id) > (
    (
        SELECT COUNT(*)
        FROM inscricao
    ) / NULLIF(
        (
            SELECT COUNT(*)
            FROM projeto
        ),
    )
)
ORDER BY total_inscricoes DESC, p.codigo;

-- Consulta 11: nível avançado
SELECT
    e.descricao AS escolaridade,
    r.descricao AS renda_por_pessoa,
    COUNT(i.id) AS quantidade,
    (
        SELECT COUNT(*)
        FROM inscricao
        WHERE codigo_projeto = 'IO-5F2J'
    ) AS total_projeto,
    ROUND(
        100.0 * COUNT(i.id) /
        NULLIF(
            (
                SELECT COUNT(*)
                FROM inscricao
                WHERE codigo_projeto = 'IO-5F2J'
            ),
        ),
    ) AS percentual_do_projeto
FROM inscricao AS i
INNER JOIN membro AS m
    ON m.id = i.id_membro
INNER JOIN escolaridade AS e
    ON e.id = m.id_escolaridade
INNER JOIN renda_por_pessoa AS r
    ON r.id = m.id_renda_por_pessoa
WHERE i.codigo_projeto = 'IO-5F2J'
GROUP BY e.id, e.descricao, r.id, r.descricao
ORDER BY quantidade DESC, e.descricao, r.descricao;

-- Consulta 12: nível avançado
SELECT
    CASE
        WHEN d.distancia_km IS NULL THEN 'Sem coordenadas'
        WHEN d.distancia_km < 6 THEN 'Abaixo de 6 km'
        WHEN d.distancia_km <= 8 THEN 'De 6 a 8 km'
        ELSE 'Acima de 8 km'
    END AS faixa_distancia,
    COUNT(*) AS quantidade,
    (
        SELECT COUNT(*)
        FROM inscricao
        WHERE codigo_projeto = 'IO-5F2J'
    ) AS total_projeto,
    ROUND(
        100.0 * COUNT(*) /
        NULLIF(
             (
                  SELECT COUNT(*)
                  FROM inscricao
                  WHERE codigo_projeto = 'IO-5F2J'
             ),
        ),
    ) AS percentual_do_projeto
FROM (
    SELECT
        i.id AS codigo_inscricao,
        CASE
             WHEN l.latitude IS NULL
                OR l.longitude IS NULL THEN NULL
             ELSE
                  2 * 6371 * ASIN(
                      SQRT(
                          LEAST(
                              1.0,
                              GREATEST(
                                   0.0,
                                   POWER(
                                        SIN(
                                            RADIANS(
                                                l.latitude - (-22.908246)
                                            ) / 2
                                        ),
                                   )
                                   + COS(RADIANS(-22.908246))
                                   * COS(RADIANS(l.latitude))
                                   * POWER(
                                        SIN(
                                            RADIANS(
                                                l.longitude - (-47.066752)
                                            ) / 2
                                        ),
                                   )
                              )
                          )
                      )
                  )
        END AS distancia_km
    FROM inscricao AS i
    INNER JOIN membro AS m
        ON m.id = i.id_membro
    LEFT JOIN localizacao_cep AS l
        ON l.id = m.id_localizacao_cep
    WHERE i.codigo_projeto = 'IO-5F2J'
) AS d
GROUP BY faixa_distancia
ORDER BY FIELD(
    faixa_distancia,
    'Abaixo de 6 km',
    'De 6 a 8 km',
    'Acima de 8 km',
    'Sem coordenadas'
);
