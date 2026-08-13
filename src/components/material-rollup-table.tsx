import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageLoading, EmptyState } from "@/components/ui/misc";
import { formatDate, formatNumber } from "@/lib/format";
import type { ObraMaterialRollup } from "@/lib/types";
import { PackageSearch } from "lucide-react";

export function MaterialRollupTable({
  rows,
  isLoading,
}: {
  rows: ObraMaterialRollup[];
  isLoading?: boolean;
}) {
  if (isLoading) return <PageLoading label="Calculando materiais…" />;
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch className="h-5 w-5" />}
        title="Nenhum material associado"
        description="Associe módulos construtivos ou materiais complementares."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Origem</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead className="text-right">Qtde. Total</TableHead>
          <TableHead>Unid.</TableHead>
          <TableHead className="text-right">Lead Time</TableHead>
          <TableHead>Prazo Máximo</TableHead>
          <TableHead>Crítica Lead Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={`${r.material_id}-${r.modulo_id ?? "extra"}`}>
            <TableCell>
              {r.idt_extra === "S" ? (
                <Badge variant="info">Complementar</Badge>
              ) : (
                <Badge variant="neutral">{r.modulo_codigo}</Badge>
              )}
            </TableCell>
            <TableCell className="font-mono text-slate-500">{r.sku}</TableCell>
            <TableCell className="max-w-sm">
              <span className="line-clamp-2 text-slate-700">{r.descricao_resumida}</span>
            </TableCell>
            <TableCell className="text-right font-medium text-slate-800">
              {formatNumber(r.quantidade_total)}
            </TableCell>
            <TableCell>{r.unidade_medida ?? "—"}</TableCell>
            <TableCell className="text-right whitespace-nowrap">
              {r.lead_time !== null ? `${r.lead_time} dias` : "—"}
            </TableCell>
            <TableCell className="whitespace-nowrap">{formatDate(r.prazo_maximo)}</TableCell>
            <TableCell>
              {r.critica_lead_time === "Fora do Prazo!" ? (
                <Badge variant="danger">Fora do Prazo!</Badge>
              ) : r.critica_lead_time === "Válido" ? (
                <Badge variant="success">Válido</Badge>
              ) : (
                "—"
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
