-- ============================================================================
-- Proposta.io — Migration 0003: parcelas de pagamento flexíveis.
-- Execute depois de 0001_init.sql e 0002_templates_e_insights.sql.
--
-- DECISÃO: optou-se pela abordagem JSONB (coluna `condicoes_pagamento` na
-- própria tabela `propostas`) em vez de uma tabela `proposta_parcelas`
-- separada. Motivos:
--   - As parcelas são sempre lidas/escritas junto com a proposta inteira
--     (nunca há uma tela que lista parcelas isoladamente entre propostas),
--     então o ganho de uma tabela normalizada para relatórios não se
--     paga hoje pelo custo extra de um JOIN em toda leitura de proposta.
--   - O restante do schema (blocos, templates) já usa JSONB com o mesmo
--     padrão, mantendo o modelo de dados consistente.
--   - Caso relatórios agregados por parcela se tornem necessários no
--     futuro, a coluna JSONB pode ser consultada com `jsonb_array_elements`
--     ou migrada para uma tabela normalizada sem quebrar a API pública.
-- ============================================================================

-- A coluna antiga era um texto livre/enum ("sinal_50_50" etc.) sem dados de
-- produção reais até o momento desta migration — por isso o DROP direto é
-- seguro aqui. Se já existirem propostas com o valor antigo em produção,
-- capture-as ANTES de rodar este script (ex.: `select id, condicoes_pagamento
-- from propostas where condicoes_pagamento is not null`).
ALTER TABLE public.propostas DROP COLUMN IF EXISTS condicoes_pagamento;

ALTER TABLE public.propostas
  ADD COLUMN condicoes_pagamento JSONB NOT NULL DEFAULT '[]'::JSONB;

COMMENT ON COLUMN public.propostas.condicoes_pagamento IS
  'Array de ParcelaPagamento: [{ percentual, descricao, prazo_dias, valor_calculado, ordem }, ...]. A soma dos percentuais deve ser 100.';

-- Garante, a nível de banco, que a soma dos percentuais de cada proposta
-- salva seja sempre 100% (mesma regra já validada no Zod da API) — uma
-- segunda camada de proteção contra dados inconsistentes.
CREATE OR REPLACE FUNCTION public.validar_soma_parcelas()
RETURNS trigger AS $$
DECLARE
  soma numeric;
BEGIN
  IF jsonb_array_length(NEW.condicoes_pagamento) = 0 THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(SUM((parcela->>'percentual')::numeric), 0)
  INTO soma
  FROM jsonb_array_elements(NEW.condicoes_pagamento) AS parcela;

  IF ABS(soma - 100) > 0.01 THEN
    RAISE EXCEPTION 'A soma dos percentuais das parcelas deve ser 100%% (recebido: %)', soma;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER propostas_validar_parcelas
  BEFORE INSERT OR UPDATE OF condicoes_pagamento ON public.propostas
  FOR EACH ROW
  EXECUTE FUNCTION public.validar_soma_parcelas();
