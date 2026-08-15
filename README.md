# GridVortex · Supply

Módulo Supply do GridVortex — protótipo funcional desenvolvido separadamente do produto principal, seguindo o mesmo padrão visual (sidebar, cards, badges, paleta teal/emerald).

## Telas

1. **Lista de Materiais** — consulta (somente leitura) dos SKUs disponíveis.
2. **Módulos Construtivos** — CRUD de kits de materiais reutilizáveis.
3. **Cadastro de Obras** — CRUD de obras, associação de módulos + materiais complementares, cálculo automático de Prazo Máximo e Crítica Lead Time.
4. **Cadastro de Projetos** — CRUD de projetos, associação de obras, objetivo/destinação em cascata.
5. **Necessidade de Materiais** — consolidado (somente leitura) da necessidade de materiais de todas as obras vinculadas a algum projeto, agrupado por empresa + SKU e distribuído mês a mês conforme o cronograma de cada obra. Filtros por empresa, classe, tipo, SKU/descrição e mês; exportação para `.xlsx` (tudo ou só o filtrado); botão "Detalhes" por linha mostra a origem (obras, projetos, áreas, módulos) por trás de cada quantidade. Base de entrada para o Plano de Demanda (S&OP).

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- @tanstack/react-query
- Supabase (Postgres + PostgREST) — tabelas `supply_*` no schema `public`
- react-router-dom

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha com as credenciais do seu projeto Supabase
npm run dev
```

## Banco de dados

O schema e os dados de exemplo (extraídos de `Visão Geral.xlsx`) estão em `../db/`:
- `001_schema.sql` — tabelas, views (`supply_obra_materiais_view`, `supply_projeto_materiais_view`) e RLS.
- `002_seed_materiais.sql` — empresa ESE, tabelas auxiliares e os 13 materiais de exemplo.
- `003_seed_modulos_obras_projetos.sql` — módulos M-1/M-2, obras O-1/O-2, projeto P-1.
- `004_add_classe_tipo_preco_to_obra_materiais_view.sql` — adiciona `classe`, `tipo_material` e `preco_unitario` às views de rollup, usados pela tela de Necessidade de Materiais.

**Regra de negócio (Prazo Máximo):** Prazo Máximo = Data Início da obra − Lead Time do material (dias). Crítica Lead Time = "Fora do Prazo!" quando o Prazo Máximo já passou da data atual, senão "Válido".

**Regra de negócio (Necessidade de Materiais):** a necessidade é calculada a partir das obras vinculadas a pelo menos um projeto (obras sem projeto não entram). Quando a Data Início e a Data Fim programadas de uma obra caem em meses diferentes, a quantidade do material é dividida igualmente entre os meses do intervalo; como a maioria dos materiais é de unidades discretas (não dá pra pedir "meio conector"), cada mês recebe a quantidade inteira arredondada para baixo e o primeiro mês absorve o restante da divisão — garantindo que a soma dos meses sempre bate com a quantidade total. Uma obra vinculada a mais de um projeto tem sua quantidade contada uma única vez (não duplicada por projeto).

## Observação sobre segurança

RLS está habilitado com policies abertas de leitura/escrita via chave anônima — adequado para este protótipo sem autenticação. Antes de qualquer uso em produção, adicionar autenticação e restringir as policies.
