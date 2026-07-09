import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getWorkspace } from "../../api/workspace";
import type { Workspace } from "../../types/workspace";
import { parseApiError } from "../../utils/parse-api-error";
import CanvasContainer from "./CanvasContainer";
import WorkspaceHeader from "./WorkspaceHeader";

const WorkspacePage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) {
      setError("Workspace not found");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadWorkspace = async () => {
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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <p className="text-sm text-gray-600">Loading workspace...</p>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <p className="text-sm text-red-700" role="alert">
          {error ?? "Workspace not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <WorkspaceHeader workspace={workspace} />
      <CanvasContainer />
    </div>
  );
};

export default WorkspacePage;
