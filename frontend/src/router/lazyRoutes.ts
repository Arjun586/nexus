import { lazy } from "react";

export const LazyDashboard = lazy(() => import("../pages/Dashboard"));
export const LazyLogin = lazy(() => import("../pages/Login"));
export const LazyRegister = lazy(() => import("../pages/Register"));
export const LazyNotFound = lazy(() => import("../pages/NotFound"));
export const LazyWorkspacePage = lazy(() => import("../components/workspace/WorkspacePage"));
