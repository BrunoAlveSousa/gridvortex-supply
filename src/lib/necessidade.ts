import { parseNumericBR } from "@/lib/format";
import type { NecessidadeRow } from "@/hooks/use-necessidade";

/** "2027-03-04" -> "2027-03" */
export function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

/** "2027-03" -> "mar/2027" */
export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  const label = d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
  return label.replace(".", "");
}

/** Inclusive list of "YYYY-MM" month keys from the month of startStr through the month of endStr. */
export function monthsBetween(startStr: string, endStr: string): string[] {
  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");
  const months: string[] = [];
  let cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cur <= last) {
    months.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`);
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  return months;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Business rule (confirmed with the user): if an obra's início e fim
 * programados fall in different months, split its material quantity equally
 * across every month in that range. Most materials here are discrete units
 * (transformers, postes, conectores — não faz sentido pedir "meio conector"),
 * so the equal share is floored to a whole unit for every month except the
 * first; the first month absorbs whatever is left over (the rounding
 * remainder, and any fractional part the original quantity already had) —
 * so the months always sum back exactly to the original quantity.
 */
export function splitQuantityAcrossMonths(qty: number, months: string[]): Record<string, number> {
  const result: Record<string, number> = {};
  const n = months.length;
  if (n === 0) return result;
  if (n === 1) {
    result[months[0]] = round2(qty);
    return result;
  }
  const perMonth = Math.floor(qty / n);
  result[months[0]] = round2(qty - perMonth * (n - 1));
  for (let i = 1; i < n; i++) {
    result[months[i]] = perMonth;
  }
  return result;
}

export interface NecessidadeDetalhe {
  obraId: string;
  obraCodigo: string;
  projetos: { projeto_id: string; projeto_codigo: string; nome_projeto: string | null }[];
  areaSigla: string | null;
  origem: "Módulo" | "Complementar";
  moduloCodigo: string | null;
  quantidade: number;
  inicioPrg: string;
  fimPrg: string;
  porMes: Record<string, number>;
}

export interface NecessidadeItem {
  key: string;
  empresaId: string;
  sku: number;
  classe: number | null;
  descricaoResumida: string;
  unidadeMedida: string | null;
  tipoMaterial: string | null;
  precoUnitario: number | null;
  quantidadeTotal: number;
  valorTotal: number | null;
  porMes: Record<string, number>;
  detalhes: NecessidadeDetalhe[];
}

export function aggregateNecessidade(rows: NecessidadeRow[]): {
  monthColumns: string[];
  items: NecessidadeItem[];
} {
  if (rows.length === 0) return { monthColumns: [], items: [] };

  let minStart = rows[0].inicio_prg;
  let maxEnd = rows[0].fim_prg;
  for (const r of rows) {
    if (r.inicio_prg < minStart) minStart = r.inicio_prg;
    if (r.fim_prg > maxEnd) maxEnd = r.fim_prg;
  }
  const monthColumns = monthsBetween(minStart, maxEnd);

  const itemsMap = new Map<string, NecessidadeItem>();
  for (const r of rows) {
    const key = `${r.empresa_id}::${r.sku}`;
    let item = itemsMap.get(key);
    if (!item) {
      item = {
        key,
        empresaId: r.empresa_id,
        sku: r.sku,
        classe: r.classe,
        descricaoResumida: r.descricao_resumida,
        unidadeMedida: r.unidade_medida,
        tipoMaterial: r.tipo_material,
        precoUnitario: parseNumericBR(r.preco_unitario),
        quantidadeTotal: 0,
        valorTotal: 0,
        porMes: {},
        detalhes: [],
      };
      itemsMap.set(key, item);
    }

    const qty = Number(r.quantidade_total);
    const rowMonths = monthsBetween(r.inicio_prg, r.fim_prg);
    const split = splitQuantityAcrossMonths(qty, rowMonths);
    for (const [mk, v] of Object.entries(split)) {
      item.porMes[mk] = round2((item.porMes[mk] ?? 0) + v);
    }
    item.quantidadeTotal = round2(item.quantidadeTotal + qty);
    item.detalhes.push({
      obraId: r.obra_id,
      obraCodigo: r.obra_codigo,
      projetos: r.projetos,
      areaSigla: r.sigla_area,
      origem: r.idt_extra === "S" ? "Complementar" : "Módulo",
      moduloCodigo: r.idt_extra === "S" ? null : r.modulo_codigo,
      quantidade: qty,
      inicioPrg: r.inicio_prg,
      fimPrg: r.fim_prg,
      porMes: split,
    });
  }

  for (const item of itemsMap.values()) {
    item.valorTotal = item.precoUnitario !== null ? round2(item.precoUnitario * item.quantidadeTotal) : null;
  }

  return {
    monthColumns,
    items: Array.from(itemsMap.values()).sort((a, b) => a.sku - b.sku),
  };
}

/** One-line, human-readable summary of an item's origin — used in the export and as a fallback. */
export function formatDetalhamento(item: NecessidadeItem): string {
  return item.detalhes
    .map((d) => {
      const projetos = d.projetos.map((p) => p.projeto_codigo).join("/") || "sem projeto";
      const origem = d.origem === "Módulo" && d.moduloCodigo ? `Módulo ${d.moduloCodigo}` : "Material complementar";
      const area = d.areaSigla ? `, Área ${d.areaSigla}` : "";
      const periodo = d.inicioPrg === d.fimPrg ? d.inicioPrg : `${d.inicioPrg} a ${d.fimPrg}`;
      return `Obra ${d.obraCodigo} (Projeto ${projetos}) — ${origem}${area}: ${d.quantidade} em ${periodo}`;
    })
    .join(" | ");
}
