import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export default function AuthForm({ mode, onSubmit, error, onClearError, busy }) {
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const isRegister = mode === "register";

  const update = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
    if (error) onClearError();
  };

  const submit = async (event) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <form className="mt-8 space-y-5" onSubmit={submit}>
      {isRegister && (
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-ink">Your name</span>
          <input
            className="field"
            autoComplete="name"
            maxLength={50}
            name="name"
            onChange={update}
            placeholder="Alex Morgan"
            required
            value={values.name}
          />
        </label>
      )}
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-ink">Email address</span>
        <input
          className="field"
          autoComplete="email"
          name="email"
          onChange={update}
          placeholder="you@example.com"
          required
          type="email"
          value={values.email}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-[13px] font-medium text-ink">Password</span>
        <span className="relative block">
          <input
            className="field pr-12"
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={isRegister ? 8 : undefined}
            name="password"
            onChange={update}
            placeholder={isRegister ? "At least 8 characters" : "Enter your password"}
            required
            type={showPassword ? "text" : "password"}
            value={values.password}
          />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center text-ink-faint transition hover:text-ink"
            onClick={() => setShowPassword((visible) => !visible)}
            type="button"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </span>
        {isRegister && <span className="mt-2 block text-[11px] text-ink-faint">Use at least 8 characters, including a letter and a number.</span>}
      </label>

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-3 text-[13px] text-red-600 dark:text-red-300" role="alert">
          {error}
        </p>
      )}

      <button className="primary-button group" disabled={busy} type="submit">
        <span>{busy ? "One moment..." : isRegister ? "Create your account" : "Sign in"}</span>
        {!busy && <ArrowRight className="transition-transform group-hover:translate-x-1" size={17} />}
      </button>
    </form>
  );
}
