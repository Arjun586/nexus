import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { login } from "../api/auth";
import AmbientVectors from "../components/brand/AmbientVectors";
import NexusMark from "../components/brand/NexusMark";
import Button from "../components/ui/Button";
import Toast from "../components/ui/Toast";
import { setAccessToken } from "../session/access-token";
import { setUser } from "../session/user";
import type { LoginInput } from "../types/auth";
import { parseApiError } from "../utils/parse-api-error";

type LoginFields = keyof LoginInput;
type FieldErrors = Partial<Record<LoginFields, string>>;

const initialForm: LoginInput = {
  email: "",
  password: "",
};

const validateForm = (form: LoginInput): FieldErrors => {
  const errors: FieldErrors = {};

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  }

  if (!form.password) {
    errors.password = "Password is required.";
  }

  return errors;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState<LoginInput>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const registeredSuccess = Boolean((location.state as { registered?: boolean })?.registered);
  const [showRegisteredToast, setShowRegisteredToast] = useState(registeredSuccess);

  const updateField = (field: LoginFields, value: string) => {
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
      const response = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      setAccessToken(response.data.accessToken);
      setUser(response.data.user);
      navigate("/dashboard");
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
          <div className="bg-surface-container-lowest rounded-xl p-6 sm:p-8 shadow-[0_8px_32px_-8px_rgba(25,27,34,0.06),0_1px_3px_0_rgba(25,27,34,0.04)] outline outline-1 outline-surface-container-highest">
            {/* Card Brand Block */}
            <div className="flex flex-col items-center justify-center text-center">
              {/* Nexus Geometric Mark */}
              <div className="w-9 h-9 flex items-center justify-center text-primary mb-2">
                <NexusMark size={36} />
              </div>

              {/* Wordmark */}
              <span className="font-headline-sm text-base tracking-tight text-on-surface lowercase leading-none mb-3">
                nexus
              </span>

              {/* Heading */}
              <h1 className="font-display-editorial text-2xl sm:text-[26px] leading-tight text-on-surface font-normal tracking-tight mb-1.5">
                Sign in to your workspace
              </h1>

              {/* Supporting text */}
              <p className="font-body-sm text-xs text-secondary leading-normal max-w-[320px]">
                Enter your work email to access your collaborative boards and canvases
              </p>
            </div>

            {showRegisteredToast ? (
              <Toast
                variant="success"
                message="Account created successfully! Please sign in."
                onClose={() => setShowRegisteredToast(false)}
                autoDismiss={true}
                duration={5000}
                className="mt-3"
              />
            ) : null}

            {apiError ? <Toast variant="error" message={apiError} className="mt-3" /> : null}

            {/* Form */}
            <form className="mt-5 flex flex-col space-y-3.5" onSubmit={handleSubmit} noValidate>
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
                    className={`w-full h-10 sm:h-11 rounded-lg bg-surface-container-lowest px-3.5 text-on-surface text-body-sm font-body-sm placeholder:text-outline-variant outline outline-1 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest ${
                      fieldErrors.email
                        ? "outline-error ring-1 ring-error"
                        : "outline-surface-container-highest"
                    }`}
                  />
                </div>
                {fieldErrors.email ? (
                  <p className="mt-1 font-body-sm text-xs font-medium text-error" role="alert">
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
                    to="/register"
                    className="font-body-sm text-xs text-primary hover:underline hover:text-primary-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
                  >
                    Need an account?
                  </Link>
                </div>

                <div className="relative flex items-center">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    required
                    disabled={isSubmitting}
                    value={form.password}
                    onChange={(event) => updateField("password", event.target.value)}
                    className={`w-full h-10 sm:h-11 rounded-lg bg-surface-container-lowest pl-3.5 pr-10 text-on-surface text-body-sm font-body-sm placeholder:text-outline-variant outline outline-1 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest ${
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
                  <p className="mt-1 font-body-sm text-xs font-medium text-error" role="alert">
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
                  className="w-full h-11 rounded-lg font-label-md text-label-md font-medium tracking-tight"
                  rightIcon={
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  }
                >
                  Continue with Workspace
                </Button>
              </div>
            </form>

            {/* Bottom editorial divider detail */}
            <div className="mt-5 pt-4 flex items-center justify-center gap-2 border-t border-surface-container-high/60">
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

export default Login;
