import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { ModuloConstrutivo, ModuloItem, Material } from "@/lib/types";

export interface ModuloComItens extends ModuloConstrutivo {
  modulo_itens: (ModuloItem & { material: Material })[];
}

export function useModulos(empresaId: string | null) {
  return useQuery({
    queryKey: ["modulos", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supply_modulos_construtivos")
        .select("*, modulo_itens:supply_modulo_itens(*, material:supply_materiais(*))")
        .eq("empresa_id", empresaId!)
        .order("codigo");
      if (error) throw error;
      return data as unknown as ModuloComItens[];
    },
  });
}

export interface ModuloItemInput {
  material_id: string;
  quantidade: number;
}

export interface ModuloFormInput {
  codigo: string;
  codarea: number | null;
  sigla_area: string | null;
  itens: ModuloItemInput[];
}

export function useSaveModulo(empresaId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id?: string;
      input: ModuloFormInput;
    }) => {
      if (!empresaId) throw new Error("Empresa não selecionada");
      if (input.itens.length === 0) {
        throw new Error("Associe pelo menos 1 SKU ao módulo.");
      }

      let moduloId = id;
      if (moduloId) {
        const { error } = await supabase
          .from("supply_modulos_construtivos")
          .update({
            codigo: input.codigo,
            codarea: input.codarea,
            sigla_area: input.sigla_area,
          })
          .eq("id", moduloId);
        if (error) throw error;

        // replace itens: delete all then re-insert (simple + correct for small kits)
        const { error: delError } = await supabase
          .from("supply_modulo_itens")
          .delete()
          .eq("modulo_id", moduloId);
        if (delError) throw delError;
      } else {
        const { data, error } = await supabase
          .from("supply_modulos_construtivos")
          .insert({
            empresa_id: empresaId,
            codigo: input.codigo,
            codarea: input.codarea,
            sigla_area: input.sigla_area,
          })
          .select()
          .single();
        if (error) throw error;
        moduloId = data.id;
      }

      const { error: itensError } = await supabase.from("supply_modulo_itens").insert(
        input.itens.map((item) => ({
          modulo_id: moduloId,
          material_id: item.material_id,
          quantidade: item.quantidade,
        }))
      );
      if (itensError) throw itensError;

      return moduloId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["modulos", empresaId] });
    },
  });
}

export function useDeleteModulo(empresaId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("supply_modulos_construtivos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["modulos", empresaId] });
    },
  });
}
