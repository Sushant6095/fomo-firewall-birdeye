"use client";

import {
  LayoutDashboard,
  Shield,
  Activity,
  FolderOpen,
  Bell,
  HelpCircle,
  CodeXml
} from "lucide-react";
import { FloatingDockVertical, type DockItem } from "./ui/floating-dock";

const PRIMARY_NAV: DockItem[] = [
  { title: "Intelligence", href: "/", icon: <LayoutDashboard className="h-full w-full" /> },
  { title: "Threat Board", href: "/board", icon: <Shield className="h-full w-full" /> },
  { title: "Signal Matrix", href: "/signals", icon: <Activity className="h-full w-full" /> },
  { title: "Case File", href: "/case-file/DoGxJTRP7nKpRrjEYRr7nT9hZqEqL8mTjYR4hM7N2ZpL", icon: <FolderOpen className="h-full w-full" /> },
  { title: "Alerts", href: "/alerts", icon: <Bell className="h-full w-full" /> },
  { title: "API Docs", href: "/api/search?q=", icon: <CodeXml className="h-full w-full" /> },
  { title: "Support", href: "#", icon: <HelpCircle className="h-full w-full" /> }
];

export function SideNav() {
  return <FloatingDockVertical items={PRIMARY_NAV} />;
}
