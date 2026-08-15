import * as XLSX from "xlsx";
import type { NecessidadeItem } from "@/lib/necessidade";
import { monthLabel, formatDetalhamento } from "@/lib/necessidade";

export function exportNecessidadeXlsx({
  items,
  monthColumns,
  empresaCodigoOf,
  fileNameSuffix,
}: {
  items: NecessidadeItem[];
  monthColumns: string[];
  empresaCodigoOf: (empresaId: string) => string;
  fileNameSuffix: "completo" | "filtrado";
}) {
  const header = [
    "EMPRESA",
    "SKU",
    "Classe",
    "Descrição Resumida",
    "Tipo",
    "Valor Total",
    ...monthColumns.map(monthLabel),
    "Detalhamento",
  ];

  const dataRows = items.map((item) => [
    empresaCodigoOf(item.empresaId),
    item.sku,
    item.classe ?? "",
    item.descricaoResumida,
    item.tipoMaterial ?? "",
    item.valorTotal ?? "",
    ...monthColumns.map((mk) => item.porMes[mk] ?? 0),
    formatDetalhamento(item),
  ]);

  const ws = XLSX.utils.aoa_to_sheet([header, ...dataRows]);
  ws["!cols"] = [
    { wch: 10 }, // empresa
    { wch: 10 }, // sku
    { wch: 8 }, // classe
    { wch: 40 }, // descricao
    { wch: 14 }, // tipo
    { wch: 14 }, // valor total
    ...monthColumns.map(() => ({ wch: 12 })),
    { wch: 60 }, // detalhamento
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Necessidade");

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `necessidade-materiais-${fileNameSuffix}-${today}.xlsx`);
}
