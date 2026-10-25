"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type SidebarContextType = {
  collapsed: boolean;
  onToggle: () => void;
};

const SidebarContext = createContext<SidebarContextType>({ collapsed: false, onToggle: () => {} });

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, onToggle: () => setCollapsed((v) => !v) }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
