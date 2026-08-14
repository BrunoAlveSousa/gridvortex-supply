import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Obra, ObraModulo, ObraMaterialExtra, ModuloConstrutivo, Material, ObraMaterialRollup } from "@/lib/types";

export interface ObraCompleta extends Obra {
  obra_modulos: (ObraModulo & { modulo: ModuloConstrutivo })[];
  obra_materiais_extra: (ObraMaterialExtra & { material: Material })[];
}

export function useObras(empresaId: string | null) {
  return useQuery({
    queryKey: ["obras", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supply_obras")
        .select(
          "*, obra_modulos:supply_obra_modulos(*, modulo:supply_modulos_construtivos(*)), obra_materiais_extra:supply_obra_materiais_extra(*, material:supply_materiais(*))"
        )
        .eq("empresa_id", empresaId!)
        .order("codigo");
      if (error) throw error;
      return data as unknown as ObraCompleta[];
    },
  });
}

export function useObraMateriais(obraId: string | null) {
  return useQuery({
    queryKey: ["obra_materiais_view", obraId],
    enabled: !!obraId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supply_obra_materiais_view")
        .select("*")
        .eq("obra_id", obraId!);
      if (error) throw error;
      return data as ObraMaterialRollup[];
    },
  });
}

export interface ObraFormInput {
  codigo: string;
  nome: string | null;
  inicio_prg: string;
  fim_prg: string;
  modulos: { modulo_id: string; qtde_modular: number }[];
  materiais_extra: { material_id: string; quantidade: number }[];
}

export function useSaveObra(empresaId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: ObraFormInput }) => {
      if (!empresaId) throw new Error("Empresa não selecionada");

      let obraId = id;
      if (obraId) {
        const { error } = await supabase
          .from("supply_obras")
          .update({
            codigo: input.codigo,
            nome: input.nome,
            inicio_prg: input.inicio_prg,
            fim_prg: input.fim_prg,
          })
          .eq("id", obraId);
        if (error) throw error;

        const { error: delModError } = await supabase
          .from("supply_obra_modulos")
          .delete()
          .eq("obra_id", obraId);
        if (delModError) throw delModError;

        const { error: delExtraError } = await supabase
          .from("supply_obra_materiais_extra")
          .delete()
          .eq("obra_id", obraId);
        if (delExtraError) throw delExtraError;
      } else {
        const { data, error } = await supabase
          .from("supply_obras")
          .insert({
            empresa_id: empresaId,
            codigo: input.codigo,
            nome: input.nome,
            inicio_prg: input.inicio_prg,
            fim_prg: input.fim_prg,
          })
          .select()
          .single();
        if (error) throw error;
        obraId = data.id;
      }

      if (input.modulos.length > 0) {
        const { error } = await supabase.from("supply_obra_modulos").insert(
          input.modulos.map((m) => ({
            obra_id: obraId,
            modulo_id: m.modulo_id,
            qtde_modular: m.qtde_modular,
          }))
        );
        if (error) throw error;
      }

      if (input.materiais_extra.length > 0) {
        const { error } = await supabase.from("supply_obra_materiais_extra").insert(
          input.materiais_extra.map((m) => ({
            obra_id: obraId,
            material_id: m.material_id,
            quantidade: m.quantidade,
          }))
        );
        if (error) throw error;
      }

      return obraId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["obras", empresaId] });
      qc.invalidateQueries({ queryKey: ["obra_materiais_view"] });
      qc.invalidateQueries({ queryKey: ["projetos", empresaId] });
    },
  });
}

export function useDeleteObra(empresaId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("supply_obras").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["obras", empresaId] });
      qc.invalidateQueries({ queryKey: ["projetos", empresaId] });
    },
  });
}
