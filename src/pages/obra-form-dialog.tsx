import * as React from "react";
import { Search, Plus, X, Boxes } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { MaterialPicker, SelectedMaterialRow } from "@/components/material-picker";
import type { Material } from "@/lib/types";
import type { ModuloComItens } from "@/hooks/use-modulos";
import type { ObraCompleta } from "@/hooks/use-obras";
import { cn } from "@/lib/utils";

interface ModuloDraft {
  modulo: ModuloComItens;
  qtde_modular: number;
}
interface MaterialDraft {
  material: Material;
  quantidade: number;
}

function ModuloPicker({
  modulos,
  excludeIds,
  onSelect,
}: {
  modulos: ModuloComItens[];
  excludeIds: string[];
  onSelect: (modulo: ModuloComItens) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const results = modulos
    .filter((m) => !excludeIds.includes(m.id))
    .filter((m) => m.codigo.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder="Buscar módulo construtivo…"
          className="pl-9"
        />
      </div>
      {open && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-slate-400">Nenhum módulo disponível.</p>
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
                className={cn("flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-brand-50/60")}
              >
                <Plus className="h-3.5 w-3.5 shrink-0 text-brand-600" />
                <span className="font-medium text-slate-800">{m.codigo}</span>
                <span className="text-xs text-slate-400">{m.modulo_itens.length} SKUs · {m.sigla_area}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function ObraFormDialog({
  open,
  onOpenChange,
  obra,
  modulos,
  materiais,
  onSubmit,
  submitting,
  errorMessage,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  obra: ObraCompleta | null;
  modulos: ModuloComItens[];
  materiais: Material[];
  onSubmit: (input: {
    codigo: string;
    nome: string | null;
    inicio_prg: string;
    fim_prg: string;
    modulos: { modulo_id: string; qtde_modular: number }[];
    materiais_extra: { material_id: string; quantidade: number }[];
  }) => void;
  submitting: boolean;
  errorMessage?: string | null;
}) {
  const [codigo, setCodigo] = React.useState("");
  const [nome, setNome] = React.useState("");
  const [inicio, setInicio] = React.useState("");
  const [fim, setFim] = React.useState("");
  const [modDrafts, setModDrafts] = React.useState<ModuloDraft[]>([]);
  const [extraDrafts, setExtraDrafts] = React.useState<MaterialDraft[]>([]);

  React.useEffect(() => {
    if (open) {
      setCodigo(obra?.codigo ?? "");
      setNome(obra?.nome ?? "");
      setInicio(obra?.inicio_prg ?? "");
      setFim(obra?.fim_prg ?? "");
      setModDrafts(
        (obra?.obra_modulos ?? [])
          .map((om) => {
            const full = modulos.find((m) => m.id === om.modulo_id);
            return full ? { modulo: full, qtde_modular: Number(om.qtde_modular) } : null;
          })
          .filter(Boolean) as ModuloDraft[]
      );
      setExtraDrafts(
        (obra?.obra_materiais_extra ?? []).map((e) => ({
          material: e.material,
          quantidade: Number(e.quantidade),
        }))
      );
    }
  }, [open, obra, modulos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      codigo: codigo.trim(),
      nome: nome.trim() || null,
      inicio_prg: inicio,
      fim_prg: fim,
      modulos: modDrafts.map((d) => ({ modulo_id: d.modulo.id, qtde_modular: d.qtde_modular })),
      materiais_extra: extraDrafts.map((d) => ({ material_id: d.material.id, quantidade: d.quantidade })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{obra ? `Editar obra ${obra.codigo}` : "Nova obra"}</DialogTitle>
            <DialogDescription>
              Associe módulos construtivos e, se necessário, materiais complementares específicos desta obra.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="col-span-2 space-y-1.5 sm:col-span-1">
                <Label htmlFor="obra-codigo">Código</Label>
                <Input id="obra-codigo" required placeholder="Ex.: O-3" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
              </div>
              <div className="col-span-2 space-y-1.5 sm:col-span-1">
                <Label htmlFor="obra-nome">Nome (opcional)</Label>
                <Input id="obra-nome" placeholder="Nome da obra" value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="obra-inicio">Início programado</Label>
                <Input id="obra-inicio" type="date" required value={inicio} onChange={(e) => setInicio(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="obra-fim">Fim programado</Label>
                <Input id="obra-fim" type="date" required value={fim} onChange={(e) => setFim(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Boxes className="h-3.5 w-3.5" /> Módulos construtivos
              </Label>
              <ModuloPicker
                modulos={modulos}
                excludeIds={modDrafts.map((d) => d.modulo.id)}
                onSelect={(modulo) => setModDrafts((prev) => [...prev, { modulo, qtde_modular: 1 }])}
              />
              {modDrafts.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 px-3 py-3 text-center text-sm text-slate-400">
                  Nenhum módulo associado ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {modDrafts.map((d) => (
                    <div key={d.modulo.id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800">{d.modulo.codigo}</p>
                        <p className="text-xs text-slate-400">{d.modulo.modulo_itens.length} SKUs · {d.modulo.sigla_area}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400">Qtde modular</span>
                        <Input
                          type="number"
                          min={0.01}
                          step="any"
                          value={d.qtde_modular}
                          onChange={(e) =>
                            setModDrafts((prev) =>
                              prev.map((x) =>
                                x.modulo.id === d.modulo.id ? { ...x, qtde_modular: Number(e.target.value) } : x
                              )
                            )
                          }
                          className="w-20 text-right"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setModDrafts((prev) => prev.filter((x) => x.modulo.id !== d.modulo.id))}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Materiais complementares (específicos desta obra)</Label>
              <MaterialPicker
                materiais={materiais}
                excludeIds={extraDrafts.map((d) => d.material.id)}
                onSelect={(material) => setExtraDrafts((prev) => [...prev, { material, quantidade: 1 }])}
                placeholder="Buscar material complementar…"
              />
              {extraDrafts.length > 0 && (
                <div className="space-y-2">
                  {extraDrafts.map((d) => (
                    <SelectedMaterialRow
                      key={d.material.id}
                      material={d.material}
                      quantidade={d.quantidade}
                      onQuantidadeChange={(value) =>
                        setExtraDrafts((prev) =>
                          prev.map((x) => (x.material.id === d.material.id ? { ...x, quantidade: value } : x))
                        )
                      }
                      onRemove={() => setExtraDrafts((prev) => prev.filter((x) => x.material.id !== d.material.id))}
                    />
                  ))}
                </div>
              )}
            </div>

            {errorMessage && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Salvando…" : "Salvar obra"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
