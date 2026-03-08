
DROP POLICY "Allow public insert" ON public.sensor_data;
DROP POLICY "Allow public select" ON public.sensor_data;

CREATE POLICY "Allow public insert" ON public.sensor_data FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public select" ON public.sensor_data FOR SELECT TO anon, authenticated USING (true);
