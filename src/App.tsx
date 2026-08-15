import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EmpresaProvider } from "@/lib/empresa-context";
import { AppLayout } from "@/components/layout/app-layout";
import { MateriaisPage } from "@/pages/materiais-page";
import { ModulosPage } from "@/pages/modulos-page";
import { ObrasPage } from "@/pages/obras-page";
import { ProjetosPage } from "@/pages/projetos-page";
import { NecessidadePage } from "@/pages/necessidade-page";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EmpresaProvider>
        <HashRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/materiais" replace />} />
              <Route path="/materiais" element={<MateriaisPage />} />
              <Route path="/modulos" element={<ModulosPage />} />
              <Route path="/obras" element={<ObrasPage />} />
              <Route path="/projetos" element={<ProjetosPage />} />
              <Route path="/necessidade" element={<NecessidadePage />} />
              <Route path="*" element={<Navigate to="/materiais" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </EmpresaProvider>
    </QueryClientProvider>
  );
}
