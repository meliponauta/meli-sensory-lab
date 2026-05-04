ALTER TABLE public.honey_samples ADD COLUMN numero_amostra text;
CREATE INDEX IF NOT EXISTS idx_honey_samples_numero_amostra ON public.honey_samples (numero_amostra);