import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { getAccessToken } from "../session/access-token";
import { getUser } from "../session/user";

type PublicOnlyRouteProps = {
  children: ReactNode;
};

const PublicOnlyRoute = ({ children }: PublicOnlyRouteProps) => {
  const isAuthenticated = Boolean(getUser() && getAccessToken());

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
