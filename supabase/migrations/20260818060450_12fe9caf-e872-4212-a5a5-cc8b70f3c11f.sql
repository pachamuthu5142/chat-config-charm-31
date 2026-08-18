CREATE TABLE public.widget_configs (
  id text PRIMARY KEY DEFAULT 'default',
  template text NOT NULL DEFAULT 'overview',
  variant text NOT NULL DEFAULT 'classic',
  appearance text NOT NULL DEFAULT 'light',
  theme text NOT NULL DEFAULT '#f05742',
  background text NOT NULL DEFAULT 'gradient',
  position text NOT NULL DEFAULT 'right',
  greeting text NOT NULL DEFAULT '',
  launcher_style text NOT NULL DEFAULT 'pill',
  launcher_text text NOT NULL DEFAULT 'Chat with us',
  attach_on boolean NOT NULL DEFAULT false,
  voice_on boolean NOT NULL DEFAULT false,
  contact_on boolean NOT NULL DEFAULT true,
  faq_on boolean NOT NULL DEFAULT true,
  custom_links_on boolean NOT NULL DEFAULT false,
  entities_on boolean NOT NULL DEFAULT true,
  contacts jsonb NOT NULL DEFAULT '[]'::jsonb,
  faq_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  link_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  entities jsonb NOT NULL DEFAULT '[]'::jsonb,
  site_urls text NOT NULL DEFAULT '',
  platform text NOT NULL DEFAULT 'Script Tag',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.widget_configs TO anon, authenticated;
GRANT ALL ON public.widget_configs TO service_role;

ALTER TABLE public.widget_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read the shared widget config"
  ON public.widget_configs FOR SELECT USING (true);
CREATE POLICY "Anyone can create the shared widget config"
  ON public.widget_configs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update the shared widget config"
  ON public.widget_configs FOR UPDATE USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_widget_configs_updated_at
BEFORE UPDATE ON public.widget_configs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.widget_configs (id) VALUES ('default');