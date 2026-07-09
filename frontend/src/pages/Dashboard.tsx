import { getUser } from "../session/user";

const Dashboard = () => {
  const user = getUser();

  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Welcome{user?.name ? `, ${user.name}` : ""}
      </h1>
      <p className="mt-3 max-w-md text-center text-sm text-gray-600">
        Select a workspace from the sidebar, or create a new one to get started.
      </p>
    </div>
  );
};

export default Dashboard;
