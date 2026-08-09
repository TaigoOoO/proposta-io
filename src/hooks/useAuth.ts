"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { criarClienteSupabase } from "@/lib/supabase";

interface EstadoAuth {
  usuario: User | null;
  carregando: boolean;
}

/**
 * Hook client-side que expõe o usuário autenticado e mantém o estado
 * sincronizado com mudanças de sessão (login, logout, refresh de token).
 */
export function useAuth(): EstadoAuth {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const supabase = criarClienteSupabase();

    supabase.auth.getUser().then(({ data }) => {
      setUsuario(data.user);
      setCarregando(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      setUsuario(sessao?.user ?? null);
      setCarregando(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { usuario, carregando };
}
