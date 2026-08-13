import { NavLink } from "react-router-dom";
import { Package, Boxes, HardHat, FolderKanban, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/materiais", label: "Lista de Materiais", icon: Package },
  { to: "/modulos", label: "Módulos Construtivos", icon: Boxes },
  { to: "/obras", label: "Cadastro de Obras", icon: HardHat },
  { to: "/projetos", label: "Cadastro de Projetos", icon: FolderKanban },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
          <Zap className="h-5 w-5" fill="currentColor" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">GridVortex</p>
          <p className="text-xs text-slate-400">Supply</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <p className="px-2 pb-2 pt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Módulo Supply
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-slate-100 px-4 py-4">
        <p className="text-xs text-slate-400">
          Protótipo funcional · dados de exemplo
        </p>
      </div>
    </aside>
  );
}
