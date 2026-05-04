import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/amostras")({
  component: ListaAmostras,
  head: () => ({
    meta: [
      { title: "Lista de Amostras — Análise Sensorial de Mel" },
      {
        name: "description",
        content: "Lista completa de amostras de mel cadastradas, ordenadas por número.",
      },
    ],
  }),
});

type Item = {
  id: string;
  numero_amostra: string | null;
  origem_botanica: string;
  created_at: string;
};

function ListaAmostras() {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("honey_samples")
        .select("id, numero_amostra, origem_botanica, created_at");
      if (error) {
        toast.error("Erro ao carregar amostras.", { description: error.message });
        setItems([]);
        return;
      }
      const collator = new Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" });
      const sorted = [...(data ?? [])].sort((a, b) =>
        collator.compare(String(a.numero_amostra ?? ""), String(b.numero_amostra ?? "")),
      );
      setItems(sorted as Item[]);
    })();
  }, []);

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
                Lista de Amostras
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Todas as amostras cadastradas, ordenadas por número.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Link
                to="/consulta"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Buscar por número
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

      <main className="mx-auto max-w-3xl px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>
              Amostras{items ? ` (${items.length})` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {items === null && (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            )}
            {items && items.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma amostra cadastrada ainda.
              </p>
            )}
            {items && items.length > 0 && (
              <ul className="divide-y divide-border">
                {items.map((it) => (
                  <li key={it.id}>
                    <Link
                      to="/consulta"
                      search={{ numero: it.numero_amostra ?? "" }}
                      className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-accent/40"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">
                          #{it.numero_amostra ?? "—"}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {it.origem_botanica}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {new Date(it.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
