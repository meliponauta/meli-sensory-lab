import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

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

const empty: FormState = {
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

function Index() {
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.origem_botanica.trim()) {
      toast.error("Informe a origem botânica.");
      return;
    }
    setSaving(true);
    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v.trim() === "" ? null : v.trim()]),
    ) as unknown as FormState;
    payload.origem_botanica = form.origem_botanica.trim();

    const { error } = await supabase.from("honey_samples").insert(payload);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar a amostra.", { description: error.message });
      return;
    }
    toast.success("Amostra cadastrada com sucesso!");
    setForm(empty);
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto max-w-3xl px-6 py-8">
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
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <form onSubmit={onSubmit} className="space-y-6">
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
                <Input value={form.visual_estado_fisico} onChange={(e) => set("visual_estado_fisico", e.target.value)} />
              </Field>
              <Field label="Aspecto">
                <Input value={form.visual_aspecto} onChange={(e) => set("visual_aspecto", e.target.value)} />
              </Field>
              <Field label="Cor" className="sm:col-span-2">
                <Input value={form.visual_cor} onChange={(e) => set("visual_cor", e.target.value)} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="italic font-medium">Odor</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Intensidade">
                <Input value={form.odor_intensidade} onChange={(e) => set("odor_intensidade", e.target.value)} />
              </Field>
              <Field label="Descrição">
                <Textarea rows={2} value={form.odor_descricao} onChange={(e) => set("odor_descricao", e.target.value)} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="italic font-medium">Sabor e Aroma</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Intensidade">
                <Input value={form.sabor_intensidade} onChange={(e) => set("sabor_intensidade", e.target.value)} />
              </Field>
              <Field label="Descrição">
                <Textarea rows={2} value={form.sabor_descricao} onChange={(e) => set("sabor_descricao", e.target.value)} />
              </Field>
              <Field label="Persistência / Retrogosto" className="sm:col-span-2">
                <Input value={form.sabor_persistencia} onChange={(e) => set("sabor_persistencia", e.target.value)} />
              </Field>

              <div className="sm:col-span-2">
                <p className="mb-3 text-sm font-medium text-foreground">Gosto básico</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Doce"><Input value={form.gosto_doce} onChange={(e) => set("gosto_doce", e.target.value)} /></Field>
                  <Field label="Ácido"><Input value={form.gosto_acido} onChange={(e) => set("gosto_acido", e.target.value)} /></Field>
                  <Field label="Salgado"><Input value={form.gosto_salgado} onChange={(e) => set("gosto_salgado", e.target.value)} /></Field>
                  <Field label="Amargo"><Input value={form.gosto_amargo} onChange={(e) => set("gosto_amargo", e.target.value)} /></Field>
                </div>
              </div>

              <Field label="Outros (tânico, metálico, refrescante…)" className="sm:col-span-2">
                <Input value={form.gosto_outros} onChange={(e) => set("gosto_outros", e.target.value)} />
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
                <Textarea rows={2} value={form.textura_viscosidade} onChange={(e) => set("textura_viscosidade", e.target.value)} />
              </Field>
              <Field label="Cristais (forma, tamanho, solubilidade…)">
                <Textarea rows={2} value={form.textura_cristais} onChange={(e) => set("textura_cristais", e.target.value)} />
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

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setForm(empty)} disabled={saving}>
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
