import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import type { Workspace } from "../types/workspace";

import { logout } from "../api/auth";
import { createWorkspace, deleteWorkspace, getWorkspaces } from "../api/workspace";
import ConfirmDialog from "../components/ConfirmDialog";
import { clearSession } from "../session/restore-session";
import { getUser } from "../session/user";
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
  const [deleteTarget, setDeleteTarget] = useState<Workspace | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleDeleteWorkspace = async () => {
    if (!deleteTarget || isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteWorkspace(deleteTarget.id);
      setWorkspaces((prev) => prev.filter((w) => w.id !== deleteTarget.id));
      setDeleteTarget(null);
      navigate("/dashboard");
    } catch (error) {
      const { message } = parseApiError(error);
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
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

  const onWorkspaceRenamed = useCallback(
    (updated: Workspace) => {
      setWorkspaces((prev) =>
        prev.map((w) => (w.id === updated.id ? { ...w, name: updated.name } : w)),
      );
    },
    [],
  );

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
                  <li key={workspace.id} className="group flex items-center">
                    <NavLink
                      to={`/workspaces/${workspace.id}`}
                      className={({ isActive }) =>
                        [
                          "block min-w-0 flex-1 rounded-md px-2 py-1.5 text-sm truncate",
                          isActive
                            ? "bg-gray-100 font-medium text-gray-900"
                            : "text-gray-700 hover:bg-gray-50",
                        ].join(" ")
                      }
                    >
                      {workspace.name}
                    </NavLink>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget(workspace);
                        setDeleteError(null);
                      }}
                      aria-label={`Delete ${workspace.name}`}
                      className="mr-1 shrink-0 rounded p-1 text-gray-400 opacity-0 hover:text-red-600 group-hover:opacity-100"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
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
        <Outlet context={{ onWorkspaceRenamed }} />
      </main>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Workspace?"
        message="This action cannot be undone. All whiteboard data inside this workspace will be permanently deleted."
        confirmLabel="Delete Workspace"
        isLoading={isDeleting}
        error={deleteError}
        onConfirm={() => void handleDeleteWorkspace()}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
      />
    </div>
  );
};

export default AppLayout;
