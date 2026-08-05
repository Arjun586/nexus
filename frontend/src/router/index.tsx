import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import PageFallback from "../components/PageFallback";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicOnlyRoute from "../components/PublicOnlyRoute";
import AppLayout from "../layouts/AppLayout";
import {
  LazyDashboard,
  LazyLogin,
  LazyNotFound,
  LazyRegister,
  LazyWorkspacePage,
} from "./lazyRoutes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <Suspense fallback={<PageFallback />}>
          <LazyLogin />
        </Suspense>
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicOnlyRoute>
        <Suspense fallback={<PageFallback />}>
          <LazyRegister />
        </Suspense>
      </PublicOnlyRoute>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/dashboard",
        element: (
          <Suspense fallback={<PageFallback />}>
            <LazyDashboard />
          </Suspense>
        ),
      },
      {
        path: "/workspaces/:workspaceId",
        element: (
          <Suspense fallback={<PageFallback />}>
            <LazyWorkspacePage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<PageFallback />}>
        <LazyNotFound />
      </Suspense>
    ),
  },
]);
