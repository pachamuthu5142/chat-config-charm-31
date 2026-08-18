// Persistence for the single shared widget configuration draft.
import { supabase } from "@/integrations/supabase/client";

export const CONFIG_ID = "default";

/** Everything the configurator collects and stores. */
export type StoredWidgetConfig = {
  template: string;
  variant: string;
  appearance: string;
  theme: string;
  background: string;
  position: string;
  greeting: string;
  launcher_style: string;
  launcher_text: string;
  attach_on: boolean;
  voice_on: boolean;
  contact_on: boolean;
  faq_on: boolean;
  custom_links_on: boolean;
  entities_on: boolean;
  contacts: unknown[];
  faq_items: unknown[];
  link_items: unknown[];
  entities: unknown[];
  site_urls: string;
  platform: string;
};

export async function loadWidgetConfig(): Promise<StoredWidgetConfig | null> {
  const { data, error } = await supabase
    .from("widget_configs")
    .select("*")
    .eq("id", CONFIG_ID)
    .maybeSingle();
  if (error) {
    console.error("Failed to load widget config", error);
    return null;
  }
  return (data as StoredWidgetConfig | null) ?? null;
}

export async function saveWidgetConfig(cfg: StoredWidgetConfig): Promise<boolean> {
  const { error } = await supabase
    .from("widget_configs")
    .upsert({ id: CONFIG_ID, ...cfg } as never);
  if (error) {
    console.error("Failed to save widget config", error);
    return false;
  }
  return true;
}
