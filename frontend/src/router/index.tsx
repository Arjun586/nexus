import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import PageFallback from "../components/PageFallback";
import ProtectedRoute from "../components/ProtectedRoute";
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
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<PageFallback />}>
        <LazyLogin />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<PageFallback />}>
        <LazyRegister />
      </Suspense>
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
