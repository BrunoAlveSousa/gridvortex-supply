import * as React from "react";
import { Search, Plus, X } from "lucide-react";
import type { Material } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function MaterialPicker({
  materiais,
  excludeIds = [],
  onSelect,
  placeholder = "Buscar por SKU ou descrição…",
}: {
  materiais: Material[];
  excludeIds?: string[];
  onSelect: (material: Material) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const results = React.useMemo(() => {
    const available = materiais.filter((m) => !excludeIds.includes(m.id));
    if (!query.trim()) return available.slice(0, 30);
    const q = query.toLowerCase();
    return available
      .filter(
        (m) =>
          String(m.sku).includes(q) ||
          m.descricao_resumida.toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [materiais, excludeIds, query]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      {open && (
        <div className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg scrollbar-thin">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-slate-400">Nenhum material encontrado.</p>
          ) : (
            results.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => {
                  onSelect(m);
                  setQuery("");
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-brand-50/60"
                )}
              >
                <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                <span className="flex-1">
                  <span className="block font-medium text-slate-800">
                    {m.sku} · {m.descricao_resumida}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                    <Badge variant="neutral" className="px-1.5 py-0">{m.unidade_medida}</Badge>
                    {m.status_material}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function SelectedMaterialRow({
  material,
  quantidade,
  onQuantidadeChange,
  onRemove,
}: {
  material: Material;
  quantidade: number;
  onQuantidadeChange: (value: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">
          {material.sku} · {material.descricao_resumida}
        </p>
        <p className="text-xs text-slate-400">{material.unidade_medida}</p>
      </div>
      <Input
        type="number"
        min={0.01}
        step="any"
        value={quantidade}
        onChange={(e) => onQuantidadeChange(Number(e.target.value))}
        className="w-24 text-right"
      />
      <button
        type="button"
        onClick={onRemove}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
