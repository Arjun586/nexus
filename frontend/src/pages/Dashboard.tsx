import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { logout } from "../api/auth";
import { createWorkspace, getWorkspaces } from "../api/workspace";
import { clearSession } from "../session/restore-session";
import { getAccessToken } from "../session/access-token";
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

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const isAuthenticated = Boolean(user && getAccessToken());
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceNameError, setWorkspaceNameError] = useState<string | null>(
    null,
  );
  const [workspaceApiError, setWorkspaceApiError] = useState<string | null>(
    null,
  );
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [createdWorkspace, setCreatedWorkspace] = useState<Workspace | null>(
    null,
  );
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [workspacesError, setWorkspacesError] = useState<string | null>(null);

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
    if (!isAuthenticated) {
      return;
    }

    void loadWorkspaces();
  }, [isAuthenticated]);

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

  const handleCreateWorkspace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nameError = validateWorkspaceName(workspaceName);

    if (nameError) {
      setWorkspaceNameError(nameError);
      setWorkspaceApiError(null);
      return;
    }

    setIsCreatingWorkspace(true);
    setWorkspaceNameError(null);
    setWorkspaceApiError(null);

    try {
      const response = await createWorkspace({
        name: workspaceName.trim(),
      });

      setCreatedWorkspace(response.data);
      setWorkspaceName("");
      await loadWorkspaces();
    } catch (error) {
      const { message, fieldErrors } = parseApiError(error);

      setWorkspaceApiError(message);
      setWorkspaceNameError(fieldErrors.name ?? null);
    } finally {
      setIsCreatingWorkspace(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Authentication and workspace sandbox — session and API testing only.
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

        {logoutError ? (
          <p
            className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {logoutError}
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

        <div className="mt-8 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-gray-900">
            Create workspace
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Test the protected workspace creation endpoint.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={handleCreateWorkspace}
            noValidate
          >
            {workspaceApiError ? (
              <p
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {workspaceApiError}
              </p>
            ) : null}

            <div>
              <label
                htmlFor="workspace-name"
                className="block text-sm font-medium text-gray-700"
              >
                Workspace name
              </label>
              <input
                id="workspace-name"
                name="workspace-name"
                type="text"
                value={workspaceName}
                onChange={(event) => {
                  setWorkspaceName(event.target.value);

                  if (workspaceNameError) {
                    setWorkspaceNameError(null);
                  }

                  if (workspaceApiError) {
                    setWorkspaceApiError(null);
                  }
                }}
                aria-invalid={Boolean(workspaceNameError)}
                aria-describedby={
                  workspaceNameError ? "workspace-name-error" : undefined
                }
                disabled={!isAuthenticated || isCreatingWorkspace}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:cursor-not-allowed disabled:bg-gray-100"
              />
              {workspaceNameError ? (
                <p
                  id="workspace-name-error"
                  className="mt-1 text-sm text-red-600"
                >
                  {workspaceNameError}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={
                !isAuthenticated || isCreatingWorkspace || isLoggingOut
              }
              className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isCreatingWorkspace ? "Creating workspace..." : "Create Workspace"}
            </button>
          </form>

          {createdWorkspace ? (
            <dl className="mt-6 space-y-4 rounded-md border border-gray-200 bg-gray-50 p-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Workspace ID
                </dt>
                <dd className="mt-1 font-mono text-sm text-gray-900">
                  {createdWorkspace.id}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {createdWorkspace.name}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Owner ID</dt>
                <dd className="mt-1 font-mono text-sm text-gray-900">
                  {createdWorkspace.ownerId}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Created at
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {createdWorkspace.createdAt}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Updated at
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {createdWorkspace.updatedAt}
                </dd>
              </div>
            </dl>
          ) : null}
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-gray-900">Your workspaces</h2>
          <p className="mt-2 text-sm text-gray-600">
            Workspaces owned by the authenticated user.
          </p>

          {workspacesError ? (
            <p
              className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {workspacesError}
            </p>
          ) : null}

          {isLoadingWorkspaces ? (
            <p className="mt-4 text-sm text-gray-600">Loading workspaces...</p>
          ) : workspaces.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">No workspaces yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {workspaces.map((workspace) => (
                <li
                  key={workspace.id}
                  className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {workspace.name}
                  </p>
                  <p className="mt-1 font-mono text-xs text-gray-500">
                    {workspace.id}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
