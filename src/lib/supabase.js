// src/lib/supabase.js - VERSIÓN LIMPIA
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("❌ Faltan variables de entorno de Supabase");
  console.error("URL:", url ? "✅ Configurada" : "❌ Faltante");
  console.error("Key:", key ? "✅ Configurada" : "❌ Faltante");
}

export const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Test de conexión simple
console.log("🔄 Supabase inicializado");
