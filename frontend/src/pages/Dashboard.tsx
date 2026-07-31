import { useState, type FormEvent } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";

import { createWorkspace } from "../api/workspace";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Skeleton from "../components/ui/Skeleton";
import Toast from "../components/ui/Toast";
import { getUser } from "../session/user";
import type { Workspace } from "../types/workspace";
import { parseApiError } from "../utils/parse-api-error";

type DashboardContext = {
  workspaces?: Workspace[];
  isLoadingWorkspaces?: boolean;
  workspacesError?: string | null;
  loadWorkspaces?: () => Promise<void>;
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const formatCreatedAt = (createdAt: string): string => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return createdAt;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const context = useOutletContext<DashboardContext>();

  const workspaces: Workspace[] = context?.workspaces ?? [];
  const isLoading = context?.isLoadingWorkspaces ?? false;
  const error = context?.workspacesError ?? null;
  const loadWorkspaces = context?.loadWorkspaces;

  // New Workspace Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [createApiError, setCreateApiError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const ownedWorkspaces = workspaces.filter((w: Workspace) => w.ownerId === user?.id);
  const sharedWorkspaces = workspaces.filter((w: Workspace) => w.ownerId !== user?.id);

  const handleCreateSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = newWorkspaceName.trim();

    if (!trimmed) {
      setNameError("Workspace name is required.");
      return;
    }

    if (trimmed.length > 100) {
      setNameError("Workspace name must be at most 100 characters.");
      return;
    }

    setIsCreating(true);
    setNameError(null);
    setCreateApiError(null);

    try {
      const response = await createWorkspace({ name: trimmed });
      setNewWorkspaceName("");
      setCreateModalOpen(false);
      if (loadWorkspaces) {
        await loadWorkspaces();
      }
      navigate(`/workspaces/${response.data.id}`);
    } catch (err) {
      const { message, fieldErrors } = parseApiError(err);
      setCreateApiError(message);
      setNameError(fieldErrors.name ?? null);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 select-none">
      {/* Page Header */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Workspaces
          </h1>
          <p className="mt-1 text-xs text-gray-600">
            Manage and enter your collaborative whiteboard canvases.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setNewWorkspaceName("");
            setNameError(null);
            setCreateApiError(null);
            setCreateModalOpen(true);
          }}
          className="shrink-0"
          leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
          }
        >
          New Workspace
        </Button>
      </header>

      {/* Error Banner with Retry */}
      {error ? (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-red-500">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
          {loadWorkspaces ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadWorkspaces()}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Retry
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* Loading Skeleton Grid */}
      {isLoading ? (
        <div className="space-y-8">
          <div>
            <Skeleton height={20} className="mb-4 w-40" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="flex h-36 flex-col justify-between p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1">
                      <Skeleton height={32} width={32} variant="circular" />
                      <Skeleton height={18} className="w-3/5" />
                    </div>
                    <Skeleton height={20} width={50} />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton height={14} width={90} />
                    <Skeleton height={14} width={70} />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Owned Workspaces */}
          <section aria-labelledby="owned-workspaces-heading">
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="owned-workspaces-heading"
                className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2"
              >
                <span>Owned Workspaces</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                  {ownedWorkspaces.length}
                </span>
              </h2>
            </div>

            {ownedWorkspaces.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-2xs">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">No owned workspaces</h3>
                <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                  Get started by creating your first infinite whiteboard workspace.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setNewWorkspaceName("");
                    setNameError(null);
                    setCreateApiError(null);
                    setCreateModalOpen(true);
                  }}
                  className="mt-4"
                >
                  Create Workspace
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ownedWorkspaces.map((workspace: Workspace) => (
                  <Link
                    key={workspace.id}
                    to={`/workspaces/${workspace.id}`}
                    aria-label={`Open workspace ${workspace.name}`}
                    className="group outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-gray-900"
                  >
                    <Card interactive className="flex h-36 flex-col justify-between p-5">
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-700 border border-gray-200">
                              {getInitials(workspace.name)}
                            </div>
                            <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-gray-900">
                              {workspace.name}
                            </h3>
                          </div>
                          <Badge variant="owner">Owner</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 pt-3">
                        <span>Created {formatCreatedAt(workspace.createdAt)}</span>
                        <span className="font-semibold opacity-0 group-hover:opacity-100 transition-opacity text-gray-700">
                          Open canvas →
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Shared Workspaces */}
          <section aria-labelledby="shared-workspaces-heading">
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="shared-workspaces-heading"
                className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2"
              >
                <span>Shared Workspaces</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  {sharedWorkspaces.length}
                </span>
              </h2>
            </div>

            {sharedWorkspaces.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-2xs">
                <p className="text-xs text-gray-400">No workspaces shared with you yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sharedWorkspaces.map((workspace: Workspace) => (
                  <Link
                    key={workspace.id}
                    to={`/workspaces/${workspace.id}`}
                    aria-label={`Open shared workspace ${workspace.name}`}
                    className="group outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-gray-900"
                  >
                    <Card interactive className="flex h-36 flex-col justify-between p-5">
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700 border border-blue-200">
                              {getInitials(workspace.name)}
                            </div>
                            <h3 className="truncate text-sm font-semibold text-gray-900">
                              {workspace.name}
                            </h3>
                          </div>
                          <Badge variant="shared">Shared</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 pt-3">
                        <span>Created {formatCreatedAt(workspace.createdAt)}</span>
                        <span className="font-semibold opacity-0 group-hover:opacity-100 transition-opacity text-gray-700">
                          Open canvas →
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Create Workspace Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => {
          if (!isCreating) {
            setCreateModalOpen(false);
            setNewWorkspaceName("");
            setNameError(null);
            setCreateApiError(null);
          }
        }}
        title="Create New Workspace"
        description="Enter a name for your infinite whiteboard workspace."
        preventBackdropClose={isCreating}
      >
        <form onSubmit={handleCreateSubmit} noValidate className="space-y-4">
          {createApiError ? <Toast variant="error" message={createApiError} /> : null}

          <Input
            label="Workspace Name"
            id="modal-workspace-name"
            name="name"
            type="text"
            placeholder="e.g. Design Systems & Architecture"
            value={newWorkspaceName}
            onChange={(e) => {
              setNewWorkspaceName(e.target.value);
              if (nameError) setNameError(null);
              if (createApiError) setCreateApiError(null);
            }}
            error={nameError}
            disabled={isCreating}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setCreateModalOpen(false);
                setNewWorkspaceName("");
                setNameError(null);
                setCreateApiError(null);
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isCreating}
            >
              Create Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
