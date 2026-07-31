import Spinner from "./ui/Spinner";

const PageFallback = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-gray-50 text-gray-600">
    <div className="flex items-center gap-2 text-xs font-medium">
      <Spinner size="md" />
      <span>Loading...</span>
    </div>
  </div>
);

export default PageFallback;
