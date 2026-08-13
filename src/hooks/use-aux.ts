import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { AuxObjetivo, AuxDestinacao, AuxArea } from "@/lib/types";

export function useAreas() {
  return useQuery({
    queryKey: ["aux_areas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("supply_aux_areas").select("*").order("sigla_area");
      if (error) throw error;
      return data as AuxArea[];
    },
  });
}

export function useObjetivos() {
  return useQuery({
    queryKey: ["aux_objetivos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supply_aux_objetivos")
        .select("*")
        .order("cod_objetivo");
      if (error) throw error;
      return data as AuxObjetivo[];
    },
  });
}

export function useDestinacoes(codObjetivo: number | null) {
  return useQuery({
    queryKey: ["aux_destinacoes", codObjetivo],
    enabled: codObjetivo !== null,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supply_aux_destinacoes")
        .select("*")
        .eq("cod_objetivo", codObjetivo!)
        .order("cod_destinacao");
      if (error) throw error;
      return data as AuxDestinacao[];
    },
  });
}
