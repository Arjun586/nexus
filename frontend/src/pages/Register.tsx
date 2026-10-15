import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { register } from "../api/auth";
import AmbientVectors from "../components/brand/AmbientVectors";
import NexusMark from "../components/brand/NexusMark";
import Button from "../components/ui/Button";
import Toast from "../components/ui/Toast";
import type { RegisterInput } from "../types/auth";
import { parseApiError } from "../utils/parse-api-error";

type RegisterFields = keyof RegisterInput;
type FieldErrors = Partial<Record<RegisterFields, string>>;

const initialForm: RegisterInput = {
  name: "",
  email: "",
  password: "",
};

const validateForm = (form: RegisterInput): FieldErrors => {
  const errors: FieldErrors = {};

  if (!form.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  }

  if (!form.password) {
    errors.password = "Password is required.";
  }

  return errors;
};

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterInput>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (field: RegisterFields, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));

    if (fieldErrors[field]) {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }

    if (apiError) {
      setApiError(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const clientErrors = validateForm(form);

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setApiError(null);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setApiError(null);

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      navigate("/login", { state: { registered: true } });
    } catch (error) {
      const { message, fieldErrors: serverFieldErrors } = parseApiError(error);

      setApiError(message);
      setFieldErrors(serverFieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full h-screen h-[100dvh] max-h-screen flex flex-col justify-center items-center px-4 py-2 bg-background selection:bg-primary selection:text-on-primary relative overflow-hidden">
      <div className="flex flex-col w-full h-full max-h-screen relative items-center justify-center">
        {/* Ambient floating geometric vectors */}
        <AmbientVectors />

        {/* STATIONARY AUTHENTICATION CARD */}
        <div className="relative z-10 w-full max-w-[420px] transition-none my-auto">
          <div className="bg-surface-container-lowest rounded-xl p-5 sm:p-7 shadow-[0_8px_32px_-8px_rgba(25,27,34,0.06),0_1px_3px_0_rgba(25,27,34,0.04)] outline outline-1 outline-surface-container-highest">
            {/* Card Brand Block */}
            <div className="flex flex-col items-center justify-center text-center">
              {/* Nexus Geometric Mark */}
              <div className="w-8 h-8 flex items-center justify-center text-primary mb-1.5">
                <NexusMark size={32} />
              </div>

              {/* Wordmark */}
              <span className="font-headline-sm text-sm tracking-tight text-on-surface lowercase leading-none mb-2">
                nexus
              </span>

              {/* Heading */}
              <h1 className="font-display-editorial text-xl sm:text-[24px] leading-tight text-on-surface font-normal tracking-tight mb-1">
                Create your account
              </h1>

              {/* Supporting text */}
              <p className="font-body-sm text-xs text-secondary leading-normal max-w-[320px]">
                Join your team on collaborative boards and infinite whiteboards
              </p>
            </div>

            {apiError ? <Toast variant="error" message={apiError} className="mt-2" /> : null}

            {/* Form */}
            <form className="mt-4 flex flex-col space-y-2.5" onSubmit={handleSubmit} noValidate>
              {/* Name Field */}
              <div className="flex flex-col space-y-1 text-left">
                <label
                  className="font-label-md text-xs text-on-surface font-medium"
                  htmlFor="full-name"
                >
                  Full name
                </label>
                <div className="relative">
                  <input
                    id="full-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Alex Chen"
                    required
                    disabled={isSubmitting}
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    className={`w-full h-10 rounded-lg bg-surface-container-lowest px-3.5 text-on-surface text-body-sm font-body-sm placeholder:text-outline-variant outline outline-1 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest ${
                      fieldErrors.name
                        ? "outline-error ring-1 ring-error"
                        : "outline-surface-container-highest"
                    }`}
                  />
                </div>
                {fieldErrors.name ? (
                  <p className="mt-0.5 font-body-sm text-[11px] font-medium text-error" role="alert">
                    {fieldErrors.name}
                  </p>
                ) : null}
              </div>

              {/* Email Field */}
              <div className="flex flex-col space-y-1 text-left">
                <label
                  className="font-label-md text-xs text-on-surface font-medium"
                  htmlFor="work-email"
                >
                  Work email
                </label>
                <div className="relative">
                  <input
                    id="work-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    required
                    disabled={isSubmitting}
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className={`w-full h-10 rounded-lg bg-surface-container-lowest px-3.5 text-on-surface text-body-sm font-body-sm placeholder:text-outline-variant outline outline-1 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest ${
                      fieldErrors.email
                        ? "outline-error ring-1 ring-error"
                        : "outline-surface-container-highest"
                    }`}
                  />
                </div>
                {fieldErrors.email ? (
                  <p className="mt-0.5 font-body-sm text-[11px] font-medium text-error" role="alert">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              {/* Password Field */}
              <div className="flex flex-col space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <label
                    className="font-label-md text-xs text-on-surface font-medium"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <Link
                    to="/login"
                    className="font-body-sm text-xs text-primary hover:underline hover:text-primary-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
                  >
                    Already registered?
                  </Link>
                </div>

                <div className="relative flex items-center">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••••••"
                    required
                    disabled={isSubmitting}
                    value={form.password}
                    onChange={(event) => updateField("password", event.target.value)}
                    className={`w-full h-10 rounded-lg bg-surface-container-lowest pl-3.5 pr-10 text-on-surface text-body-sm font-body-sm placeholder:text-outline-variant outline outline-1 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest ${
                      fieldErrors.password
                        ? "outline-error ring-1 ring-error"
                        : "outline-surface-container-highest"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label="Toggle password visibility"
                    className="absolute right-3 text-secondary hover:text-on-surface transition-colors p-1 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {fieldErrors.password ? (
                  <p className="mt-0.5 font-body-sm text-[11px] font-medium text-error" role="alert">
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              {/* Primary Action Button */}
              <div className="pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  className="w-full h-10.5 rounded-lg font-label-md text-label-md font-medium tracking-tight"
                  rightIcon={
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  }
                >
                  Create Account
                </Button>
              </div>
            </form>

            {/* Bottom editorial divider detail */}
            <div className="mt-4 pt-3 flex items-center justify-center gap-2 border-t border-surface-container-high/60">
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
              <span className="font-code-sm text-[11px] text-secondary">
                nexus strategic workspace
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;
