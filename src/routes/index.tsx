import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Slider } from "@/components/ui/slider";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Ficha de Mel de Origem Única — Análise Sensorial" },
      {
        name: "description",
        content:
          "Cadastro de amostras de mel de origem única para análise sensorial: visual, odor, sabor, aroma e textura.",
      },
    ],
  }),
});

type FormState = {
  numero_amostra: string;
  origem_botanica: string;
  visual_estado_fisico: string;
  visual_aspecto: string;
  visual_cor: string;
  odor_intensidade: string;
  odor_descricao: string;
  sabor_intensidade: string;
  sabor_descricao: string;
  sabor_persistencia: string;
  gosto_doce: string;
  gosto_acido: string;
  gosto_salgado: string;
  gosto_amargo: string;
  gosto_outros: string;
  textura_viscosidade: string;
  textura_cristais: string;
  notas_extras: string;
};

const escalaAttrs = [
  { key: "escala_docura", label: "Doçura" },
  { key: "escala_acidez", label: "Acidez" },
  { key: "escala_salinidade", label: "Salinidade" },
  { key: "escala_amargor", label: "Amargor" },
  { key: "escala_floral", label: "Floral" },
  { key: "escala_frutado", label: "Frutado" },
  { key: "escala_quente", label: "Quente / Aquecido" },
  { key: "escala_aromatico", label: "Aromático" },
  { key: "escala_quimico", label: "Químico" },
  { key: "escala_vegetal", label: "Vegetal" },
  { key: "escala_animal", label: "Animal" },
] as const;

type EscalaKey = (typeof escalaAttrs)[number]["key"];
type EscalaState = Record<EscalaKey, number>;

const emptyEscala: EscalaState = escalaAttrs.reduce(
  (acc, a) => ({ ...acc, [a.key]: 5 }),
  {} as EscalaState,
);

const empty: FormState = {
  numero_amostra: "",
  origem_botanica: "",
  visual_estado_fisico: "",
  visual_aspecto: "",
  visual_cor: "",
  odor_intensidade: "",
  odor_descricao: "",
  sabor_intensidade: "",
  sabor_descricao: "",
  sabor_persistencia: "",
  gosto_doce: "",
  gosto_acido: "",
  gosto_salgado: "",
  gosto_amargo: "",
  gosto_outros: "",
  textura_viscosidade: "",
  textura_cristais: "",
  notas_extras: "",
};

const sugestoes: Partial<Record<keyof FormState, string[]>> = {
  visual_estado_fisico: ["líquido", "cristalizado", "parcialmente cristalizado"],
  visual_aspecto: [
    "límpido",
    "turvo",
    "homogêneo",
    "não homogêneo",
    "cristalização irregular",
    "manchas brancas (marmorizado)",
    "separação de fases",
    "camadas",
    "bolhas de ar",
    "espuma",
    "impurezas",
  ],
  visual_cor: [
    "muito claro",
    "claro",
    "médio-claro",
    "médio",
    "médio-escuro",
    "escuro",
    "muito escuro",
    "quase incolor",
    "palha",
    "amarelo-claro",
    "âmbar",
    "âmbar-escuro",
    "muito âmbar-escuro",
    "quase preto",
    "branco",
    "marfim",
    "bege-claro",
    "bege",
    "bege-escuro",
    "avelã",
    "marrom",
    "tonalidade normal de mel",
    "amarelo-vivo",
    "esbranquiçado",
    "acinzentado",
    "amarelo",
    "avermelhado",
    "alaranjado",
    "opaco",
    "brilhante",
    "fluorescência verde",
  ],
  odor_intensidade: ["fraco", "médio", "forte"],
  odor_descricao: [
    "floral",
    "frutado",
    "cítrico",
    "vegetal",
    "herbáceo",
    "amadeirado",
    "balsâmico",
    "resinoso",
    "mentolado",
    "caramelo",
    "baunilha",
    "mel cozido",
    "fermentado",
    "químico",
    "animal",
    "cera",
  ],
  sabor_intensidade: ["fraca", "média", "forte"],
  sabor_descricao: [
    "ausente",
    "fraco",
    "médio",
    "forte",
    "floral",
    "frutado",
    "cítrico",
    "caramelo",
    "baunilha",
    "amadeirado",
    "herbáceo",
    "mentolado",
    "balsâmico",
  ],
  sabor_persistencia: ["ausente", "curta", "média", "longa"],
  gosto_doce: ["fraca", "média", "forte"],
  gosto_acido: ["ausente", "fraca", "média", "forte"],
  gosto_salgado: ["ausente", "presente"],
  gosto_amargo: ["ausente", "fraco", "médio", "forte"],
  gosto_outros: [
    "adstringente",
    "refrescante",
    "picante (ardido)",
    "metálico",
    "tânico",
  ],
  textura_viscosidade: [
    "fluido",
    "viscosidade normal",
    "viscoso",
    "mole",
    "pastoso",
    "firme",
  ],
  textura_cristais: [
    "muito fino",
    "fino",
    "médio",
    "grande",
    "muito grande",
    "esférico",
    "angular",
    "solúvel",
    "insolúvel",
    "duro",
    "arenoso",
    "aglomerado",
  ],
  notas_extras: [],
};

function listId(key: string) {
  return `sug-${key}`;
}

function Suggestions({ field }: { field: keyof FormState }) {
  const opts = sugestoes[field];
  if (!opts || opts.length === 0) return null;
  return (
    <datalist id={listId(field)}>
      {opts.map((o) => (
        <option key={o} value={o} />
      ))}
    </datalist>
  );
}

function Index() {
  const [form, setForm] = useState<FormState>(empty);
  const [escala, setEscala] = useState<EscalaState>(emptyEscala);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.numero_amostra.trim()) {
      toast.error("Informe o número da amostra.");
      return;
    }
    if (!form.origem_botanica.trim()) {
      toast.error("Informe a origem botânica.");
      return;
    }
    setSaving(true);
    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v.trim() === "" ? null : v.trim()]),
    ) as Record<string, string | number | null>;
    payload.origem_botanica = form.origem_botanica.trim();
    for (const a of escalaAttrs) {
      payload[a.key] = escala[a.key];
    }

    const { error } = await supabase
      .from("honey_samples")
      .insert(payload as never);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar a amostra.", { description: error.message });
      return;
    }
    toast.success("Amostra cadastrada com sucesso!");
    setForm(empty);
    setEscala(emptyEscala);
  }

  const radarData = escalaAttrs.map((a) => ({
    atributo: a.label,
    valor: escala[a.key],
  }));

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-primary">
                Análise Sensorial
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Ficha de Mel de Origem Única
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Descreva a amostra usando suas próprias percepções sensoriais ou atributos da
                roda de odores/aromas.
              </p>
            </div>
            <Link
              to="/consulta"
              className="shrink-0 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Consultar amostras
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <form onSubmit={onSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Número da amostra</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                required
                value={form.numero_amostra}
                onChange={(e) => set("numero_amostra", e.target.value)}
                placeholder="Ex.: 001, AM-2026-01…"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Origem botânica</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                required
                value={form.origem_botanica}
                onChange={(e) => set("origem_botanica", e.target.value)}
                placeholder="Ex.: Eucalipto, Laranjeira, Silvestre…"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="italic font-medium">Visual</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Estado físico">
                <Input list={listId("visual_estado_fisico")} value={form.visual_estado_fisico} onChange={(e) => set("visual_estado_fisico", e.target.value)} />
                <Suggestions field="visual_estado_fisico" />
              </Field>
              <Field label="Aspecto">
                <Input list={listId("visual_aspecto")} value={form.visual_aspecto} onChange={(e) => set("visual_aspecto", e.target.value)} />
                <Suggestions field="visual_aspecto" />
              </Field>
              <Field label="Cor" className="sm:col-span-2">
                <Input list={listId("visual_cor")} value={form.visual_cor} onChange={(e) => set("visual_cor", e.target.value)} />
                <Suggestions field="visual_cor" />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="italic font-medium">Odor</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Intensidade">
                <Input list={listId("odor_intensidade")} value={form.odor_intensidade} onChange={(e) => set("odor_intensidade", e.target.value)} />
                <Suggestions field="odor_intensidade" />
              </Field>
              <Field label="Descrição">
                <Input list={listId("odor_descricao")} value={form.odor_descricao} onChange={(e) => set("odor_descricao", e.target.value)} placeholder="Referências pessoais ou roda de odores/aromas" />
                <Suggestions field="odor_descricao" />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="italic font-medium">Sabor e Aroma</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Intensidade">
                <Input list={listId("sabor_intensidade")} value={form.sabor_intensidade} onChange={(e) => set("sabor_intensidade", e.target.value)} />
                <Suggestions field="sabor_intensidade" />
              </Field>
              <Field label="Descrição">
                <Input list={listId("sabor_descricao")} value={form.sabor_descricao} onChange={(e) => set("sabor_descricao", e.target.value)} placeholder="Sabor e retrogosto + referências" />
                <Suggestions field="sabor_descricao" />
              </Field>
              <Field label="Persistência / Retrogosto" className="sm:col-span-2">
                <Input list={listId("sabor_persistencia")} value={form.sabor_persistencia} onChange={(e) => set("sabor_persistencia", e.target.value)} />
                <Suggestions field="sabor_persistencia" />
              </Field>

              <div className="sm:col-span-2">
                <p className="mb-3 text-sm font-medium text-foreground">Gosto básico</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Doce">
                    <Input list={listId("gosto_doce")} value={form.gosto_doce} onChange={(e) => set("gosto_doce", e.target.value)} />
                    <Suggestions field="gosto_doce" />
                  </Field>
                  <Field label="Ácido">
                    <Input list={listId("gosto_acido")} value={form.gosto_acido} onChange={(e) => set("gosto_acido", e.target.value)} />
                    <Suggestions field="gosto_acido" />
                  </Field>
                  <Field label="Salgado">
                    <Input list={listId("gosto_salgado")} value={form.gosto_salgado} onChange={(e) => set("gosto_salgado", e.target.value)} />
                    <Suggestions field="gosto_salgado" />
                  </Field>
                  <Field label="Amargo">
                    <Input list={listId("gosto_amargo")} value={form.gosto_amargo} onChange={(e) => set("gosto_amargo", e.target.value)} />
                    <Suggestions field="gosto_amargo" />
                  </Field>
                </div>
              </div>

              <Field label="Outros (tânico, metálico, refrescante…)" className="sm:col-span-2">
                <Input list={listId("gosto_outros")} value={form.gosto_outros} onChange={(e) => set("gosto_outros", e.target.value)} />
                <Suggestions field="gosto_outros" />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="italic font-medium">
                Textura{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  (relacionada à amostra, não à origem botânica)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Viscosidade / Consistência">
                <Input list={listId("textura_viscosidade")} value={form.textura_viscosidade} onChange={(e) => set("textura_viscosidade", e.target.value)} />
                <Suggestions field="textura_viscosidade" />
              </Field>
              <Field label="Cristais (forma, tamanho, solubilidade…)">
                <Input list={listId("textura_cristais")} value={form.textura_cristais} onChange={(e) => set("textura_cristais", e.target.value)} />
                <Suggestions field="textura_cristais" />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="italic font-medium">Notas extras</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea rows={4} value={form.notas_extras} onChange={(e) => set("notas_extras", e.target.value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Escala de Intensidade Sensorial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Atribua uma nota de 1 a 10 para cada atributo sensorial percebido na
                amostra. Os valores informados serão utilizados para gerar
                automaticamente o perfil sensorial do mel no gráfico de radar.
              </p>

              <div className="space-y-5">
                {escalaAttrs.map((a) => (
                  <div key={a.key} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-4 sm:grid-cols-[9rem_1fr_2.5rem]">
                    <Label className="text-sm font-medium text-foreground">{a.label}</Label>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[escala[a.key]]}
                      onValueChange={(v) =>
                        setEscala((s) => ({ ...s, [a.key]: v[0] }))
                      }
                    />
                    <span className="text-right text-sm font-semibold tabular-nums text-primary">
                      {escala[a.key]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border bg-card/40 p-4">
                <h3 className="text-center text-base font-semibold text-foreground">
                  Perfil Sensorial do Mel
                </h3>
                <div className="h-[380px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="75%">
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis
                        dataKey="atributo"
                        tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 10]}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      />
                      <Radar
                        name="Intensidade sensorial"
                        dataKey="valor"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.45}
                      />
                      <Tooltip />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm(empty);
                setEscala(emptyEscala);
              }}
              disabled={saving}
            >
              Limpar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando…" : "Salvar amostra"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"space-y-1.5 " + (className ?? "")}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
