ALTER TABLE public.honey_samples
  ADD COLUMN IF NOT EXISTS escala_umami smallint,
  ADD COLUMN IF NOT EXISTS escala_amadeirado smallint,
  ADD COLUMN IF NOT EXISTS escala_alterado smallint;