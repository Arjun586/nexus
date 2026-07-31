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
import MembersModal from "./MembersModal";
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
  const [membersOpen, setMembersOpen] = useState(false);

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
      <div className="flex h-full flex-col bg-gray-50 overflow-hidden">
        {/* Header Skeleton */}
        <div className="h-11 shrink-0 border-b border-gray-200 bg-white px-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton height={20} width={20} variant="rectangular" />
            <Skeleton height={18} width={140} />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton height={20} width={80} />
            <Skeleton height={28} width={75} />
          </div>
        </div>

        {/* Canvas Placeholder Skeleton */}
        <div className="flex flex-1 items-center justify-center bg-gray-50">
          <div className="flex items-center gap-2.5 text-xs text-gray-500 font-medium">
            <Spinner size="md" />
            <span>Loading workspace canvas...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 px-6">
        <Toast variant="error" message={error ?? "Workspace not found"} className="max-w-md" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gray-50 overflow-hidden">
      <WorkspaceHeader
        workspace={workspace}
        collabState={collabState}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
        onRename={handleRename}
        onMembersOpen={() => setMembersOpen(true)}
      />
      <CanvasContainer collabState={collabState} />

      {membersOpen ? (
        <MembersModal
          workspaceId={workspace.id}
          ownerId={workspace.ownerId}
          onClose={() => setMembersOpen(false)}
        />
      ) : null}
    </div>
  );
};

export default WorkspacePage;
