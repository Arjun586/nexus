import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { getCollaborators, inviteCollaborator } from "../../api/workspace";
import type { CollaborationState } from "../../collaboration/useCollaboration";
import { getUser } from "../../session/user";
import type { Collaborator } from "../../types/collaborator";
import type { Workspace } from "../../types/workspace";
import { parseApiError } from "../../utils/parse-api-error";
import AvatarStack, { getInitials } from "../ui/AvatarStack";
import Button from "../ui/Button";

type WorkspaceHeaderProps = {
  workspace: Workspace;
  collabState?: CollaborationState | null;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onRename: (newName: string) => Promise<boolean>;
};

export const WorkspaceHeader = ({
  workspace,
  collabState,
  sidebarCollapsed,
  onToggleSidebar,
  onRename,
}: WorkspaceHeaderProps) => {
  const currentUser = getUser();
  const isOwner = currentUser?.id === workspace.ownerId;

  // Inline rename state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Popover state
  const [membersOpen, setMembersOpen] = useState(false);

  // Collaborators state
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoadingCollab, setIsLoadingCollab] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingCollab(true);

    getCollaborators(workspace.id)
      .then((data) => {
        if (!cancelled) setCollaborators(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingCollab(false);
      });

    return () => {
      cancelled = true;
    };
  }, [workspace.id]);

  // Click outside to dismiss popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMembersOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setEditName(workspace.name);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (isRenaming) return;
    setIsEditing(false);
    setEditName(workspace.name);
  };

  const handleSubmitRename = async () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === workspace.name || isRenaming) return;

    setIsRenaming(true);
    try {
      const success = await onRename(trimmed);
      if (success) {
        setIsEditing(false);
      }
    } finally {
      setIsRenaming(false);
    }
  };

  const handleInviteSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = inviteEmail.trim();
    if (!trimmed) return;

    setIsInviting(true);
    setInviteMsg(null);

    try {
      await inviteCollaborator(workspace.id, { email: trimmed });
      setInviteEmail("");
      setInviteMsg({ text: `Invited ${trimmed} successfully.` });
      const refreshed = await getCollaborators(workspace.id);
      setCollaborators(refreshed);
    } catch (err) {
      const { message } = parseApiError(err);
      setInviteMsg({ text: message, isError: true });
    } finally {
      setIsInviting(false);
    }
  };

  const connectionStatus = collabState?.status ?? "connecting";
  const isLive = connectionStatus === "connected";

  const roomId = `nx-${workspace.id.slice(0, 6)}`;

  return (
    <div ref={containerRef} className="relative z-40">
      <header className="h-[60px] bg-surface-container-lowest/90 backdrop-blur-md border-b border-surface-variant z-40 flex items-center justify-between px-6 select-none">
        {/* Left: Breadcrumbs & Inline rename */}
        <div className="flex items-center gap-2.5 min-w-0">
          {onToggleSidebar ? (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title="Toggle sidebar (⌘B)"
              className="rounded-lg p-1 text-secondary hover:bg-surface-container-low hover:text-on-surface transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">
                {sidebarCollapsed ? "menu_open" : "menu"}
              </span>
            </button>
          ) : null}

          <div className="flex items-center gap-2 text-on-surface min-w-0">
            <Link
              to="/dashboard"
              className="font-body-md text-body-md text-secondary hover:text-on-surface transition-colors shrink-0"
            >
              workspace
            </Link>
            <span className="text-outline-variant font-code-sm text-code-sm">/</span>

            {isEditing ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleSubmitRename();
                    if (e.key === "Escape") handleCancel();
                  }}
                  disabled={isRenaming}
                  maxLength={100}
                  className="rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5 py-1 text-xs font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary min-w-[140px]"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => void handleSubmitRename()}
                  isLoading={isRenaming}
                  disabled={!editName.trim() || editName.trim() === workspace.name || isRenaming}
                  className="py-0.5 px-2 text-xs min-h-[26px]"
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isRenaming}
                  className="py-0.5 px-2 text-xs min-h-[26px]"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div
                onClick={startEditing}
                title="Click to rename"
                className="flex items-center gap-1.5 cursor-pointer group min-w-0"
              >
                <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight truncate max-w-[280px] sm:max-w-[400px]">
                  {workspace.name}
                </span>
                <span className="material-symbols-outlined text-[14px] text-transparent group-hover:text-outline transition-colors">
                  edit
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right cluster: Collaborators stack, Live indicator, Members button, Profile */}
        <div className="flex items-center gap-3">
          {/* Avatar stack */}
          <div className="hidden sm:flex">
            <AvatarStack
              users={
                collaborators.length > 0
                  ? collaborators.map((c) => ({
                      id: c.user.id,
                      name: c.user.name,
                      email: c.user.email,
                    }))
                  : [{ name: currentUser?.name, email: currentUser?.email }]
              }
              size="sm"
            />
          </div>

          {/* Live Indicator badge */}
          <div className="flex items-center gap-1.5 bg-surface-container-low px-2 py-0.5 rounded-full border border-surface-variant select-none">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isLive
                  ? "bg-primary animate-pulse"
                  : connectionStatus === "connecting"
                  ? "bg-amber-500 animate-ping"
                  : "bg-error"
              }`}
            />
            <span className="font-code-sm text-[11px] text-secondary">
              {isLive ? "Live" : connectionStatus === "connecting" ? "Sync" : "Offline"}
            </span>
          </div>

          {/* Members Trigger Button */}
          <button
            type="button"
            onClick={() => setMembersOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1 border border-surface-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">
              group_add
            </span>
            <span>Members</span>
          </button>

          {/* User profile avatar */}
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary text-xs font-semibold">
            {getInitials(currentUser?.name || currentUser?.email)}
          </div>
        </div>
      </header>

      {/* Active Collaborators / Members Popover */}
      {membersOpen ? (
        <div
          id="members-popover"
          className="absolute top-14 right-6 z-50 w-80 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/40 transition-all duration-150"
        >
          <div className="p-3 flex items-center justify-between bg-surface-container-low rounded-t-xl border-b border-outline-variant/40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">group</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Active Collaborators
              </span>
            </div>
            <span className="font-code-sm text-[11px] text-secondary bg-surface-container px-2 py-0.5 rounded">
              {collaborators.length + 1} members
            </span>
          </div>

          {/* Members list */}
          <div className="p-2 flex flex-col gap-1 max-h-64 overflow-y-auto">
            {/* Current user */}
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-fixed font-label-sm font-semibold text-xs">
                    {getInitials(currentUser?.name || currentUser?.email)}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-primary-container ring-1 ring-surface-container-lowest" />
                </div>
                <div className="min-w-0">
                  <div className="font-label-md text-label-md text-on-surface truncate">
                    {currentUser?.name || "You"}
                  </div>
                  <div className="font-code-sm text-[10px] text-secondary truncate">
                    {isOwner ? "Owner · Active" : "Editor · Active"}
                  </div>
                </div>
              </div>
              <span className="font-code-sm text-[11px] text-primary px-1.5 py-0.5 rounded bg-primary-fixed/40">
                You
              </span>
            </div>

            {/* Other collaborators */}
            {isLoadingCollab ? (
              <p className="text-xs text-secondary text-center py-2">Loading members...</p>
            ) : collaborators.length === 0 ? (
              <p className="text-xs text-secondary text-center py-2">No other members yet.</p>
            ) : (
              collaborators.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-sm font-semibold text-xs">
                        {getInitials(c.user.name || c.user.email)}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-primary ring-1 ring-surface-container-lowest" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-label-md text-label-md text-on-surface truncate">
                        {c.user.name || c.user.email}
                      </div>
                      <div className="font-code-sm text-[10px] text-secondary truncate">
                        {c.user.email}
                      </div>
                    </div>
                  </div>
                  <span className="font-label-sm text-[11px] text-secondary">
                    {c.role === "OWNER" ? "Owner" : "Editor"}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Invite form (Owner only) */}
          {isOwner ? (
            <form onSubmit={handleInviteSubmit} className="p-3 border-t border-outline-variant/40">
              <span className="font-label-sm text-[11px] text-secondary block mb-1.5">
                Invite team member
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@company.com"
                  disabled={isInviting}
                  className="flex-1 h-9 px-2.5 rounded-lg bg-surface-container-lowest text-xs text-on-surface border border-outline-variant focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isInviting}
                  className="h-9 px-3 text-xs"
                >
                  Invite
                </Button>
              </div>
              {inviteMsg ? (
                <p
                  className={`mt-1.5 text-[11px] font-medium ${
                    inviteMsg.isError ? "text-error" : "text-primary"
                  }`}
                >
                  {inviteMsg.text}
                </p>
              ) : null}
            </form>
          ) : null}

          {/* Footer with Room ID */}
          <div className="p-2.5 bg-surface-container-low rounded-b-xl flex items-center justify-between text-secondary border-t border-outline-variant/40">
            <span className="font-code-sm text-[11px]">Room ID: {roomId}</span>
            <button
              type="button"
              className="font-label-sm text-[11px] text-primary hover:text-on-primary-fixed-variant transition-colors flex items-center gap-1 cursor-pointer"
              onClick={() => setMembersOpen(false)}
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default WorkspaceHeader;
