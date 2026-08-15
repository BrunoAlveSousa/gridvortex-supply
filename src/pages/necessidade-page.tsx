import * as React from "react";
import { Search, ListTree, Download, PackageSearch } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { useEmpresa } from "@/lib/empresa-context";
import { useNecessidadeMateriais } from "@/hooks/use-necessidade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PageLoading, EmptyState } from "@/components/ui/misc";
import { formatCurrency, formatNumber } from "@/lib/format";
import { aggregateNecessidade, monthLabel, type NecessidadeItem } from "@/lib/necessidade";
import { exportNecessidadeXlsx } from "@/lib/necessidade-export";
import { NecessidadeDetalhesDialog } from "@/pages/necessidade-detalhes-dialog";

export function NecessidadePage() {
  const { empresas } = useEmpresa();
  const { data: rows = [], isLoading } = useNecessidadeMateriais();

  const [empresaFiltro, setEmpresaFiltro] = React.useState("");
  const [classeFiltro, setClasseFiltro] = React.useState("");
  const [tipoFiltro, setTipoFiltro] = React.useState("");
  const [mesFiltro, setMesFiltro] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [viewing, setViewing] = React.useState<NecessidadeItem | null>(null);

  const empresaCodigoOf = React.useCallback(
    (empresaId: string) => empresas.find((e) => e.id === empresaId)?.codigo ?? "—",
    [empresas]
  );

  const { monthColumns, items } = React.useMemo(() => aggregateNecessidade(rows), [rows]);

  const classeOptions = React.useMemo(
    () => Array.from(new Set(items.map((i) => i.classe).filter((c): c is number => c !== null))).sort((a, b) => a - b),
    [items]
  );
  const tipoOptions = React.useMemo(
    () => Array.from(new Set(items.map((i) => i.tipoMaterial).filter(Boolean))) as string[],
    [items]
  );

  const filtered = items.filter((item) => {
    if (empresaFiltro && item.empresaId !== empresaFiltro) return false;
    if (classeFiltro && String(item.classe) !== classeFiltro) return false;
    if (tipoFiltro && item.tipoMaterial !== tipoFiltro) return false;
    if (mesFiltro && !(item.porMes[mesFiltro] > 0)) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      if (!String(item.sku).includes(q) && !item.descricaoResumida.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="pb-16">
      <Topbar
        eyebrow="Módulo Supply"
        title="Necessidade de Materiais"
        description="Consolidado da necessidade de materiais de todos os projetos, agrupado por empresa e SKU, distribuído mês a mês conforme o cronograma das obras. Base de entrada para o Plano de Demanda (S&OP)."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => exportNecessidadeXlsx({ items: filtered, monthColumns, empresaCodigoOf, fileNameSuffix: "filtrado" })}>
              <Download className="h-4 w-4" /> Exportar filtrado
            </Button>
            <Button onClick={() => exportNecessidadeXlsx({ items, monthColumns, empresaCodigoOf, fileNameSuffix: "completo" })}>
              <Download className="h-4 w-4" /> Exportar tudo
            </Button>
          </div>
        }
      />

      <div className="px-8 py-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por SKU ou descrição…"
              className="pl-9"
            />
          </div>
          <Select value={empresaFiltro} onChange={(e) => setEmpresaFiltro(e.target.value)} className="w-40">
            <option value="">Todas as empresas</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>{e.codigo}</option>
            ))}
          </Select>
          <Select value={classeFiltro} onChange={(e) => setClasseFiltro(e.target.value)} className="w-36">
            <option value="">Todas as classes</option>
            {classeOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
          <Select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)} className="w-40">
            <option value="">Todos os tipos</option>
            {tipoOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
          <Select value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)} className="w-44">
            <option value="">Todos os meses</option>
            {monthColumns.map((mk) => (
              <option key={mk} value={mk}>{monthLabel(mk)}</option>
            ))}
          </Select>
          <span className="text-sm text-slate-400">{filtered.length} de {items.length} materiais</span>
        </div>

        <Card className="overflow-hidden">
          {isLoading ? (
            <PageLoading label="Calculando necessidade de materiais…" />
          ) : items.length === 0 ? (
            <EmptyState
              icon={<PackageSearch className="h-5 w-5" />}
              title="Nenhuma necessidade calculada ainda"
              description="Cadastre obras vinculadas a projetos para ver a necessidade de materiais consolidada aqui."
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<PackageSearch className="h-5 w-5" />}
              title="Nenhum material encontrado"
              description="Ajuste a busca ou os filtros para ver outros materiais."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  {monthColumns.map((mk) => (
                    <TableHead key={mk} className="text-right whitespace-nowrap">{monthLabel(mk)}</TableHead>
                  ))}
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.key}>
                    <TableCell className="font-mono text-slate-500">{empresaCodigoOf(item.empresaId)}</TableCell>
                    <TableCell className="font-mono text-slate-500">{item.sku}</TableCell>
                    <TableCell>{item.classe ?? "—"}</TableCell>
                    <TableCell className="max-w-sm">
                      <span className="line-clamp-2 font-medium text-slate-800">{item.descricaoResumida}</span>
                    </TableCell>
                    <TableCell>{item.tipoMaterial ?? "—"}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.valorTotal)}</TableCell>
                    {monthColumns.map((mk) => (
                      <TableCell key={mk} className="text-right whitespace-nowrap">
                        {item.porMes[mk] ? formatNumber(item.porMes[mk]) : "—"}
                      </TableCell>
                    ))}
                    <TableCell>
                      <button
                        onClick={() => setViewing(item)}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                      >
                        <ListTree className="h-3.5 w-3.5" /> Detalhes
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      <NecessidadeDetalhesDialog
        item={viewing}
        empresaCodigo={viewing ? empresaCodigoOf(viewing.empresaId) : ""}
        onOpenChange={(open) => !open && setViewing(null)}
      />
    </div>
  );
}
