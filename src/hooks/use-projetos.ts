import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Projeto, ProjetoObra, Obra, ObraMaterialRollup } from "@/lib/types";

export interface ProjetoCompleto extends Projeto {
  projeto_obras: (ProjetoObra & { obra: Obra })[];
}

export function useProjetos(empresaId: string | null) {
  return useQuery({
    queryKey: ["projetos", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supply_projetos")
        .select("*, supply_projeto_obras(*, obra:supply_obras(*))")
        .eq("empresa_id", empresaId!)
        .order("codigo");
      if (error) throw error;
      return data as unknown as ProjetoCompleto[];
    },
  });
}

export function useProjetoMateriais(projetoId: string | null) {
  return useQuery({
    queryKey: ["projeto_materiais_view", projetoId],
    enabled: !!projetoId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supply_projeto_materiais_view")
        .select("*")
        .eq("projeto_id", projetoId!);
      if (error) throw error;
      return data as (ObraMaterialRollup & { projeto_id: string })[];
    },
  });
}

export interface ProjetoFormInput {
  codigo: string;
  nome_projeto: string | null;
  cod_objetivo: number | null;
  cod_destinacao: number | null;
  obra_ids: string[];
}

export function useSaveProjeto(empresaId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: ProjetoFormInput }) => {
      if (!empresaId) throw new Error("Empresa não selecionada");

      let projetoId = id;
      if (projetoId) {
        const { error } = await supabase
          .from("supply_projetos")
          .update({
            codigo: input.codigo,
            nome_projeto: input.nome_projeto,
            cod_objetivo: input.cod_objetivo,
            cod_destinacao: input.cod_destinacao,
          })
          .eq("id", projetoId);
        if (error) throw error;

        const { error: delError } = await supabase
          .from("supply_projeto_obras")
          .delete()
          .eq("projeto_id", projetoId);
        if (delError) throw delError;
      } else {
        const { data, error } = await supabase
          .from("supply_projetos")
          .insert({
            empresa_id: empresaId,
            codigo: input.codigo,
            nome_projeto: input.nome_projeto,
            cod_objetivo: input.cod_objetivo,
            cod_destinacao: input.cod_destinacao,
          })
          .select()
          .single();
        if (error) throw error;
        projetoId = data.id;
      }

      if (input.obra_ids.length > 0) {
        const { error } = await supabase.from("supply_projeto_obras").insert(
          input.obra_ids.map((obraId) => ({
            projeto_id: projetoId,
            obra_id: obraId,
          }))
        );
        if (error) throw error;
      }

      return projetoId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projetos", empresaId] });
    },
  });
}

export function useDeleteProjeto(empresaId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("supply_projetos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projetos", empresaId] });
    },
  });
}
