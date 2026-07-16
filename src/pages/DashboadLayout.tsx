import {
  BarChart3,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Users,
  Wrench,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { Topbar } from "../components/Topbar/topbar";
import ReminderAlerts from "../components/ReminderAlerts";

const navItems = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Assets", to: "/assets", icon: Package },
  { label: "Documents", to: "/documents", icon: FileText },
  { label: "Calendar", to: "/calendar", icon: CalendarDays },
  { label: "Maintenance", to: "/maintenance", icon: Wrench },
  { label: "Reports", to: "/reports", icon: BarChart3 },
  { label: "Users", to: "/users", icon: Users },
];

const settingsItem = { label: "Settings", to: "/settings", icon: Settings };

export default function DashboardLayout() {
  const SettingsIcon = settingsItem.icon;

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-[#11111a]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[290px] shrink-0 flex-col bg-[#2d2f35] text-white md:flex">
          <div className="px-7 py-6">
            <img src="/Logo.jpg" alt="Sterling Assurance Logo" className="h-12 w-auto" />
            <p className="mt-1 max-w-[180px] text-lg leading-7 text-white/75">
              Asset Lifecycle Management
            </p>
          </div>

          <nav className="mt-8 flex flex-1 flex-col gap-2 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.label}
                  className={({ isActive }) =>
                    [
                      "flex h-11 items-center gap-4 rounded px-5 text-base transition",
                      "hover:bg-[#263f91] hover:text-white",
                      isActive ? "bg-[#263f91] text-[#9db4fb]" : "text-white",
                    ].join(" ")
                  }
                  end={item.to === "/"}
                  to={item.to}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="px-3 py-6">
            <NavLink
              className={({ isActive }) =>
                [
                  "flex h-11 items-center gap-4 rounded px-5 text-base transition",
                  "hover:bg-[#263f91] hover:text-white",
                  isActive ? "bg-[#263f91] text-[#9db4fb]" : "text-white",
                ].join(" ")
              }
              to={settingsItem.to}
            >
              <SettingsIcon className="h-5 w-5" />
              {settingsItem.label}
            </NavLink>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <ReminderAlerts />
          <main className="flex-1 overflow-auto px-5 py-8 sm:px-8 lg:px-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
