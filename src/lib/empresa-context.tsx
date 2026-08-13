import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Empresa } from "@/lib/types";

interface EmpresaContextValue {
  empresas: Empresa[];
  isLoading: boolean;
  empresaId: string | null;
  setEmpresaId: (id: string) => void;
  empresa: Empresa | null;
}

const EmpresaContext = React.createContext<EmpresaContextValue | null>(null);

const STORAGE_KEY = "supply.empresaId";

export function EmpresaProvider({ children }: { children: React.ReactNode }) {
  const { data: empresas = [], isLoading } = useQuery({
    queryKey: ["empresas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supply_empresas")
        .select("*")
        .order("codigo");
      if (error) throw error;
      return data as Empresa[];
    },
  });

  const [empresaId, setEmpresaIdState] = React.useState<string | null>(() =>
    typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null
  );

  React.useEffect(() => {
    if (!empresaId && empresas.length > 0) {
      setEmpresaIdState(empresas[0].id);
    }
  }, [empresas, empresaId]);

  const setEmpresaId = (id: string) => {
    setEmpresaIdState(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  };

  const empresa = empresas.find((e) => e.id === empresaId) ?? null;

  return (
    <EmpresaContext.Provider value={{ empresas, isLoading, empresaId, setEmpresaId, empresa }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  const ctx = React.useContext(EmpresaContext);
  if (!ctx) throw new Error("useEmpresa must be used within EmpresaProvider");
  return ctx;
}
