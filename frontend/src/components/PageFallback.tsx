import AuthLoading from "./AuthLoading";

export const PageFallback = () => {
  return <AuthLoading headline="Loading workspace…" subtext="Please wait a moment" />;
};

export default PageFallback;
