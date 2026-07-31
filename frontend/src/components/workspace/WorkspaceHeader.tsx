import { useEffect, useRef, useState } from "react";

import type { CollaborationState } from "../../collaboration/useCollaboration";
import type { Workspace } from "../../types/workspace";
import Button from "../ui/Button";

type WorkspaceHeaderProps = {
  workspace: Workspace;
  collabState?: CollaborationState | null;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onRename: (newName: string) => Promise<boolean>;
  onMembersOpen: () => void;
};

const ConnectionStatusBadge = ({ status }: { status?: string }) => {
  if (status === "connected") {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200/60 select-none">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span>Connected</span>
      </div>
    );
  }

  if (status === "connecting") {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200/60 select-none">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        <span>Connecting…</span>
      </div>
    );
  }

  if (status === "reconnecting") {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200/60 select-none">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
        <span>Reconnecting…</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 border border-rose-200/60 select-none">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
      <span>Offline</span>
    </div>
  );
};

const WorkspaceHeader = ({
  workspace,
  collabState,
  sidebarCollapsed,
  onToggleSidebar,
  onRename,
  onMembersOpen,
}: WorkspaceHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async () => {
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

  const canSave =
    editName.trim().length > 0 &&
    editName.trim() !== workspace.name &&
    !isRenaming;

  return (
    <header className="h-11 shrink-0 border-b border-gray-200 bg-white px-3.5 flex items-center justify-between z-10 select-none">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Sidebar Toggle Trigger */}
        {onToggleSidebar ? (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={`Toggle sidebar (${navigator.platform.indexOf("Mac") > -1 ? "⌘B" : "Ctrl+B"})`}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-gray-900 transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            </svg>
          </button>
        ) : null}

        {/* Workspace Title & Inline Rename */}
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSubmit();
                if (e.key === "Escape") handleCancel();
              }}
              disabled={isRenaming}
              maxLength={100}
              aria-label="Workspace title"
              className="rounded border border-gray-300 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => void handleSubmit()}
              isLoading={isRenaming}
              disabled={!canSave}
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
          <div className="flex items-center gap-1.5 min-w-0">
            <h1 className="text-xs font-semibold text-gray-900 tracking-tight truncate">
              {workspace.name}
            </h1>
            <button
              type="button"
              onClick={startEditing}
              aria-label="Rename workspace"
              className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 outline-none focus-visible:ring-1 focus-visible:ring-gray-900 transition-colors shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5"
              >
                <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Right Section: Connection Badge & Members Modal Trigger */}
      <div className="flex items-center gap-2.5 shrink-0">
        <ConnectionStatusBadge status={collabState?.status} />

        <Button
          variant="secondary"
          size="sm"
          onClick={onMembersOpen}
          className="py-1 px-2.5 text-xs min-h-[28px]"
          leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
            </svg>
          }
        >
          Members
        </Button>
      </div>
    </header>
  );
};

export default WorkspaceHeader;
