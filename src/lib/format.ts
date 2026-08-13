export function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return String(value); // e.g. "6- DESPADRONIZADO"
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value + (value.length === 10 ? "T00:00:00" : ""));
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("pt-BR");
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString("pt-BR");
}

/**
 * Prazo Máximo = data início da obra - lead time (dias) do material.
 * Crítica Lead Time = "Fora do Prazo!" quando o prazo máximo já passou de hoje.
 */
export function calcPrazoMaximo(inicioPrg: string, leadTimeDias: number | null): string | null {
  if (!leadTimeDias && leadTimeDias !== 0) return null;
  const inicio = new Date(inicioPrg + "T00:00:00");
  inicio.setDate(inicio.getDate() - leadTimeDias);
  return inicio.toISOString().slice(0, 10);
}

export function calcCriticaLeadTime(prazoMaximo: string | null): "Válido" | "Fora do Prazo!" | null {
  if (!prazoMaximo) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const prazo = new Date(prazoMaximo + "T00:00:00");
  return prazo < hoje ? "Fora do Prazo!" : "Válido";
}
