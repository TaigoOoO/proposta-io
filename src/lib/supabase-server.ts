import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Cliente Supabase para uso em Server Components, Route Handlers e Server Actions.
 * Lê/escreve a sessão através dos cookies da requisição.
 *
 * IMPORTANTE: `cookies()` deve ser aguardado — por isso esta função é async.
 * Todo chamador precisa usar `await criarClienteSupabaseServidor()`.
 */
export async function criarClienteSupabaseServidor() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Chamado a partir de um Server Component: o middleware cuida do refresh.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Chamado a partir de um Server Component: o middleware cuida do refresh.
          }
        }
      }
    }
  );
}

/**
 * Cliente Supabase com a Service Role Key, para uso exclusivo em Route Handlers
 * que precisam de acesso administrativo. Nunca importar este arquivo em código
 * que roda no navegador. Permanece síncrono — não depende de cookies().
 */
export function criarClienteSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
