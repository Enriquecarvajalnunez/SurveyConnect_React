import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "./supabase/info";

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export async function testConnection() {
  const { data, error } = await supabase.from("kv_store_b22bc260").select("*").limit(1);

  if (error) {
    console.error("❌ Error conectando a Supabase:", error);
  } else {
    console.log("✅ Supabase conectado correctamente:", data);
  }
}
