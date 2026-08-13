import * as React from "react";
import { Search, Plus, X, HardHat } from "lucide-react";
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
import { Select } from "@/components/ui/select";
import { useObjetivos, useDestinacoes } from "@/hooks/use-aux";
import type { Obra } from "@/lib/types";
import type { ProjetoCompleto } from "@/hooks/use-projetos";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

function ObraPicker({
  obras,
  excludeIds,
  onSelect,
}: {
  obras: Obra[];
  excludeIds: string[];
  onSelect: (obra: Obra) => void;
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

  const results = obras
    .filter((o) => !excludeIds.includes(o.id))
    .filter((o) => o.codigo.toLowerCase().includes(query.toLowerCase()));

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
          placeholder="Buscar obra…"
          className="pl-9"
        />
      </div>
      {open && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-slate-400">Nenhuma obra disponível.</p>
          ) : (
            results.map((o) => (
              <button
                type="button"
                key={o.id}
                onClick={() => {
                  onSelect(o);
                  setQuery("");
                  setOpen(false);
                }}
                className={cn("flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-brand-50/60")}
              >
                <Plus className="h-3.5 w-3.5 shrink-0 text-brand-600" />
                <span className="font-medium text-slate-800">{o.codigo}</span>
                <span className="text-xs text-slate-400">
                  {formatDate(o.inicio_prg)} — {formatDate(o.fim_prg)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function ProjetoFormDialog({
  open,
  onOpenChange,
  projeto,
  obras,
  onSubmit,
  submitting,
  errorMessage,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projeto: ProjetoCompleto | null;
  obras: Obra[];
  onSubmit: (input: {
    codigo: string;
    nome_projeto: string | null;
    cod_objetivo: number | null;
    cod_destinacao: number | null;
    obra_ids: string[];
  }) => void;
  submitting: boolean;
  errorMessage?: string | null;
}) {
  const { data: objetivos = [] } = useObjetivos();
  const [codigo, setCodigo] = React.useState("");
  const [nomeProjeto, setNomeProjeto] = React.useState("");
  const [codObjetivo, setCodObjetivo] = React.useState<number | "">("");
  const [codDestinacao, setCodDestinacao] = React.useState<number | "">("");
  const [selectedObras, setSelectedObras] = React.useState<Obra[]>([]);
  const { data: destinacoes = [] } = useDestinacoes(codObjetivo === "" ? null : codObjetivo);

  React.useEffect(() => {
    if (open) {
      setCodigo(projeto?.codigo ?? "");
      setNomeProjeto(projeto?.nome_projeto ?? "");
      setCodObjetivo(projeto?.cod_objetivo ?? "");
      setCodDestinacao(projeto?.cod_destinacao ?? "");
      setSelectedObras((projeto?.projeto_obras ?? []).map((po) => po.obra));
    }
  }, [open, projeto]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      codigo: codigo.trim(),
      nome_projeto: nomeProjeto.trim() || null,
      cod_objetivo: codObjetivo === "" ? null : Number(codObjetivo),
      cod_destinacao: codDestinacao === "" ? null : Number(codDestinacao),
      obra_ids: selectedObras.map((o) => o.id),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{projeto ? `Editar projeto ${projeto.codigo}` : "Novo projeto"}</DialogTitle>
            <DialogDescription>Associe as obras que fazem parte deste projeto.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="proj-codigo">Código</Label>
                <Input id="proj-codigo" required placeholder="Ex.: P-2" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="proj-nome">Nome do projeto</Label>
                <Input id="proj-nome" placeholder="Ex.: Nível de Tensão" value={nomeProjeto} onChange={(e) => setNomeProjeto(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="proj-objetivo">Objetivo</Label>
                <Select
                  id="proj-objetivo"
                  value={codObjetivo}
                  onChange={(e) => {
                    setCodObjetivo(e.target.value === "" ? "" : Number(e.target.value));
                    setCodDestinacao("");
                  }}
                >
                  <option value="">Selecione…</option>
                  {objetivos.map((o) => (
                    <option key={o.cod_objetivo} value={o.cod_objetivo}>
                      {o.objetivo.trim()}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="proj-destinacao">Destinação</Label>
                <Select
                  id="proj-destinacao"
                  value={codDestinacao}
                  disabled={codObjetivo === ""}
                  onChange={(e) => setCodDestinacao(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <option value="">{codObjetivo === "" ? "Selecione um objetivo primeiro" : "Selecione…"}</option>
                  {destinacoes.map((d) => (
                    <option key={d.cod_destinacao} value={d.cod_destinacao}>
                      {d.descricao}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <HardHat className="h-3.5 w-3.5" /> Obras do projeto
              </Label>
              <ObraPicker
                obras={obras}
                excludeIds={selectedObras.map((o) => o.id)}
                onSelect={(obra) => setSelectedObras((prev) => [...prev, obra])}
              />
              {selectedObras.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-400">
                  Nenhuma obra associada ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedObras.map((obra) => (
                    <div key={obra.id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800">{obra.codigo}</p>
                        <p className="text-xs text-slate-400">
                          {formatDate(obra.inicio_prg)} — {formatDate(obra.fim_prg)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedObras((prev) => prev.filter((o) => o.id !== obra.id))}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
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
              {submitting ? "Salvando…" : "Salvar projeto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
