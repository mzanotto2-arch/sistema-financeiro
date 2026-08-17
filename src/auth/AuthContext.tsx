import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { Session } from "@supabase/supabase-js";

import { supabase } from "../database/supabase";

type AuthContextType = {
  session: Session | null;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  criarConta: (
    email: string,
    password: string
  ) => Promise<void>;

  recuperarSenha: (
    email: string
  ) => Promise<void>;

  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function login(
    email: string,
    password: string
  ) {
    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) throw error;
  }

  async function criarConta(
    email: string,
    password: string
  ) {
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
      });

    console.log(data);

    if (error) throw error;
  }

  async function recuperarSenha(
    email: string
  ) {
    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            `${window.location.origin}/redefinir-senha`,
        }
      );

    if (error) throw error;
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        login,
        criarConta,
        recuperarSenha,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}