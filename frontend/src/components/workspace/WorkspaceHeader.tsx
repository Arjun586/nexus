import type { Workspace } from "../../types/workspace";

type WorkspaceHeaderProps = {
  workspace: Workspace;
};

const formatCreatedAt = (createdAt: string): string => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const WorkspaceHeader = ({ workspace }: WorkspaceHeaderProps) => {
  return (
    <header className="shrink-0 border-b border-gray-200 bg-white px-6 py-4">
      <h1 className="text-lg font-semibold text-gray-900">{workspace.name}</h1>
      <p className="mt-1 text-sm text-gray-500">
        Created {formatCreatedAt(workspace.createdAt)}
      </p>
    </header>
  );
};

export default WorkspaceHeader;
