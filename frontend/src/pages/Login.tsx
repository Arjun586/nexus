import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { login } from "../api/auth";
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
  const [form, setForm] = useState<LoginInput>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
        <p className="mt-2 text-sm text-gray-600">
          Log in to access the authentication sandbox.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          {apiError ? (
            <p
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {apiError}
            </p>
          ) : null}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
            {fieldErrors.email ? (
              <p id="email-error" className="mt-1 text-sm text-red-600">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password ? "password-error" : undefined
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
            {fieldErrors.password ? (
              <p id="password-error" className="mt-1 text-sm text-red-600">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-gray-900 underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
