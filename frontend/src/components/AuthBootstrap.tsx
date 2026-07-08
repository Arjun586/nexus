import { useEffect, useState, type ReactNode } from "react";

import { restoreSession } from "../session/restore-session";
import AuthLoading from "./AuthLoading";

type AuthBootstrapProps = {
  children: ReactNode;
};

const AuthBootstrap = ({ children }: AuthBootstrapProps) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    restoreSession().finally(() => {
      if (!cancelled) {
        setIsReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isReady) {
    return <AuthLoading />;
  }

  return children;
};

export default AuthBootstrap;
