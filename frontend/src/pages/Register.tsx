import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { register } from "../api/auth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
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
    <main className="relative flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-gray-900 text-white text-xs font-bold">
            N
          </div>
          <span className="text-base font-bold tracking-tight text-gray-900">Nexus</span>
        </div>

        <h1 className="text-xl font-bold text-gray-900">Create account</h1>
        <p className="mt-1 text-xs text-gray-600">
          Register to start building on your infinite collaborative whiteboard.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          {apiError ? <Toast variant="error" message={apiError} /> : null}

          <Input
            label="Name"
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            error={fieldErrors.name}
            disabled={isSubmitting}
          />

          <Input
            label="Email"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            error={fieldErrors.email}
            disabled={isSubmitting}
          />

          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            error={fieldErrors.password}
            disabled={isSubmitting}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            className="w-full mt-2"
          >
            Register
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-gray-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
