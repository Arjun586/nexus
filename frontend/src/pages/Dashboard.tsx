import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useOutletContext, useSearchParams } from "react-router-dom";

import { createWorkspace } from "../api/workspace";
import AvatarStack from "../components/ui/AvatarStack";
import Button from "../components/ui/Button";
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
  setDeleteTarget?: (w: Workspace) => void;
};

const formatTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "Recently";
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffHours < 1) return "Updated just now";
  if (diffHours < 24) return `Updated ${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Updated yesterday";
  if (diffDays < 7) return `Updated ${diffDays}d ago`;
  return `Updated ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
};

const cardGlyphs = [
  // Glyph 1: Connected triad node glyph
  (
    <svg
      key="glyph-1"
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
      width="20"
      className="text-secondary"
    >
      <circle className="fill-primary/20" cx="12" cy="5" r="2.5" />
      <circle className="fill-primary/20" cx="5" cy="18" r="2.5" />
      <circle className="fill-primary/20" cx="19" cy="18" r="2.5" />
      <path d="M10.5 7L6.5 15.5M13.5 7l4 8.5M7.5 18h9" stroke="currentColor" />
    </svg>
  ),
  // Glyph 2: Isometric cube outline icon
  (
    <svg
      key="glyph-2"
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
      width="20"
      className="text-secondary"
    >
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
      <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" stroke="currentColor" />
    </svg>
  ),
  // Glyph 3: Overlapping circular rings icon
  (
    <svg
      key="glyph-3"
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
      width="20"
      className="text-secondary"
    >
      <circle cx="9" cy="12" r="5.5" />
      <circle cx="15" cy="12" r="5.5" stroke="currentColor" />
    </svg>
  ),
  // Glyph 4: 4-square interconnected diagram node glyph
  (
    <svg
      key="glyph-4"
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
      width="20"
      className="text-secondary"
    >
      <rect height="5" rx="1" width="5" x="3" y="3" />
      <rect height="5" rx="1" stroke="currentColor" width="5" x="16" y="3" />
      <rect height="5" rx="1" stroke="currentColor" width="5" x="3" y="16" />
      <rect height="5" rx="1" width="5" x="16" y="16" />
      <path d="M8 5.5h8M8 18.5h8M5.5 8v8M18.5 8v8" stroke="currentColor" strokeDasharray="1.5 1.5" />
    </svg>
  ),
];

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const context = useOutletContext<DashboardContext>();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab");

  const workspaces: Workspace[] = context?.workspaces ?? [];
  const isLoading = context?.isLoadingWorkspaces ?? false;
  const error = context?.workspacesError ?? null;
  const loadWorkspaces = context?.loadWorkspaces;
  const setDeleteTarget = context?.setDeleteTarget;

  // Search input state
  const [searchQuery, setSearchQuery] = useState("");

  // Create Workspace Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [createApiError, setCreateApiError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Filter workspaces based on search and tabs
  const filteredWorkspaces = useMemo(() => {
    let list = workspaces;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((w) => w.name.toLowerCase().includes(q));
    }
    return list;
  }, [workspaces, searchQuery]);

  const ownedWorkspaces = useMemo(
    () => filteredWorkspaces.filter((w: Workspace) => w.ownerId === user?.id),
    [filteredWorkspaces, user?.id],
  );

  const sharedWorkspaces = useMemo(
    () => filteredWorkspaces.filter((w: Workspace) => w.ownerId !== user?.id),
    [filteredWorkspaces, user?.id],
  );

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

  const showOwned = currentTab !== "shared";
  const showShared = currentTab !== "recent" && currentTab !== "starred";

  return (
    <div className="max-w-[1360px] w-full mx-auto px-6 sm:px-11 pt-10 pb-16 select-none">
      {/* Header Row */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-10">
        <div>
          <h1 className="font-display-editorial text-[38px] sm:text-[42px] leading-[48px] font-normal tracking-[-0.02em] text-on-surface">
            Workspaces
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workspaces..."
              className="h-[42px] w-56 sm:w-64 pl-9 pr-3 rounded-[10px] bg-surface-container-lowest text-on-surface font-body-sm text-body-sm placeholder:text-outline border border-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setNewWorkspaceName("");
              setNameError(null);
              setCreateApiError(null);
              setCreateModalOpen(true);
            }}
            className="h-[42px] px-4 rounded-[10px] bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-medium tracking-tight flex items-center gap-1.5 transition-colors shadow-sm active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Workspace</span>
          </button>
        </div>
      </header>

      {/* Error banner */}
      {error ? (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-error/30 bg-error-container/40 p-4 text-xs font-medium text-error">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
          {loadWorkspaces ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadWorkspaces()}
              className="border-error/40 text-error hover:bg-error-container"
            >
              Retry
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="space-y-10">
          <div>
            <Skeleton height={24} className="mb-4 w-44 rounded-md" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px]">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 rounded-[12px] bg-surface-container-lowest border border-outline-variant p-[22px] flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <Skeleton height={36} width={36} className="rounded-lg" />
                    <Skeleton height={18} width={18} className="rounded-full" />
                  </div>
                  <Skeleton height={20} className="w-3/4 rounded-md" />
                  <div className="flex items-center justify-between pt-2">
                    <Skeleton height={24} width={70} className="rounded-full" />
                    <Skeleton height={14} width={80} className="rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Section 1: Owned Workspaces */}
          {showOwned ? (
            <section aria-labelledby="owned-workspaces-heading">
              <div className="flex items-center justify-between mb-4">
                <h2
                  id="owned-workspaces-heading"
                  className="font-headline-md text-[20px] leading-[28px] font-medium tracking-tight text-on-surface"
                >
                  Owned Workspaces
                </h2>
              </div>

              {ownedWorkspaces.length === 0 ? (
                <div className="rounded-[12px] border border-dashed border-outline-variant bg-surface-container-lowest p-12 text-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-[20px]">draw</span>
                  </div>
                  <h3 className="font-headline-sm text-base font-semibold text-on-surface">
                    No owned workspaces
                  </h3>
                  <p className="mt-1 text-xs text-secondary max-w-sm mx-auto">
                    Create your first infinite whiteboard canvas to start sketching ideas and collaborating.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setNewWorkspaceName("");
                      setNameError(null);
                      setCreateApiError(null);
                      setCreateModalOpen(true);
                    }}
                    className="mt-4 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-xs font-medium hover:bg-primary-container transition-colors"
                  >
                    Create Workspace
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px]">
                  {ownedWorkspaces.map((workspace: Workspace, idx: number) => {
                    const glyph = cardGlyphs[idx % cardGlyphs.length];
                    return (
                      <div
                        key={workspace.id}
                        className="group relative bg-surface-container-lowest border border-outline-variant hover:border-outline rounded-[12px] p-[22px] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                      >
                        <Link
                          to={`/workspaces/${workspace.id}`}
                          className="block"
                        >
                          <div className="flex items-start justify-between">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              {glyph}
                            </div>
                            <span className="material-symbols-outlined text-[18px] text-transparent group-hover:text-outline transition-colors">
                              arrow_outward
                            </span>
                          </div>

                          <div className="mt-5 mb-7">
                            <h3 className="font-headline-sm text-[17px] font-semibold text-on-surface group-hover:text-primary transition-colors leading-snug truncate">
                              {workspace.name}
                            </h3>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <AvatarStack
                              users={[
                                { name: user?.name, email: user?.email },
                              ]}
                              size="sm"
                            />
                            <span className="font-label-sm text-[13px] text-secondary">
                              {formatTimeAgo(workspace.createdAt)}
                            </span>
                          </div>
                        </Link>

                        {/* Delete action */}
                        {setDeleteTarget ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(workspace);
                            }}
                            title={`Delete ${workspace.name}`}
                            aria-label={`Delete ${workspace.name}`}
                            className="absolute top-4 right-10 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-error-container/40 text-outline hover:text-error transition-all"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ) : null}

          {/* Section 2: Shared Workspaces */}
          {showShared ? (
            <section className="mt-[36px]" aria-labelledby="shared-workspaces-heading">
              <div className="flex items-center justify-between mb-4">
                <h2
                  id="shared-workspaces-heading"
                  className="font-headline-md text-[20px] leading-[28px] font-medium tracking-tight text-on-surface"
                >
                  Shared Workspaces
                </h2>
              </div>

              {sharedWorkspaces.length === 0 ? (
                <div className="rounded-[12px] border border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center">
                  <p className="text-xs text-secondary">
                    No workspaces shared with you yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px]">
                  {sharedWorkspaces.map((workspace: Workspace, idx: number) => {
                    const glyph = cardGlyphs[(idx + 2) % cardGlyphs.length];
                    return (
                      <Link
                        key={workspace.id}
                        to={`/workspaces/${workspace.id}`}
                        className="group block bg-surface-container-lowest border border-outline-variant hover:border-outline rounded-[12px] p-[22px] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            {glyph}
                          </div>
                          <span className="material-symbols-outlined text-[18px] text-transparent group-hover:text-outline transition-colors">
                            arrow_outward
                          </span>
                        </div>

                        <div className="mt-5 mb-7">
                          <h3 className="font-headline-sm text-[17px] font-semibold text-on-surface group-hover:text-primary transition-colors leading-snug truncate">
                            {workspace.name}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-label-sm text-[13px] text-secondary truncate">
                              Shared workspace
                            </span>
                          </div>
                          <span className="font-label-sm text-[13px] text-secondary shrink-0">
                            {formatTimeAgo(workspace.createdAt)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          ) : null}
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
            placeholder="e.g. Design Systems & Tokens"
            value={newWorkspaceName}
            onChange={(e) => {
              setNewWorkspaceName(e.target.value);
              if (nameError) setNameError(null);
              if (createApiError) setCreateApiError(null);
            }}
            error={nameError}
            disabled={isCreating}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/40">
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
