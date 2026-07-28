import { Link, useOutletContext } from "react-router-dom";
import { getUser } from "../session/user";
import type { Workspace } from "../types/workspace";

type DashboardContext = {
  workspaces?: Workspace[];
  isLoadingWorkspaces?: boolean;
};

const Dashboard = () => {
  const user = getUser();
  const context = useOutletContext<DashboardContext>();
  const workspaces = context?.workspaces ?? [];
  const isLoading = context?.isLoadingWorkspaces ?? false;

  const ownedWorkspaces = workspaces.filter((w) => w.ownerId === user?.id);
  const sharedWorkspaces = workspaces.filter((w) => w.ownerId !== user?.id);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Select a workspace below or from the sidebar to get started.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading workspaces...</p>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Owned Workspaces
            </h2>
            {ownedWorkspaces.length === 0 ? (
              <p className="text-sm text-gray-500">No owned workspaces yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ownedWorkspaces.map((workspace) => (
                  <Link
                    key={workspace.id}
                    to={`/workspaces/${workspace.id}`}
                    className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate font-semibold text-gray-900">
                          {workspace.name}
                        </h3>
                        <span className="shrink-0 rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white">
                          Owner
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-gray-400">
                      Created {new Date(workspace.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Shared Workspaces
            </h2>
            {sharedWorkspaces.length === 0 ? (
              <p className="text-sm text-gray-500">No shared workspaces yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sharedWorkspaces.map((workspace) => (
                  <Link
                    key={workspace.id}
                    to={`/workspaces/${workspace.id}`}
                    className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate font-semibold text-gray-900">
                          {workspace.name}
                        </h3>
                        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          Shared
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-gray-400">
                      Created {new Date(workspace.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
