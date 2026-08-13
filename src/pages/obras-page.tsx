import * as React from "react";
import { Plus, HardHat, Pencil, Trash2, Calendar, ListChecks, AlertTriangle } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { useEmpresa } from "@/lib/empresa-context";
import { useMateriais } from "@/hooks/use-materiais";
import { useModulos } from "@/hooks/use-modulos";
import { useObras, useSaveObra, useDeleteObra, useObraMateriais, type ObraCompleta } from "@/hooks/use-obras";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoading, EmptyState } from "@/components/ui/misc";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ObraFormDialog } from "@/pages/obra-form-dialog";
import { MaterialRollupTable } from "@/components/material-rollup-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody } from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";

function ObraMateriaisDialog({ obra, onOpenChange }: { obra: ObraCompleta | null; onOpenChange: (open: boolean) => void }) {
  const { data: rows = [], isLoading } = useObraMateriais(obra?.id ?? null);
  return (
    <Dialog open={!!obra} onOpenChange={(open) => !open && onOpenChange(open)}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Materiais da obra {obra?.codigo}</DialogTitle>
          <DialogDescription>
            Consolidado de materiais dos módulos associados + materiais complementares, com prazo máximo de solicitação calculado.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <MaterialRollupTable rows={rows} isLoading={isLoading} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

function ObraCriticaBadge({ obraId }: { obraId: string }) {
  const { data: rows = [] } = useObraMateriais(obraId);
  const foraDoPrazo = rows.filter((r) => r.critica_lead_time === "Fora do Prazo!").length;
  if (foraDoPrazo === 0) return null;
  return (
    <Badge variant="danger">
      <AlertTriangle className="h-3 w-3" /> {foraDoPrazo} fora do prazo
    </Badge>
  );
}

export function ObrasPage() {
  const { empresaId } = useEmpresa();
  const { data: obras = [], isLoading } = useObras(empresaId);
  const { data: modulos = [] } = useModulos(empresaId);
  const { data: materiais = [] } = useMateriais(empresaId);
  const saveObra = useSaveObra(empresaId);
  const deleteObra = useDeleteObra(empresaId);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ObraCompleta | null>(null);
  const [deleting, setDeleting] = React.useState<ObraCompleta | null>(null);
  const [viewing, setViewing] = React.useState<ObraCompleta | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setErrorMessage(null);
    setFormOpen(true);
  };
  const openEdit = (obra: ObraCompleta) => {
    setEditing(obra);
    setErrorMessage(null);
    setFormOpen(true);
  };

  const handleSubmit = (input: Parameters<typeof saveObra.mutate>[0]["input"]) => {
    setErrorMessage(null);
    saveObra.mutate(
      { id: editing?.id, input },
      {
        onSuccess: () => setFormOpen(false),
        onError: (err: any) => setErrorMessage(err.message ?? "Erro ao salvar obra."),
      }
    );
  };

  const handleDelete = () => {
    if (!deleting) return;
    setDeleteError(null);
    deleteObra.mutate(deleting.id, {
      onSuccess: () => setDeleting(null),
      onError: (err: any) => {
        const msg = String(err?.message ?? "");
        setDeleteError(
          msg.includes("foreign key") || msg.includes("violates")
            ? "Esta obra está associada a um ou mais projetos e não pode ser excluída."
            : msg || "Erro ao excluir obra."
        );
      },
    });
  };

  return (
    <div className="pb-16">
      <Topbar
        eyebrow="Módulo Supply"
        title="Cadastro de Obras"
        description="Associe módulos construtivos e materiais complementares específicos a cada obra."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nova obra
          </Button>
        }
      />

      <div className="px-8 py-6">
        {isLoading ? (
          <PageLoading label="Carregando obras…" />
        ) : obras.length === 0 ? (
          <EmptyState
            icon={<HardHat className="h-5 w-5" />}
            title="Nenhuma obra cadastrada"
            description="Crie a primeira obra e associe os módulos construtivos necessários."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" /> Nova obra
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {obras.map((obra) => (
              <Card key={obra.id} className="flex flex-col">
                <CardHeader className="flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle>{obra.codigo}</CardTitle>
                    {obra.nome && <p className="mt-0.5 text-sm text-slate-500">{obra.nome}</p>}
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="h-3 w-3" /> {formatDate(obra.inicio_prg)} — {formatDate(obra.fim_prg)}
                    </p>
                  </div>
                  <ObraCriticaBadge obraId={obra.id} />
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Módulos associados
                  </p>
                  {obra.obra_modulos.length === 0 ? (
                    <p className="text-sm text-slate-400">Nenhum módulo associado.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {obra.obra_modulos.map((om) => (
                        <Badge key={om.id} variant="neutral">
                          {om.modulo?.codigo} × {om.qtde_modular}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {obra.obra_materiais_extra.length > 0 && (
                    <p className="text-xs text-slate-400">
                      + {obra.obra_materiais_extra.length} material(is) complementar(es)
                    </p>
                  )}
                </CardContent>
                <div className="flex items-center gap-1.5 border-t border-slate-100 px-5 py-3">
                  <Button variant="secondary" size="sm" onClick={() => setViewing(obra)}>
                    <ListChecks className="h-3.5 w-3.5" /> Materiais
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => openEdit(obra)}>
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => {
                      setDeleteError(null);
                      setDeleting(obra);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ObraFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        obra={editing}
        modulos={modulos}
        materiais={materiais}
        onSubmit={handleSubmit}
        submitting={saveObra.isPending}
        errorMessage={errorMessage}
      />

      <ObraMateriaisDialog obra={viewing} onOpenChange={(open) => !open && setViewing(null)} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Excluir obra ${deleting?.codigo}?`}
        description={deleteError ?? "Essa ação não pode ser desfeita."}
        onConfirm={handleDelete}
        loading={deleteObra.isPending}
      />
    </div>
  );
}
