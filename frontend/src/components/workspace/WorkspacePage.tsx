import { useCallback, useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";

import { getWorkspace, renameWorkspace } from "../../api/workspace";
import { useCollaboration } from "../../collaboration/useCollaboration";
import type { Workspace } from "../../types/workspace";
import { parseApiError } from "../../utils/parse-api-error";
import Skeleton from "../ui/Skeleton";
import Spinner from "../ui/Spinner";
import Toast from "../ui/Toast";
import CanvasContainer from "./CanvasContainer";
import WorkspaceHeader from "./WorkspaceHeader";

type AppLayoutContext = {
  onWorkspaceRenamed: (updated: Workspace) => void;
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
};

const WorkspacePage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const context = useOutletContext<AppLayoutContext>();
  const onWorkspaceRenamed = context?.onWorkspaceRenamed;
  const sidebarCollapsed = context?.sidebarCollapsed;
  const toggleSidebar = context?.toggleSidebar;

  // Connect to the Hocuspocus collaboration server for this workspace.
  const collabState = useCollaboration(workspaceId);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadWorkspace = async () => {
      if (!workspaceId) {
        setError("Workspace not found");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setWorkspace(null);

      try {
        const response = await getWorkspace(workspaceId);

        if (!cancelled) {
          setWorkspace(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          const { message } = parseApiError(err);
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const handleRename = useCallback(
    async (newName: string): Promise<boolean> => {
      if (!workspaceId) return false;

      try {
        const response = await renameWorkspace(workspaceId, { name: newName });
        setWorkspace(response.data);
        if (onWorkspaceRenamed) {
          onWorkspaceRenamed(response.data);
        }
        setError(null);
        return true;
      } catch (err) {
        const { message } = parseApiError(err);
        setError(message);
        return false;
      }
    },
    [workspaceId, onWorkspaceRenamed],
  );

  // Skeleton loading state for Workspace initialization
  if (isLoading) {
    return (
      <div className="flex h-full flex-col bg-surface overflow-hidden">
        {/* Header Skeleton */}
        <div className="h-[60px] shrink-0 border-b border-outline-variant bg-surface-container-lowest px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton height={20} width={70} className="rounded" />
            <span className="text-outline-variant font-code-sm">/</span>
            <Skeleton height={20} width={160} className="rounded" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton height={28} width={80} className="rounded-full" />
            <Skeleton height={32} width={90} className="rounded-lg" />
          </div>
        </div>

        {/* Canvas Placeholder Skeleton */}
        <div className="flex flex-1 items-center justify-center bg-surface">
          <div className="flex items-center gap-2.5 text-xs text-secondary font-medium">
            <Spinner size="md" />
            <span>Loading workspace canvas...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="flex h-full items-center justify-center bg-surface px-6">
        <Toast variant="error" message={error ?? "Workspace not found"} className="max-w-md" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-surface overflow-hidden">
      <WorkspaceHeader
        workspace={workspace}
        collabState={collabState}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
        onRename={handleRename}
      />
      <CanvasContainer collabState={collabState} />
    </div>
  );
};

export default WorkspacePage;
