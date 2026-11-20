import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import AuthForm from "../components/AuthForm.jsx";
import AuthLayout from "../components/AuthLayout.jsx";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const { login, register, error, clearError } = useAuth();
  const isRegister = mode === "register";

  const submit = async (values) => {
    setBusy(true);
    try {
      if (isRegister) await register(values);
      else await login({ email: values.email, password: values.password });
    } catch {
      // The error is already available in Redux for the form.
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (nextMode) => {
    clearError();
    setMode(nextMode);
  };

  return (
    <AuthLayout>
      <div className="auth-mode-enter" key={mode}>
        <div className="mb-8">
          <p className="mb-3 text-[14px] font-semibold uppercase tracking-[0.16em] text-jules">
            {isRegister ? "A good place to begin" : "Welcome back"}
          </p>
          <h2 className="font-display text-[36px] font-medium leading-tight tracking-[-0.04em] text-ink">
            {isRegister ? "Create your account" : "Sign in to Jules"}
          </h2>
          <p className="mt-2 text-[16px] leading-6 text-ink-muted">
            {isRegister ? "Start with a little space of your own." : "Your space is right where you left it."}
          </p>
        </div>

        <AuthForm
          busy={busy}
          error={error}
          mode={mode}
          onClearError={clearError}
          onSubmit={submit}
        />

        <p className="mt-7 text-center text-[15px] text-ink-muted">
          {isRegister ? "Already have an account?" : "New to Jules?"}{" "}
          <button
            className="font-semibold text-jules transition hover:text-jules-dark"
            onClick={() => switchMode(isRegister ? "login" : "register")}
            type="button"
          >
            {isRegister ? "Sign in" : "Create an account"}
          </button>
        </p>
        <p className="mt-8 text-center text-[13px] leading-5 text-ink-faint">
          By continuing, you agree to keep this a kind and thoughtful space.
        </p>
      </div>
    </AuthLayout>
  );
}
