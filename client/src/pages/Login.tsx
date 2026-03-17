import { useAuth } from "@/_core/hooks/useAuth";
import { firebaseAuth } from "@/lib/firebase";
import {
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

type AuthMode = "login" | "register";

export default function Login() {
  const [, navigate] = useLocation();
  const { refresh, user, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    navigate("/");
  }, [authLoading, navigate, user]);

  const submit = async () => {
    setLoading(true);
    setError(null);

    try {
      let credentials: UserCredential;

      if (mode === "register") {
        credentials = await createUserWithEmailAndPassword(
          firebaseAuth,
          email,
          password
        );

        if (name.trim()) {
          await updateProfile(credentials.user, { displayName: name.trim() });
        }
      } else {
        credentials = await signInWithEmailAndPassword(
          firebaseAuth,
          email,
          password
        );
      }

      await credentials.user.getIdToken(true);
      await refresh().catch(() => null);
      navigate("/");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Falha na autenticacao";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "oklch(0.97 0.012 75)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-sm"
        style={{ backgroundColor: "white", border: "1px solid oklch(0.88 0.02 60)" }}
      >
        <h1
          className="font-display text-2xl font-semibold mb-1"
          style={{ color: "oklch(0.28 0.04 40)" }}
        >
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="text-sm mb-5" style={{ color: "oklch(0.55 0.03 40)" }}>
          Autenticacao via Firebase
        </p>

        <div className="space-y-3">
          {mode === "register" && (
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "oklch(0.88 0.02 60)" }}
            />
          )}

          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "oklch(0.88 0.02 60)" }}
          />

          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "oklch(0.88 0.02 60)" }}
          />

          {error && (
            <div
              className="rounded-lg px-3 py-2 text-sm"
              style={{ backgroundColor: "oklch(0.95 0.03 25)", color: "oklch(0.50 0.17 25)" }}
            >
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading || !email || !password || (mode === "register" && !name)}
            className="w-full rounded-lg py-2.5 text-sm font-medium disabled:opacity-60"
            style={{ backgroundColor: "oklch(0.45 0.07 20)", color: "white" }}
          >
            {loading ? "Processando..." : mode === "login" ? "Entrar" : "Cadastrar e entrar"}
          </button>

          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
            }}
            className="w-full rounded-lg py-2 text-sm"
            style={{ color: "oklch(0.45 0.07 20)" }}
          >
            {mode === "login" ? "Nao tem conta? Criar agora" : "Ja tem conta? Entrar"}
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full rounded-lg py-2 text-sm"
            style={{ color: "oklch(0.55 0.03 40)" }}
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
