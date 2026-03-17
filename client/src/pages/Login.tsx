import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate("/");
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "oklch(0.97 0.012 75)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-sm"
        style={{ backgroundColor: "white", border: "1px solid oklch(0.88 0.02 60)" }}
      >
        <h1 className="font-display text-2xl font-semibold mb-2" style={{ color: "oklch(0.28 0.04 40)" }}>
          Acesso privado ativo
        </h1>
        <p className="text-sm" style={{ color: "oklch(0.55 0.03 40)" }}>
          O login foi desativado temporariamente. Redirecionando para o painel.
        </p>
      </div>
    </div>
  );
}
