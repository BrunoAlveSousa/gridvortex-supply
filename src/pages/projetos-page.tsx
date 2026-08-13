import * as React from "react";
import { Plus, FolderKanban, Pencil, Trash2, ListChecks, HardHat as HardHatIcon } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { useEmpresa } from "@/lib/empresa-context";
import { useObras } from "@/hooks/use-obras";
import {
  useProjetos,
  useSaveProjeto,
  useDeleteProjeto,
  useProjetoMateriais,
  type ProjetoCompleto,
} from "@/hooks/use-projetos";
import { useObjetivos } from "@/hooks/use-aux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoading, EmptyState } from "@/components/ui/misc";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProjetoFormDialog } from "@/pages/projeto-form-dialog";
import { MaterialRollupTable } from "@/components/material-rollup-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody } from "@/components/ui/dialog";

function ProjetoMateriaisDialog({
  projeto,
  onOpenChange,
}: {
  projeto: ProjetoCompleto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: rows = [], isLoading } = useProjetoMateriais(projeto?.id ?? null);
  return (
    <Dialog open={!!projeto} onOpenChange={(open) => !open && onOpenChange(open)}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Materiais do projeto {projeto?.codigo}</DialogTitle>
          <DialogDescription>Consolidado de materiais de todas as obras associadas ao projeto.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <MaterialRollupTable rows={rows} isLoading={isLoading} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export function ProjetosPage() {
  const { empresaId } = useEmpresa();
  const { data: projetos = [], isLoading } = useProjetos(empresaId);
  const { data: obras = [] } = useObras(empresaId);
  const { data: objetivos = [] } = useObjetivos();
  const saveProjeto = useSaveProjeto(empresaId);
  const deleteProjeto = useDeleteProjeto(empresaId);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProjetoCompleto | null>(null);
  const [deleting, setDeleting] = React.useState<ProjetoCompleto | null>(null);
  const [viewing, setViewing] = React.useState<ProjetoCompleto | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const objetivoLabel = (cod: number | null) =>
    objetivos.find((o) => o.cod_objetivo === cod)?.objetivo.trim();

  const openCreate = () => {
    setEditing(null);
    setErrorMessage(null);
    setFormOpen(true);
  };
  const openEdit = (projeto: ProjetoCompleto) => {
    setEditing(projeto);
    setErrorMessage(null);
    setFormOpen(true);
  };

  const handleSubmit = (input: Parameters<typeof saveProjeto.mutate>[0]["input"]) => {
    setErrorMessage(null);
    saveProjeto.mutate(
      { id: editing?.id, input },
      {
        onSuccess: () => setFormOpen(false),
        onError: (err: any) => setErrorMessage(err.message ?? "Erro ao salvar projeto."),
      }
    );
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteProjeto.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
  };

  return (
    <div className="pb-16">
      <Topbar
        eyebrow="Módulo Supply"
        title="Cadastro de Projetos"
        description="Agrupe obras dentro de projetos e acompanhe o consolidado de materiais."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Novo projeto
          </Button>
        }
      />

      <div className="px-8 py-6">
        {isLoading ? (
          <PageLoading label="Carregando projetos…" />
        ) : projetos.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="h-5 w-5" />}
            title="Nenhum projeto cadastrado"
            description="Crie o primeiro projeto e associe as obras que o compõem."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" /> Novo projeto
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projetos.map((projeto) => (
              <Card key={projeto.id} className="flex flex-col">
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <CardTitle>{projeto.codigo}</CardTitle>
                    {objetivoLabel(projeto.cod_objetivo) && (
                      <Badge variant="brand">{objetivoLabel(projeto.cod_objetivo)}</Badge>
                    )}
                  </div>
                  {projeto.nome_projeto && (
                    <p className="text-sm text-slate-500">{projeto.nome_projeto}</p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Obras associadas
                  </p>
                  {projeto.projeto_obras.length === 0 ? (
                    <p className="text-sm text-slate-400">Nenhuma obra associada.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {projeto.projeto_obras.map((po) => (
                        <Badge key={po.id} variant="neutral">
                          <HardHatIcon className="h-3 w-3" /> {po.obra?.codigo}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                <div className="flex items-center gap-1.5 border-t border-slate-100 px-5 py-3">
                  <Button variant="secondary" size="sm" onClick={() => setViewing(projeto)}>
                    <ListChecks className="h-3.5 w-3.5" /> Materiais
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => openEdit(projeto)}>
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setDeleting(projeto)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ProjetoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        projeto={editing}
        obras={obras}
        onSubmit={handleSubmit}
        submitting={saveProjeto.isPending}
        errorMessage={errorMessage}
      />

      <ProjetoMateriaisDialog projeto={viewing} onOpenChange={(open) => !open && setViewing(null)} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Excluir projeto ${deleting?.codigo}?`}
        description="Essa ação não pode ser desfeita."
        onConfirm={handleDelete}
        loading={deleteProjeto.isPending}
      />
    </div>
  );
}
