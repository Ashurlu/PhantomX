import { useState } from "react";
import {
  Activity,
  KeyRound,
  ScrollText,
  Settings2,
  Shield,
  Users as UsersIcon,
  Wrench,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuditLog, useSystemStatus, useUsers } from "@/lib/api";
import { ApiKeysTab } from "./ApiKeysTab";
import { UsersTab } from "./UsersTab";
import { DataSourceTab } from "./DataSourceTab";
import { StatusTab } from "./StatusTab";
import { AuditLogTab } from "./AuditLogTab";
import { MaintenanceTab } from "./MaintenanceTab";

type AdminTab = "keys" | "users" | "data" | "audit" | "status" | "maintenance";

const TABS: {
  id: AdminTab;
  label: string;
  description: string;
  icon: typeof KeyRound;
}[] = [
  {
    id: "keys",
    label: "API Keys",
    description: "n8n, pentest engine, AI, and WinRM credentials",
    icon: KeyRound,
  },
  {
    id: "users",
    label: "Users",
    description: "Accounts, roles, and access control",
    icon: UsersIcon,
  },
  {
    id: "data",
    label: "Data Source",
    description: "Mock vs live upstream mode",
    icon: Settings2,
  },
  {
    id: "audit",
    label: "Audit Log",
    description: "Security-relevant actions across the platform",
    icon: ScrollText,
  },
  {
    id: "status",
    label: "System Status",
    description: "Connectivity and integration health",
    icon: Activity,
  },
  {
    id: "maintenance",
    label: "Maintenance",
    description: "Export config and reset demo data",
    icon: Wrench,
  },
];

export function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("keys");
  const status = useSystemStatus();
  const users = useUsers();
  const audit = useAuditLog();

  const activeMeta = TABS.find((t) => t.id === tab)!;
  const live = status.data?.dataSource === "live";
  const userCount = users.data?.length ?? 0;
  const auditCount = audit.data?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-accent" />
              Platform administration
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
              Admin Console
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Integration keys, user lifecycle, data source mode, and operational health — in one
              place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 px-3 py-1",
                live ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400" : ""
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  live ? "bg-emerald-500" : "bg-amber-500"
                )}
              />
              {live ? "Live data" : "Mock data"}
            </Badge>
            <Badge variant="secondary">{userCount} users</Badge>
            <Badge variant="secondary">{auditCount} audit events</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar nav */}
        <nav className="flex flex-col gap-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors",
                  active
                    ? "border-accent/40 bg-accent/10 text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn("mt-0.5 h-4 w-4 shrink-0", active ? "text-accent" : "")}
                />
                <span>
                  <span className="block text-sm font-semibold">{t.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug opacity-80">
                    {t.description}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="min-w-0">
          <Card className="mb-4 border-border/60 bg-muted/20 px-4 py-3">
            <p className="text-sm font-medium text-foreground">{activeMeta.label}</p>
            <p className="text-xs text-muted-foreground">{activeMeta.description}</p>
          </Card>

          {tab === "keys" && <ApiKeysTab />}
          {tab === "users" && <UsersTab />}
          {tab === "data" && <DataSourceTab />}
          {tab === "audit" && <AuditLogTab />}
          {tab === "status" && <StatusTab />}
          {tab === "maintenance" && <MaintenanceTab />}
        </div>
      </div>
    </div>
  );
}
