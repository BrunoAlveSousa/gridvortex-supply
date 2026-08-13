import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Material } from "@/lib/types";

export function useMateriais(empresaId: string | null) {
  return useQuery({
    queryKey: ["materiais", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supply_materiais")
        .select("*")
        .eq("empresa_id", empresaId!)
        .order("sku");
      if (error) throw error;
      return data as Material[];
    },
  });
}
