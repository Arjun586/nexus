import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import type { Workspace } from "../types/workspace";

import { logout } from "../api/auth";
import { deleteWorkspace, getWorkspaces } from "../api/workspace";
import NexusMark from "../components/brand/NexusMark";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/ui/Toast";
import { clearSession } from "../session/restore-session";
import { getUser } from "../session/user";
import { parseApiError } from "../utils/parse-api-error";
import { useTheme } from "../utils/theme";

const STORAGE_KEY_SIDEBAR = "nexus-sidebar-collapsed";

export const getInitials = (name?: string): string => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const { isDark, toggleTheme } = useTheme();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [workspacesError, setWorkspacesError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Workspace | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Global toast notification state
  const [notification, setNotification] = useState<{
    message: string;
    variant: "success" | "error" | "info";
  } | null>(null);

  const showNotification = useCallback(
    (message: string, variant: "success" | "error" | "info" = "success") => {
      setNotification({ message, variant });
    },
    [],
  );

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

  const isDashboard = location.pathname === "/dashboard";
  const activeWorkspaceId = workspaces[0]?.id;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface text-on-surface select-none">
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

      {/* Sidebar Navigation (Editorial 240px rail) */}
      <aside
        role="navigation"
        aria-label="Sidebar navigation"
        className={`fixed left-0 top-0 h-full ${
          sidebarCollapsed ? "w-[68px]" : "w-[240px]"
        } bg-surface-container-low border-r border-outline-variant z-50 flex flex-col justify-between transition-all duration-200 ease-in-out`}
      >
        <div className="flex flex-col">
          {/* Brand header */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-outline-variant">
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 text-on-surface hover:opacity-85 transition-opacity"
            >
              <div className="w-6 h-6 flex items-center justify-center text-primary">
                <NexusMark variant="sidebar" size={20} />
              </div>
              {!sidebarCollapsed ? (
                <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface lowercase">
                  nexus
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title="Toggle sidebar (⌘B)"
              className="rounded-lg p-1 text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                {sidebarCollapsed ? "menu_open" : "menu"}
              </span>
            </button>
          </div>

          {/* Navigation Section */}
          <div className="px-4 pt-5 pb-2">
            {!sidebarCollapsed ? (
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline text-[11px]">
                NAVIGATION
              </span>
            ) : (
              <div className="w-6 h-0.5 bg-outline-variant mx-auto my-1" />
            )}
          </div>

          <nav className="flex flex-col gap-1 px-2.5">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-body-sm text-body-sm ${
                  isActive
                    ? "bg-secondary-container text-on-surface font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`
              }
            >
              <span className="material-symbols-outlined text-[18px]">space_dashboard</span>
              {!sidebarCollapsed ? <span>Workspaces</span> : null}
            </NavLink>

            {activeWorkspaceId ? (
              <NavLink
                to={`/workspaces/${activeWorkspaceId}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-body-sm text-body-sm ${
                    isActive
                      ? "bg-secondary-container text-on-surface font-semibold"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">draw</span>
                {!sidebarCollapsed ? <span>Active Canvas</span> : null}
              </NavLink>
            ) : null}

            <NavLink
              to="/dashboard?tab=recent"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors font-body-sm text-body-sm"
            >
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              {!sidebarCollapsed ? <span>Recent</span> : null}
            </NavLink>

            <NavLink
              to="/dashboard?tab=starred"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors font-body-sm text-body-sm"
            >
              <span className="material-symbols-outlined text-[18px]">star</span>
              {!sidebarCollapsed ? <span>Starred</span> : null}
            </NavLink>

            <NavLink
              to="/dashboard?tab=shared"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors font-body-sm text-body-sm"
            >
              <span className="material-symbols-outlined text-[18px]">group</span>
              {!sidebarCollapsed ? <span>Shared with me</span> : null}
            </NavLink>
          </nav>
        </div>

        {/* Bottom Section - Theme & User Profile */}
        <div className="p-2.5 border-t border-outline-variant flex flex-col gap-1.5 bg-surface-container-low">
          {sidebarCollapsed ? (
            <div className="flex items-center justify-center py-1">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
                title={`Switch to ${isDark ? "light" : "dark"} theme`}
                className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-container-high hover:text-on-surface text-on-surface-variant transition-all duration-150 cursor-pointer active:scale-95 group"
              >
                <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:rotate-45">
                  {isDark ? "light_mode" : "dark_mode"}
                </span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-3 py-1 text-on-surface-variant">
              <span className="font-label-sm text-label-sm text-outline">
                {isDark ? "Dark theme" : "Light theme"}
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
                title={`Switch to ${isDark ? "light" : "dark"} theme`}
                className="flex items-center justify-center p-1.5 rounded-lg hover:bg-surface-container-high hover:text-on-surface text-on-surface-variant transition-all duration-150 cursor-pointer active:scale-90 group"
              >
                <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:rotate-45">
                  {isDark ? "light_mode" : "dark_mode"}
                </span>
              </button>
            </div>
          )}

          {logoutError ? <Toast variant="error" message={logoutError} className="mb-1" /> : null}

          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-high transition-colors group">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-on-primary font-bold text-xs">
                {getInitials(user?.name || user?.email)}
              </div>
              {!sidebarCollapsed ? (
                <div className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-on-surface truncate">
                    {user?.name || "Alex Chen"}
                  </span>
                  <span className="font-code-sm text-[11px] text-outline truncate">
                    {user?.email || "alex@nexus.work"}
                  </span>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Sign out"
              aria-label="Sign out"
              className="text-outline group-hover:text-error hover:scale-105 p-1 rounded transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content View with Sidebar offset */}
      <div
        className={`flex-1 flex flex-col h-full min-w-0 ${
          sidebarCollapsed ? "pl-[68px]" : "pl-[240px]"
        } transition-all duration-200 ease-in-out`}
      >
        {/* Top Shell Header Bar (Dashboard mode) */}
        {isDashboard ? (
          <header className="h-14 bg-surface/80 backdrop-blur-xl border-b border-outline-variant z-40 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center text-on-surface-variant text-label-sm font-label-sm gap-2">
                <span className="text-outline">workspace</span>
                <span className="text-outline-variant font-code-sm">/</span>
                <span className="text-on-surface font-medium">main</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors font-label-sm text-label-sm"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                <span className="hidden sm:inline font-code-sm text-code-sm text-outline">⌘K</span>
              </button>

              <button
                type="button"
                aria-label="Notifications"
                className="flex items-center justify-center p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">notifications</span>
              </button>

              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-semibold">
                {getInitials(user?.name || user?.email)}
              </div>
            </div>
          </header>
        ) : null}

        {/* Content Outlet */}
        <main className="flex-1 min-h-0 overflow-y-auto bg-surface">
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
              setDeleteTarget,
            }}
          />
        </main>
      </div>

      {/* Delete Workspace Confirmation Dialog */}
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
