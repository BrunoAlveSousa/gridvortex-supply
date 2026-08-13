import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MaterialPicker, SelectedMaterialRow } from "@/components/material-picker";
import { useAreas } from "@/hooks/use-aux";
import type { Material } from "@/lib/types";
import type { ModuloComItens } from "@/hooks/use-modulos";

export interface ModuloDraftItem {
  material: Material;
  quantidade: number;
}

export function ModuloFormDialog({
  open,
  onOpenChange,
  modulo,
  materiais,
  onSubmit,
  submitting,
  errorMessage,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modulo: ModuloComItens | null;
  materiais: Material[];
  onSubmit: (input: {
    codigo: string;
    codarea: number | null;
    sigla_area: string | null;
    itens: { material_id: string; quantidade: number }[];
  }) => void;
  submitting: boolean;
  errorMessage?: string | null;
}) {
  const { data: areas = [] } = useAreas();
  const [codigo, setCodigo] = React.useState("");
  const [areaKey, setAreaKey] = React.useState("");
  const [itens, setItens] = React.useState<ModuloDraftItem[]>([]);

  React.useEffect(() => {
    if (open) {
      setCodigo(modulo?.codigo ?? "");
      setAreaKey(
        modulo?.codarea != null ? `${modulo.codarea}|${modulo.sigla_area ?? ""}` : ""
      );
      setItens(
        (modulo?.modulo_itens ?? []).map((mi) => ({
          material: mi.material,
          quantidade: Number(mi.quantidade),
        }))
      );
    }
  }, [open, modulo]);

  const [codarea, siglaArea] = areaKey ? areaKey.split("|") : [null, null];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      codigo: codigo.trim(),
      codarea: codarea ? Number(codarea) : null,
      sigla_area: siglaArea || null,
      itens: itens.map((i) => ({ material_id: i.material.id, quantidade: i.quantidade })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{modulo ? `Editar módulo ${modulo.codigo}` : "Novo módulo construtivo"}</DialogTitle>
            <DialogDescription>
              Um kit de materiais reutilizável para agilizar o cadastro de obras.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="codigo">Nome do módulo</Label>
                <Input
                  id="codigo"
                  required
                  placeholder="Ex.: M-3"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="area">Área</Label>
                <Select id="area" value={areaKey} onChange={(e) => setAreaKey(e.target.value)}>
                  <option value="">Sem área definida</option>
                  {areas.map((a) => (
                    <option key={a.codarea} value={`${a.codarea}|${a.sigla_area}`}>
                      {a.sigla_area} ({a.codarea})
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Materiais do módulo</Label>
              <MaterialPicker
                materiais={materiais}
                excludeIds={itens.map((i) => i.material.id)}
                onSelect={(material) =>
                  setItens((prev) => [...prev, { material, quantidade: 1 }])
                }
              />
              {itens.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-400">
                  Associe pelo menos 1 SKU para criar o módulo.
                </p>
              ) : (
                <div className="space-y-2">
                  {itens.map((item) => (
                    <SelectedMaterialRow
                      key={item.material.id}
                      material={item.material}
                      quantidade={item.quantidade}
                      onQuantidadeChange={(value) =>
                        setItens((prev) =>
                          prev.map((i) =>
                            i.material.id === item.material.id ? { ...i, quantidade: value } : i
                          )
                        )
                      }
                      onRemove={() =>
                        setItens((prev) => prev.filter((i) => i.material.id !== item.material.id))
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {errorMessage && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || itens.length === 0}>
              {submitting ? "Salvando…" : "Salvar módulo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
