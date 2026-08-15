export interface Empresa {
  id: string;
  codigo: string;
  nome: string | null;
}

export interface Material {
  id: string;
  empresa_id: string;
  sku: number;
  classe: number | null;
  descricao_resumida: string;
  descricao_tecnica: string | null;
  status_material: string | null;
  unidade_medida: string | null;
  abc: string | null;
  preco_unitario: string | null;
  lead_time: number | null;
  tipo_material: string | null;
}

export interface ModuloConstrutivo {
  id: string;
  empresa_id: string;
  codigo: string;
  codarea: number | null;
  sigla_area: string | null;
  natureza: string | null;
  created_at: string;
}

export interface ModuloItem {
  id: string;
  modulo_id: string;
  material_id: string;
  quantidade: number;
  material?: Material;
}

export interface Obra {
  id: string;
  empresa_id: string;
  codigo: string;
  nome: string | null;
  inicio_prg: string;
  fim_prg: string;
  created_at: string;
}

export interface ObraModulo {
  id: string;
  obra_id: string;
  modulo_id: string;
  qtde_modular: number;
  modulo?: ModuloConstrutivo;
}

export interface ObraMaterialExtra {
  id: string;
  obra_id: string;
  material_id: string;
  quantidade: number;
  material?: Material;
}

export interface Projeto {
  id: string;
  empresa_id: string;
  codigo: string;
  nome_projeto: string | null;
  cod_objetivo: number | null;
  cod_destinacao: number | null;
  created_at: string;
}

export interface ProjetoObra {
  id: string;
  projeto_id: string;
  obra_id: string;
  obra?: Obra;
}

export interface AuxObjetivo {
  cod_objetivo: number;
  objetivo: string;
}

export interface AuxDestinacao {
  cod_objetivo: number;
  cod_destinacao: number;
  descricao: string;
}

export interface AuxArea {
  codarea: number;
  sigla_area: string;
}

export interface ObraMaterialRollup {
  obra_id: string;
  empresa_id: string;
  obra_codigo: string;
  inicio_prg: string;
  fim_prg: string;
  modulo_id: string | null;
  modulo_codigo: string;
  qtde_modular: number;
  codarea: number | null;
  sigla_area: string | null;
  natureza: string | null;
  material_id: string;
  sku: number;
  classe: number | null;
  descricao_resumida: string;
  unidade_medida: string | null;
  lead_time: number | null;
  tipo_material: string | null;
  preco_unitario: string | null;
  quantidade_total: number;
  idt_extra: "S" | "N";
  prazo_maximo: string | null;
  critica_lead_time: "Válido" | "Fora do Prazo!" | null;
}

export interface ProjetoMaterialRollup extends ObraMaterialRollup {
  projeto_id: string;
  projeto_codigo: string;
  nome_projeto: string | null;
  cod_objetivo: number | null;
  objetivo: string | null;
  cod_destinacao: number | null;
  destinacao_descricao: string | null;
}
