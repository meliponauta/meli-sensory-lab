import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
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

export const Route = createFileRoute("/consulta")({
  component: Consulta,
  validateSearch: z.object({ numero: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Consulta de Amostras — Análise Sensorial de Mel" },
      {
        name: "description",
        content:
          "Consulte amostras de mel cadastradas na análise sensorial pelo número da amostra.",
      },
    ],
  }),
});

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

const camposTexto: { key: string; label: string; section: string }[] = [
  { key: "numero_amostra", label: "Número da amostra", section: "Identificação" },
  { key: "origem_botanica", label: "Origem botânica", section: "Identificação" },
  { key: "visual_estado_fisico", label: "Estado físico", section: "Visual" },
  { key: "visual_aspecto", label: "Aspecto", section: "Visual" },
  { key: "visual_cor", label: "Cor", section: "Visual" },
  { key: "odor_intensidade", label: "Intensidade", section: "Odor" },
  { key: "odor_descricao", label: "Descrição", section: "Odor" },
  { key: "sabor_intensidade", label: "Intensidade", section: "Sabor e Aroma" },
  { key: "sabor_descricao", label: "Descrição", section: "Sabor e Aroma" },
  { key: "sabor_persistencia", label: "Persistência / Retrogosto", section: "Sabor e Aroma" },
  { key: "gosto_doce", label: "Doce", section: "Gosto básico" },
  { key: "gosto_acido", label: "Ácido", section: "Gosto básico" },
  { key: "gosto_salgado", label: "Salgado", section: "Gosto básico" },
  { key: "gosto_amargo", label: "Amargo", section: "Gosto básico" },
  { key: "gosto_outros", label: "Outros", section: "Gosto básico" },
  { key: "textura_viscosidade", label: "Viscosidade / Consistência", section: "Textura" },
  { key: "textura_cristais", label: "Cristais", section: "Textura" },
  { key: "notas_extras", label: "Notas extras", section: "Notas extras" },
];

type Sample = Record<string, string | number | null>;

function Consulta() {
  const { numero: numeroQS } = Route.useSearch();
  const [numero, setNumero] = useState(numeroQS ?? "");
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<Sample[] | null>(null);

  async function executarBusca(valor: string, silencioso = false) {
    if (!valor.trim()) {
      toast.error("Informe o número da amostra.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("honey_samples")
      .select("*")
      .eq("numero_amostra", valor.trim())
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error("Erro ao consultar.", { description: error.message });
      return;
    }
    setResultados((data ?? []) as Sample[]);
    if ((!data || data.length === 0) && !silencioso) {
      toast.message("Nenhuma amostra encontrada com esse número.");
    }
  }

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    await executarBusca(numero);
  }

  useEffect(() => {
    if (numeroQS && numeroQS.trim()) {
      void executarBusca(numeroQS, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numeroQS]);

  // Agrupar campos de texto por seção
  const sections = Array.from(new Set(camposTexto.map((c) => c.section)));

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
                Consulta de Amostras
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Informe o número da amostra para visualizar os dados sensoriais cadastrados.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Link
                to="/amostras"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Ver todas as amostras
              </Link>
              <Link
                to="/"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Nova amostra
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Buscar por número</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={buscar} className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Ex.: 001, AM-2026-01…"
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Buscando…" : "Buscar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {resultados && resultados.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma amostra encontrada para o número informado.
            </CardContent>
          </Card>
        )}

        {resultados &&
          resultados.map((sample) => {
            const radarData = escalaAttrs.map((a) => ({
              atributo: a.label,
              valor: typeof sample[a.key] === "number" ? (sample[a.key] as number) : 0,
            }));
            const dataCriacao = sample.created_at
              ? new Date(String(sample.created_at)).toLocaleString("pt-BR")
              : "";

            return (
              <Card key={String(sample.id)}>
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-baseline justify-between gap-2">
                    <span>
                      Amostra #{String(sample.numero_amostra ?? "—")}
                    </span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {dataCriacao}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {sections.map((section) => {
                    const campos = camposTexto.filter((c) => c.section === section);
                    const temConteudo = campos.some(
                      (c) => sample[c.key] !== null && sample[c.key] !== "",
                    );
                    if (!temConteudo) return null;
                    return (
                      <div key={section}>
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
                          {section}
                        </h3>
                        <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                          {campos.map((c) => {
                            const v = sample[c.key];
                            if (v === null || v === "") return null;
                            return (
                              <div key={c.key}>
                                <dt className="text-xs text-muted-foreground">{c.label}</dt>
                                <dd className="text-sm text-foreground">{String(v)}</dd>
                              </div>
                            );
                          })}
                        </dl>
                      </div>
                    );
                  })}

                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
                      Escala de Intensidade Sensorial
                    </h3>
                    <div className="grid gap-1 sm:grid-cols-2">
                      {escalaAttrs.map((a) => (
                        <div
                          key={a.key}
                          className="flex items-center justify-between border-b border-border/40 py-1"
                        >
                          <Label className="text-sm text-foreground">{a.label}</Label>
                          <span className="text-sm font-semibold tabular-nums text-primary">
                            {sample[a.key] ?? "—"}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-lg border bg-card/40 p-4">
                      <h4 className="text-center text-base font-semibold text-foreground">
                        Perfil Sensorial do Mel
                      </h4>
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
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </main>
    </div>
  );
}
