import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import type { Workspace } from "../types/workspace";

import { logout } from "../api/auth";
import { createWorkspace, deleteWorkspace, getWorkspaces } from "../api/workspace";
import ConfirmDialog from "../components/ConfirmDialog";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Skeleton from "../components/ui/Skeleton";
import Toast from "../components/ui/Toast";
import { clearSession } from "../session/restore-session";
import { getUser } from "../session/user";
import { parseApiError } from "../utils/parse-api-error";

const STORAGE_KEY_SIDEBAR = "nexus-sidebar-collapsed";

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

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
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

  // Global toast notification state
  const [notification, setNotification] = useState<{ message: string; variant: "success" | "error" | "info" } | null>(null);

  const showNotification = useCallback((message: string, variant: "success" | "error" | "info" = "success") => {
    setNotification({ message, variant });
  }, []);

  // Read collapsed state from localStorage with fallback to screen size
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SIDEBAR);
    if (saved !== null) {
      try {
        return JSON.parse(saved) as boolean;
      } catch {
        return false;
      }
    }
    return window.innerWidth < 768;
  });

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY_SIDEBAR, JSON.stringify(next));
      return next;
    });
  }, []);

  const loadWorkspaces = useCallback(async () => {
    setIsLoadingWorkspaces(true);
    try {
      const response = await getWorkspaces();
      setWorkspaces(response.data);
      setWorkspacesError(null);
    } catch (error) {
      const { message } = parseApiError(error);
      setWorkspacesError(message);
    } finally {
      setIsLoadingWorkspaces(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getWorkspaces()
      .then((response) => {
        if (!cancelled) {
          setWorkspaces(response.data);
          setWorkspacesError(null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          const { message } = parseApiError(error);
          setWorkspacesError(message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingWorkspaces(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

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

      const createdName = response.data.name;
      setWorkspaceName("");
      setShowCreateForm(false);
      await loadWorkspaces();
      showNotification(`Workspace "${createdName}" created successfully.`, "success");
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

    const deletedName = deleteTarget.name;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteWorkspace(deleteTarget.id);
      setWorkspaces((prev) => prev.filter((w) => w.id !== deleteTarget.id));
      setDeleteTarget(null);
      showNotification(`Workspace "${deletedName}" deleted.`, "info");
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
      showNotification(`Workspace renamed to "${updated.name}".`, "success");
    },
    [showNotification],
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-gray-900 select-none">
      {/* Floating Notification Toast */}
      {notification ? (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm">
          <Toast
            variant={notification.variant}
            message={notification.message}
            onClose={() => setNotification(null)}
            autoDismiss={true}
            duration={4000}
          />
        </div>
      ) : null}

      {/* Sidebar Navigation */}
      <aside
        role="navigation"
        aria-label="Sidebar navigation"
        className={`${
          sidebarCollapsed ? "w-[64px]" : "w-[260px]"
        } flex shrink-0 flex-col border-r border-gray-200 bg-white transition-all duration-200 ease-in-out z-20`}
      >
        {/* Brand Header */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 px-3">
          {!sidebarCollapsed ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 font-semibold text-gray-900 text-sm tracking-tight hover:opacity-80 transition-opacity"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded bg-gray-900 text-white text-xs font-bold shrink-0">
                N
              </div>
              <span className="truncate">Nexus</span>
            </Link>
          ) : (
            <Link
              to="/dashboard"
              aria-label="Nexus Dashboard"
              className="mx-auto flex h-7 w-7 items-center justify-center rounded bg-gray-900 text-white text-xs font-bold shrink-0"
              title="Nexus Dashboard"
            >
              N
            </Link>
          )}

          <button
            type="button"
            onClick={toggleSidebar}
            aria-expanded={!sidebarCollapsed}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={`Toggle sidebar (${navigator.platform.indexOf("Mac") > -1 ? "⌘B" : "Ctrl+B"})`}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-gray-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex min-h-0 flex-1 flex-col px-2 py-3 overflow-hidden">
          {!sidebarCollapsed ? (
            <div className="mb-2 flex items-center justify-between px-1.5">
              <h2 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Workspaces
              </h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowCreateForm((current) => !current);
                  setNameError(null);
                  setCreateError(null);
                }}
                className="py-0.5 px-2 text-xs"
              >
                + New
              </Button>
            </div>
          ) : null}

          {/* New Workspace inline form */}
          {showCreateForm && !sidebarCollapsed ? (
            <form
              className="mb-3 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-2.5"
              onSubmit={handleCreateWorkspace}
              noValidate
            >
              {createError ? <Toast variant="error" message={createError} /> : null}

              <Input
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
                error={nameError}
                className="py-1 text-xs"
              />

              <div className="flex gap-1.5 pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isCreating}
                  className="flex-1 text-xs py-1"
                >
                  Create
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false);
                    setWorkspaceName("");
                    setNameError(null);
                    setCreateError(null);
                  }}
                  disabled={isCreating}
                  className="text-xs py-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}

          {workspacesError ? <Toast variant="error" message={workspacesError} className="mb-2" /> : null}

          <nav className="min-h-0 flex-1 overflow-y-auto space-y-3 pr-0.5">
            {isLoadingWorkspaces ? (
              <div className="space-y-2 px-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2.5 p-1">
                    <Skeleton height={28} width={28} variant="circular" />
                    {!sidebarCollapsed ? <Skeleton height={16} className="flex-1" /> : null}
                  </div>
                ))}
              </div>
            ) : workspaces.length === 0 ? (
              !sidebarCollapsed ? (
                <p className="px-2 py-4 text-xs text-gray-400 text-center">No workspaces.</p>
              ) : null
            ) : (
              <div className="space-y-3">
                {/* Owned */}
                {workspaces.some((w) => w.ownerId === user?.id) ? (
                  <div>
                    {!sidebarCollapsed ? (
                      <h3 className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Owned
                      </h3>
                    ) : null}
                    <ul className="space-y-1">
                      {workspaces
                        .filter((w) => w.ownerId === user?.id)
                        .map((workspace) => (
                          <li key={workspace.id} className="group flex items-center">
                            <NavLink
                              to={`/workspaces/${workspace.id}`}
                              title={workspace.name}
                              className={({ isActive }) =>
                                [
                                  "flex min-w-0 flex-1 items-center gap-2.5 rounded-md p-1 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-gray-900",
                                  isActive
                                    ? "bg-gray-100 font-semibold text-gray-900"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                                ].join(" ")
                              }
                            >
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100 text-[11px] font-bold text-gray-700 border border-gray-200">
                                {getInitials(workspace.name)}
                              </div>

                              {!sidebarCollapsed ? (
                                <span className="truncate flex-1">{workspace.name}</span>
                              ) : null}
                            </NavLink>

                            {!sidebarCollapsed ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteTarget(workspace);
                                  setDeleteError(null);
                                }}
                                aria-label={`Delete ${workspace.name}`}
                                title={`Delete ${workspace.name}`}
                                className="mr-1 shrink-0 rounded p-1 text-gray-400 opacity-0 hover:text-red-600 group-hover:opacity-100 transition-opacity outline-none focus-visible:ring-1 focus-visible:ring-gray-900"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                                </svg>
                              </button>
                            ) : null}
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : null}

                {/* Shared */}
                {workspaces.some((w) => w.ownerId !== user?.id) ? (
                  <div>
                    {!sidebarCollapsed ? (
                      <h3 className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        Shared
                      </h3>
                    ) : null}
                    <ul className="space-y-1">
                      {workspaces
                        .filter((w) => w.ownerId !== user?.id)
                        .map((workspace) => (
                          <li key={workspace.id} className="flex items-center">
                            <NavLink
                              to={`/workspaces/${workspace.id}`}
                              title={workspace.name}
                              className={({ isActive }) =>
                                [
                                  "flex min-w-0 flex-1 items-center gap-2.5 rounded-md p-1 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-gray-900",
                                  isActive
                                    ? "bg-gray-100 font-semibold text-gray-900"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                                ].join(" ")
                              }
                            >
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-[11px] font-bold text-blue-700 border border-blue-200">
                                {getInitials(workspace.name)}
                              </div>
                              {!sidebarCollapsed ? (
                                <div className="flex min-w-0 flex-1 items-center justify-between gap-1">
                                  <span className="truncate">{workspace.name}</span>
                                  <Badge variant="shared">Shared</Badge>
                                </div>
                              ) : null}
                            </NavLink>
                          </li>
                        ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </nav>
        </div>

        {/* Sidebar Footer - Profile & Logout */}
        <div className="border-t border-gray-200 p-2.5">
          {logoutError ? <Toast variant="error" message={logoutError} className="mb-2" /> : null}

          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-gray-900">
                  {user?.name ?? "User"}
                </p>
                <p className="truncate text-[10px] text-gray-500">{user?.email}</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="Sign out"
                aria-label="Sign out"
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 outline-none focus-visible:ring-2 focus-visible:ring-gray-900 disabled:opacity-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.5a.75.75 0 0 0 0 1.5h9.75A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M14.72 6.72a.75.75 0 0 0-1.06 1.06l2.47 2.47-2.47 2.47a.75.75 0 1 0 1.06 1.06l3-3a.75.75 0 0 0 0-1.06l-3-3Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="Sign out"
                aria-label="Sign out"
                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 outline-none focus-visible:ring-2 focus-visible:ring-gray-900 disabled:opacity-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.5a.75.75 0 0 0 0 1.5h9.75A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M14.72 6.72a.75.75 0 0 0-1.06 1.06l2.47 2.47-2.47 2.47a.75.75 0 1 0 1.06 1.06l3-3a.75.75 0 0 0 0-1.06l-3-3Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 overflow-auto bg-gray-50">
        <Outlet
          context={{
            onWorkspaceRenamed,
            workspaces,
            isLoadingWorkspaces,
            workspacesError,
            loadWorkspaces,
            sidebarCollapsed,
            toggleSidebar,
            showNotification,
          }}
        />
      </main>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Workspace?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? All whiteboard elements in this workspace will be permanently removed.`}
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
