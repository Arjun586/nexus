import { useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { logout } from "../api/auth";
import { createWorkspace, getWorkspaces } from "../api/workspace";
import { clearSession } from "../session/restore-session";
import { getUser } from "../session/user";
import type { Workspace } from "../types/workspace";
import { parseApiError } from "../utils/parse-api-error";

const validateWorkspaceName = (name: string): string | undefined => {
  const trimmed = name.trim();

  if (!trimmed) {
    return "Name is required.";
  }

  if (trimmed.length > 100) {
    return "Name must be at most 100 characters.";
  }

  return undefined;
};

const AppLayout = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [workspacesError, setWorkspacesError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const loadWorkspaces = async () => {
    setIsLoadingWorkspaces(true);
    setWorkspacesError(null);

    try {
      const response = await getWorkspaces();
      setWorkspaces(response.data);
    } catch (error) {
      const { message } = parseApiError(error);
      setWorkspacesError(message);
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  useEffect(() => {
    void loadWorkspaces();
  }, []);

  const handleCreateWorkspace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateWorkspaceName(workspaceName);

    if (validationError) {
      setNameError(validationError);
      setCreateError(null);
      return;
    }

    setIsCreating(true);
    setNameError(null);
    setCreateError(null);

    try {
      const response = await createWorkspace({
        name: workspaceName.trim(),
      });

      setWorkspaceName("");
      setShowCreateForm(false);
      await loadWorkspaces();
      navigate(`/workspaces/${response.data.id}`);
    } catch (error) {
      const { message, fieldErrors } = parseApiError(error);
      setCreateError(message);
      setNameError(fieldErrors.name ?? null);
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await logout();
      clearSession();
      navigate("/login");
    } catch (error) {
      const { message } = parseApiError(error);
      setLogoutError(message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-5">
          <Link to="/dashboard" className="text-lg font-semibold text-gray-900">
            Nexus
          </Link>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-3 py-4">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Workspaces
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm((current) => !current);
                setNameError(null);
                setCreateError(null);
              }}
              className="rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white hover:bg-gray-800"
            >
              New Workspace
            </button>
          </div>

          {showCreateForm ? (
            <form
              className="mb-3 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3"
              onSubmit={handleCreateWorkspace}
              noValidate
            >
              {createError ? (
                <p
                  className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700"
                  role="alert"
                >
                  {createError}
                </p>
              ) : null}

              <div>
                <label htmlFor="sidebar-workspace-name" className="sr-only">
                  Workspace name
                </label>
                <input
                  id="sidebar-workspace-name"
                  type="text"
                  value={workspaceName}
                  onChange={(event) => {
                    setWorkspaceName(event.target.value);
                    if (nameError) setNameError(null);
                    if (createError) setCreateError(null);
                  }}
                  placeholder="Workspace name"
                  disabled={isCreating}
                  aria-invalid={Boolean(nameError)}
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:bg-gray-100"
                />
                {nameError ? (
                  <p className="mt-1 text-xs text-red-600">{nameError}</p>
                ) : null}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 rounded-md bg-gray-900 px-2 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setWorkspaceName("");
                    setNameError(null);
                    setCreateError(null);
                  }}
                  disabled={isCreating}
                  className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          {workspacesError ? (
            <p
              className="mb-2 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-700"
              role="alert"
            >
              {workspacesError}
            </p>
          ) : null}

          <nav className="min-h-0 flex-1 overflow-y-auto">
            {isLoadingWorkspaces ? (
              <p className="px-2 text-sm text-gray-500">Loading...</p>
            ) : workspaces.length === 0 ? (
              <p className="px-2 text-sm text-gray-500">No workspaces yet.</p>
            ) : (
              <ul className="space-y-1">
                {workspaces.map((workspace) => (
                  <li key={workspace.id}>
                    <NavLink
                      to={`/workspaces/${workspace.id}`}
                      className={({ isActive }) =>
                        [
                          "block rounded-md px-2 py-1.5 text-sm truncate",
                          isActive
                            ? "bg-gray-100 font-medium text-gray-900"
                            : "text-gray-700 hover:bg-gray-50",
                        ].join(" ")
                      }
                    >
                      {workspace.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </div>

        <div className="border-t border-gray-200 px-4 py-4">
          {user ? (
            <div className="mb-3">
              <p className="truncate text-sm font-medium text-gray-900">
                {user.name}
              </p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
            </div>
          ) : null}

          {logoutError ? (
            <p
              className="mb-2 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700"
              role="alert"
            >
              {logoutError}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
