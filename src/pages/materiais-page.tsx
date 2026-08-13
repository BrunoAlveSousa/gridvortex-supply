import * as React from "react";
import { Search, Package, Eye } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { useEmpresa } from "@/lib/empresa-context";
import { useMateriais } from "@/hooks/use-materiais";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PageLoading, EmptyState } from "@/components/ui/misc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/format";
import type { Material } from "@/lib/types";

function statusVariant(status: string | null) {
  if (status === "NORMAL") return "success" as const;
  if (status === "DESPADRONIZADO") return "warning" as const;
  return "neutral" as const;
}

function abcVariant(abc: string | null) {
  if (abc === "A") return "brand" as const;
  if (abc === "B") return "info" as const;
  return "neutral" as const;
}

export function MateriaisPage() {
  const { empresaId } = useEmpresa();
  const { data: materiais = [], isLoading } = useMateriais(empresaId);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [tipo, setTipo] = React.useState("");
  const [selected, setSelected] = React.useState<Material | null>(null);

  const statusOptions = React.useMemo(
    () => Array.from(new Set(materiais.map((m) => m.status_material).filter(Boolean))) as string[],
    [materiais]
  );
  const tipoOptions = React.useMemo(
    () => Array.from(new Set(materiais.map((m) => m.tipo_material).filter(Boolean))) as string[],
    [materiais]
  );

  const filtered = materiais.filter((m) => {
    if (status && m.status_material !== status) return false;
    if (tipo && m.tipo_material !== tipo) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      if (!String(m.sku).includes(q) && !m.descricao_resumida.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="pb-16">
      <Topbar
        eyebrow="Módulo Supply"
        title="Lista de Materiais"
        description="Consulta dos materiais (SKUs) disponíveis para uso em módulos construtivos e obras. Somente leitura."
      />

      <div className="px-8 py-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por SKU ou descrição…"
              className="pl-9"
            />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
            <option value="">Todos os status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-44">
            <option value="">Todos os tipos</option>
            {tipoOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
          <span className="text-sm text-slate-400">{filtered.length} de {materiais.length} materiais</span>
        </div>

        <Card className="overflow-hidden">
          {isLoading ? (
            <PageLoading label="Carregando materiais…" />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Package className="h-5 w-5" />}
              title="Nenhum material encontrado"
              description="Ajuste a busca ou os filtros para ver outros materiais."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>ABC</TableHead>
                  <TableHead className="text-right">Preço Unitário</TableHead>
                  <TableHead className="text-right">Lead Time</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-slate-500">{m.sku}</TableCell>
                    <TableCell className="max-w-md">
                      <span className="line-clamp-2 font-medium text-slate-800">{m.descricao_resumida}</span>
                    </TableCell>
                    <TableCell>{m.classe ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(m.status_material)}>{m.status_material ?? "—"}</Badge>
                    </TableCell>
                    <TableCell>{m.unidade_medida ?? "—"}</TableCell>
                    <TableCell>
                      {m.abc ? <Badge variant={abcVariant(m.abc)}>{m.abc}</Badge> : "—"}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">{formatCurrency(m.preco_unitario)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {m.lead_time !== null ? `${m.lead_time} dias` : "—"}
                    </TableCell>
                    <TableCell>{m.tipo_material ?? "—"}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => setSelected(m)}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                      >
                        <Eye className="h-3.5 w-3.5" /> Detalhes
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>
              SKU {selected?.sku} · {selected?.descricao_resumida}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <InfoField label="Classe" value={selected?.classe ?? "—"} />
              <InfoField label="Status" value={selected?.status_material ?? "—"} />
              <InfoField label="Unidade" value={selected?.unidade_medida ?? "—"} />
              <InfoField label="Curva ABC" value={selected?.abc ?? "—"} />
              <InfoField label="Preço Unitário" value={formatCurrency(selected?.preco_unitario)} />
              <InfoField
                label="Lead Time"
                value={selected?.lead_time !== null && selected?.lead_time !== undefined ? `${selected.lead_time} dias` : "—"}
              />
              <InfoField label="Tipo Material" value={selected?.tipo_material ?? "—"} />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Descrição técnica
              </p>
              <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                {selected?.descricao_tecnica ?? "Sem descrição técnica cadastrada."}
              </p>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
