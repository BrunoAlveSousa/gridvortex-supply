import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  // eslint-disable-next-line no-console
  console.error(
    "Supabase env vars ausentes. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY."
  );
}

// All Supply tables live in the default "public" schema, prefixed with
// "supply_" (see /db/001_schema.sql), so no custom schema config is needed.
export const supabase = createClient(url, key);
