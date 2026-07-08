import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">404 — Page Not Found</h1>
      <Link to="/login" className="text-sm text-gray-600 underline">
        Go to Login
      </Link>
    </main>
  );
};

export default NotFound;
