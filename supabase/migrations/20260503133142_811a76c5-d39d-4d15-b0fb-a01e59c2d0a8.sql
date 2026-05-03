CREATE TABLE public.honey_samples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  origem_botanica TEXT NOT NULL,
  visual_estado_fisico TEXT,
  visual_aspecto TEXT,
  visual_cor TEXT,
  odor_intensidade TEXT,
  odor_descricao TEXT,
  sabor_intensidade TEXT,
  sabor_descricao TEXT,
  sabor_persistencia TEXT,
  gosto_doce TEXT,
  gosto_acido TEXT,
  gosto_salgado TEXT,
  gosto_amargo TEXT,
  gosto_outros TEXT,
  textura_viscosidade TEXT,
  textura_cristais TEXT,
  notas_extras TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.honey_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view honey samples"
  ON public.honey_samples FOR SELECT
  USING (true);

CREATE POLICY "Public can insert honey samples"
  ON public.honey_samples FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update honey samples"
  ON public.honey_samples FOR UPDATE
  USING (true);

CREATE POLICY "Public can delete honey samples"
  ON public.honey_samples FOR DELETE
  USING (true);