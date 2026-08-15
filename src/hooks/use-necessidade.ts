import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ObraMaterialRollup } from "@/lib/types";

export interface ObraProjetoRef {
  projeto_id: string;
  projeto_codigo: string;
  nome_projeto: string | null;
}

export interface NecessidadeRow extends ObraMaterialRollup {
  projetos: ObraProjetoRef[];
}

/**
 * Necessidade de Materiais fetches the obra→material rollup across ALL
 * empresas (not scoped to the empresa selected in the top switcher — this
 * screen is a cross-company demand rollup by design) and keeps only rows
 * whose obra is linked to at least one projeto.
 *
 * We deliberately do NOT read from supply_projeto_materiais_view here: that
 * view joins through projeto_obras, so an obra linked to two+ projetos would
 * appear twice and double-count its material demand. Instead we fetch the
 * obra-level rollup once and separately attach the list of projetos that
 * reference each obra (for the detail drill-down), without duplicating the
 * underlying quantity.
 */
export function useNecessidadeMateriais() {
  return useQuery({
    queryKey: ["necessidade_materiais"],
    queryFn: async () => {
      const [rollupRes, linksRes] = await Promise.all([
        supabase.from("supply_obra_materiais_view").select("*"),
        supabase
          .from("supply_projeto_obras")
          .select("obra_id, projeto:supply_projetos(id, codigo, nome_projeto)"),
      ]);
      if (rollupRes.error) throw rollupRes.error;
      if (linksRes.error) throw linksRes.error;

      const projetosPorObra = new Map<string, ObraProjetoRef[]>();
      for (const link of (linksRes.data ?? []) as any[]) {
        const projeto = link.projeto;
        if (!projeto) continue;
        const list = projetosPorObra.get(link.obra_id) ?? [];
        list.push({ projeto_id: projeto.id, projeto_codigo: projeto.codigo, nome_projeto: projeto.nome_projeto });
        projetosPorObra.set(link.obra_id, list);
      }

      const rows = (rollupRes.data as ObraMaterialRollup[])
        .filter((r) => projetosPorObra.has(r.obra_id))
        .map((r) => ({ ...r, projetos: projetosPorObra.get(r.obra_id)! }) as NecessidadeRow);

      return rows;
    },
  });
}
