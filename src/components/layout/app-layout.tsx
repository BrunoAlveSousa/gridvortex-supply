import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";

export function AppLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--color-surface)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
