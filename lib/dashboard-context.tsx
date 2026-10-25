"use client";

import { createContext, useContext } from "react";

export type DashboardData = any;

export const DashboardContext = createContext<{
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}>({ data: null, loading: true, error: null, refetch: () => {} });

export const useDashboard = () => useContext(DashboardContext);
