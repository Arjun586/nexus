import Spinner from "./ui/Spinner";

const AuthLoading = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-900">
      <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
        <Spinner size="md" />
        <span>Restoring session...</span>
      </div>
    </main>
  );
};

export default AuthLoading;
