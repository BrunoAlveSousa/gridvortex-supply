import * as React from "react";
import { Plus, Boxes, Pencil, Trash2, MapPin } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { useEmpresa } from "@/lib/empresa-context";
import { useMateriais } from "@/hooks/use-materiais";
import { useModulos, useSaveModulo, useDeleteModulo, type ModuloComItens } from "@/hooks/use-modulos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoading, EmptyState } from "@/components/ui/misc";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ModuloFormDialog } from "@/pages/modulo-form-dialog";
import { formatNumber } from "@/lib/format";

export function ModulosPage() {
  const { empresaId } = useEmpresa();
  const { data: modulos = [], isLoading } = useModulos(empresaId);
  const { data: materiais = [] } = useMateriais(empresaId);
  const saveModulo = useSaveModulo(empresaId);
  const deleteModulo = useDeleteModulo(empresaId);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ModuloComItens | null>(null);
  const [deleting, setDeleting] = React.useState<ModuloComItens | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setErrorMessage(null);
    setFormOpen(true);
  };

  const openEdit = (modulo: ModuloComItens) => {
    setEditing(modulo);
    setErrorMessage(null);
    setFormOpen(true);
  };

  const handleSubmit = (input: Parameters<typeof saveModulo.mutate>[0]["input"]) => {
    setErrorMessage(null);
    saveModulo.mutate(
      { id: editing?.id, input },
      {
        onSuccess: () => setFormOpen(false),
        onError: (err: any) => setErrorMessage(err.message ?? "Erro ao salvar módulo."),
      }
    );
  };

  const handleDelete = () => {
    if (!deleting) return;
    setDeleteError(null);
    deleteModulo.mutate(deleting.id, {
      onSuccess: () => setDeleting(null),
      onError: (err: any) => {
        const msg = String(err?.message ?? "");
        setDeleteError(
          msg.includes("foreign key") || msg.includes("violates")
            ? "Este módulo está sendo usado em uma ou mais obras e não pode ser excluído."
            : msg || "Erro ao excluir módulo."
        );
      },
    });
  };

  return (
    <div className="pb-16">
      <Topbar
        eyebrow="Módulo Supply"
        title="Módulos Construtivos"
        description="Monte kits de materiais trabalhados em conjunto para agilizar o cadastro de obras."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Novo módulo
          </Button>
        }
      />

      <div className="px-8 py-6">
        {isLoading ? (
          <PageLoading label="Carregando módulos…" />
        ) : modulos.length === 0 ? (
          <EmptyState
            icon={<Boxes className="h-5 w-5" />}
            title="Nenhum módulo construtivo cadastrado"
            description="Crie o primeiro módulo para reutilizar kits de materiais nas suas obras."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" /> Novo módulo
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modulos.map((modulo) => (
              <Card key={modulo.id} className="flex flex-col">
                <CardHeader className="flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle>{modulo.codigo}</CardTitle>
                    {modulo.sigla_area && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-3 w-3" /> {modulo.sigla_area} · {modulo.codarea}
                      </p>
                    )}
                  </div>
                  <Badge variant="brand">{modulo.modulo_itens.length} SKUs</Badge>
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  {modulo.modulo_itens.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-slate-600">
                        {item.material.sku} · {item.material.descricao_resumida}
                      </span>
                      <span className="shrink-0 font-medium text-slate-800">
                        {formatNumber(item.quantidade)} {item.material.unidade_medida}
                      </span>
                    </div>
                  ))}
                  {modulo.modulo_itens.length > 4 && (
                    <p className="text-xs text-slate-400">
                      + {modulo.modulo_itens.length - 4} outro(s) material(is)
                    </p>
                  )}
                </CardContent>
                <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(modulo)}>
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => {
                      setDeleteError(null);
                      setDeleting(modulo);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Excluir
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ModuloFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        modulo={editing}
        materiais={materiais}
        onSubmit={handleSubmit}
        submitting={saveModulo.isPending}
        errorMessage={errorMessage}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Excluir módulo ${deleting?.codigo}?`}
        description={deleteError ?? "Essa ação não pode ser desfeita."}
        onConfirm={handleDelete}
        loading={deleteModulo.isPending}
      />
    </div>
  );
}
