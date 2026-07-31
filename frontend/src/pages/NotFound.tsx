import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

const NotFound = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">404</h1>
        <p className="mt-2 text-sm text-gray-600">The page you requested could not be found.</p>
      </div>
      <Link to="/dashboard" className="mt-2">
        <Button variant="primary" size="sm">
          Return to Dashboard
        </Button>
      </Link>
    </main>
  );
};

export default NotFound;
