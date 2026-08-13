import { EmpresaSwitcher } from "@/components/layout/empresa-switcher";

export function Topbar({
  title,
  description,
  eyebrow,
  actions,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between px-8 py-3 text-xs text-slate-500">
        <span>Grupo Energisa · Módulo Supply · Planejamento de Materiais de Obra</span>
        <EmpresaSwitcher />
      </div>
      <div className="flex items-start justify-between gap-4 border-t border-slate-100 bg-brand-50/40 px-8 py-6">
        <div>
          {eyebrow && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
