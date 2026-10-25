"use client";

import Breadcrumbs from "./breadcrumbs";

interface Crumb {
  label: string;
  href?: string;
}

interface PageShellProps {
  title: string;
  description?: string;
  segments: Crumb[];
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function PageShell({ title, description, segments, actions, children }: PageShellProps) {
  return (
    <div className="p-6">
      <Breadcrumbs segments={segments} />
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
