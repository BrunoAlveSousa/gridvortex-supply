import { Building2 } from "lucide-react";
import { useEmpresa } from "@/lib/empresa-context";
import { Select } from "@/components/ui/select";

export function EmpresaSwitcher() {
  const { empresas, empresaId, setEmpresaId, isLoading } = useEmpresa();

  if (isLoading) {
    return <div className="h-9 w-40 animate-pulse rounded-lg bg-slate-100" />;
  }

  if (empresas.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-slate-400" />
      <Select
        value={empresaId ?? ""}
        onChange={(e) => setEmpresaId(e.target.value)}
        className="w-44"
      >
        {empresas.map((e) => (
          <option key={e.id} value={e.id}>
            {e.nome ?? e.codigo}
          </option>
        ))}
      </Select>
    </div>
  );
}
