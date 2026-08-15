import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatDate, formatNumber } from "@/lib/format";
import { monthLabel, type NecessidadeItem } from "@/lib/necessidade";

export function NecessidadeDetalhesDialog({
  item,
  empresaCodigo,
  onOpenChange,
}: {
  item: NecessidadeItem | null;
  empresaCodigo: string;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onOpenChange(open)}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>
            {empresaCodigo} · SKU {item?.sku} · {item?.descricaoResumida}
          </DialogTitle>
          <DialogDescription>
            Origem da necessidade: obras, projetos, áreas e módulos que geraram este material.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {item && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Obra</TableHead>
                  <TableHead>Projeto(s)</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.detalhes.map((d, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-slate-800">{d.obraCodigo}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {d.projetos.map((p) => (
                          <Badge key={p.projeto_id} variant="neutral">
                            {p.projeto_codigo}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{d.areaSigla ?? "—"}</TableCell>
                    <TableCell>
                      {d.origem === "Módulo" ? (
                        <Badge variant="neutral">{d.moduloCodigo}</Badge>
                      ) : (
                        <Badge variant="info">Complementar</Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-slate-500">
                      {d.inicioPrg === d.fimPrg
                        ? formatDate(d.inicioPrg)
                        : `${formatDate(d.inicioPrg)} — ${formatDate(d.fimPrg)}`}
                      {Object.keys(d.porMes).length > 1 && (
                        <div className="mt-1 space-y-0.5">
                          {Object.entries(d.porMes).map(([mk, v]) => (
                            <div key={mk}>
                              {monthLabel(mk)}: {formatNumber(v)}
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-800">
                      {formatNumber(d.quantidade)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
