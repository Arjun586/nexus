import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { logout } from "../api/auth";
import { clearSession } from "../session/restore-session";
import { getAccessToken } from "../session/access-token";
import { getUser } from "../session/user";
import { parseApiError } from "../utils/parse-api-error";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const isAuthenticated = Boolean(user && getAccessToken());
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setApiError(null);

    try {
      await logout();
      clearSession();
      navigate("/login");
    } catch (error) {
      const { message } = parseApiError(error);
      setApiError(message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Authentication sandbox — session validation only.
        </p>

        <dl className="mt-6 space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {isAuthenticated ? "Authenticated" : "Not authenticated"}
            </dd>
          </div>

          {user ? (
            <>
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 font-mono text-sm text-gray-900">
                  {user.id}
                </dd>
              </div>
            </>
          ) : null}
        </dl>

        {apiError ? (
          <p
            className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {apiError}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut || !isAuthenticated}
          className="mt-6 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </main>
  );
};

export default Dashboard;
