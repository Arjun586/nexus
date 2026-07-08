import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { getAccessToken } from "../session/access-token";
import { getUser } from "../session/user";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = Boolean(getUser() && getAccessToken());

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
