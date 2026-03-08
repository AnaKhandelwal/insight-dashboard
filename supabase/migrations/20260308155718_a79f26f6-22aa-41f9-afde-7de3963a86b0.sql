CREATE TABLE public.sensor_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  light INTEGER NOT NULL,
  distance INTEGER NOT NULL,
  motion BOOLEAN NOT NULL DEFAULT false,
  sound INTEGER NOT NULL,
  gesture TEXT NOT NULL DEFAULT 'NONE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.sensor_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.sensor_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON public.sensor_data FOR SELECT USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_data;