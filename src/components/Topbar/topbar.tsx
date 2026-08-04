import { Bell, ChevronDown, Download, FileWarning, LogOut, Plus, Search, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "@/api/LoginApi/LoginApi";
import { getMaintenanceRecords, type MaintenanceRecord } from "@/api/MaintenanceApi/MaintenanceApi";
import { searchRecords, type SearchResult } from "@/api/SearchApi";

const topLinks = [
  { label: "Dashboard", to: "/" },
  { label: "Assets", to: "/assets" },
  { label: "Maintenance", to: "/maintenance" },
];

const pageConfig: Record<string, { title: string; search: string; cta?: string; ctaTo?: string }> = {
  "/reports": { title: "Reports", search: "Search reports...", cta: "New Report" },
  "/maintenance": {
    title: "",
    search: "Search maintenance logs...",
    cta: "Schedule Maintenance",
    ctaTo: "/maintenance/schedule",
  },
  "/documents": { title: "", search: "Search documents...", cta: "Upload Document", ctaTo: "/documents/new" },
  "/calendar": { title: "", search: "Search events...", cta: "Add Event", ctaTo: "/calendar" },
  "/users": { title: "", search: "Search users, roles, departments...", cta: "Add User" },
  "/audit-logs": { title: "", search: "Search logs, IDs, or users...", cta: "Export" },
  "/assets": { title: "", search: "Quick Search..." },
  "/": { title: "", search: "Search assets, records...", cta: "New Asset" },
};

export const Topbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dueMaintenance, setDueMaintenance] = useState<MaintenanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const config = pathname.startsWith("/assets") ? pageConfig["/assets"] : pageConfig[pathname] ?? pageConfig["/"];
  const cta = config.cta;
  const isReport = pathname === "/reports";
  const isAudit = pathname === "/audit-logs";
  const isUsers = pathname === "/users";
  const user = getCurrentUser();
  const userName = user?.name ?? "Signed-in user";
  const userInitials = user?.initials || userName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const userDepartment = user?.department?.name ?? "No department assigned";
  const userRole = user?.role.replaceAll("_", " ") ?? "User";

  useEffect(() => {
    let mounted = true;

    const loadDueMaintenance = async () => {
      const result = await getMaintenanceRecords();
      if (!mounted || !result.data) return;

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      setDueMaintenance(result.data.maintenanceRecords.filter((record) =>
        record.status !== "COMPLETED" && (
          record.status === "OVERDUE" ||
          (record.nextServiceDate !== null && record.nextServiceDate !== undefined && new Date(record.nextServiceDate) <= endOfToday)
        )
      ));
    };

    void loadDueMaintenance();
    const interval = window.setInterval(() => void loadDueMaintenance(), 60_000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const query = searchTerm.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        setSearchResults(await searchRecords(query));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const selectSearchResult = (result: SearchResult) => {
    setSearchOpen(false);
    setSearchTerm("");
    navigate(result.to);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex h-[72px] shrink-0 items-center gap-7 border-b border-slate-200 bg-white px-8">
      <Link to="/" className="text-lg font-bold text-blue-950">
        ALMS
      </Link>

      {config.title && (
        <div className="text-2xl font-bold text-slate-900">{config.title}</div>
      )}

      {!isReport && (
        <nav className="hidden items-center gap-7 text-sm lg:flex">
          {topLinks.map((link) => (
            <NavLink
              className={({ isActive }) =>
                [
                  "border-b-2 border-transparent py-6 font-medium transition",
                  isActive ? "border-blue-900 text-blue-900" : "text-slate-500 hover:text-slate-700",
                ].join(" ")
              }
              end={link.to === "/"}
              key={link.label}
              to={link.to}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}

      <div className="relative ml-auto hidden w-full max-w-[390px] md:block">
        <Search className="pointer-events-none absolute left-3 mt-3 h-4 w-4 text-slate-400" />
        <input
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-600 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-900/20"
          placeholder={config.search}
          onChange={(event) => { setSearchTerm(event.target.value); setSearchOpen(true); }}
          onFocus={() => setSearchOpen(true)}
          type="search"
          value={searchTerm}
        />
        {searchOpen && searchTerm.trim().length >= 2 && (
          <div className="absolute top-[calc(100%+0.5rem)] z-50 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Search results</div>
            {searching ? <p className="px-3 py-4 text-sm text-slate-500">Searching…</p> : searchResults.length === 0 ? <p className="px-3 py-4 text-sm text-slate-500">No matching assets, maintenance, or expiry records.</p> : (
              <div className="max-h-80 overflow-y-auto py-1">
                {searchResults.map((result) => {
                  const Icon = result.type === "maintenance" ? Wrench : result.type === "expiry" ? FileWarning : Search;
                  return <button className="flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-slate-50" key={result.id} onMouseDown={(event) => event.preventDefault()} onClick={() => selectSearchResult(result)} type="button"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-900" /><span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{result.title}</span><span className="block truncate text-xs text-slate-500">{result.subtitle}</span></span></button>;
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {(isAudit || isReport) && (
        <button className="hidden h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-blue-900 hover:bg-slate-50 sm:inline-flex">
          <Download className="h-4 w-4" />
          Export
        </button>
      )}

      {!isAudit && !isUsers && cta === "New Asset" && (
        <Link
          className="inline-flex h-11 items-center gap-2 rounded-lg  text-white bg-blue-900 px-5 text-sm font-medium hover:bg-blue-800"
          to="/assets/new"
        >
          <Plus className="h-4 w-4" />
          {cta}
        </Link>
      )}
      {!isAudit && !isUsers && cta && cta !== "New Asset" && (
        <Link
          className="inline-flex h-11 items-center gap-2 rounded-lg text-white bg-blue-900 px-5 text-sm font-medium text-white hover:bg-blue-800"
          to={config.ctaTo ?? pathname}
        >
          <Plus className="h-4 w-4" />
          {cta}
        </Link>
      )}

      <div className="relative">
        <button
          aria-expanded={notificationsOpen}
          aria-haspopup="menu"
          aria-label="Maintenance notifications"
          className="relative grid h-10 w-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          onClick={() => setNotificationsOpen((open) => !open)}
          type="button"
        >
          <Bell className="h-5 w-5" />
          {dueMaintenance.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />}
        </button>

        {notificationsOpen && (
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(24rem,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white p-2 shadow-lg" role="menu">
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
              <p className="font-semibold text-slate-900">Maintenance due</p>
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">{dueMaintenance.length}</span>
            </div>
            {dueMaintenance.length > 0 ? (
              <div className="max-h-80 overflow-y-auto py-1">
                {dueMaintenance.map((record) => (
                  <Link className="block rounded-md px-3 py-3 hover:bg-slate-50" key={record.id} onClick={() => setNotificationsOpen(false)} to="/maintenance">
                    <div className="flex items-start gap-2">
                      <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{record.maintenanceType}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{record.asset?.name ?? `Asset #${record.assetId}`} · Due {record.nextServiceDate ? new Date(record.nextServiceDate).toLocaleDateString() : "now"}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="px-3 py-5 text-center text-sm text-slate-500">No maintenance is currently due.</p>
            )}
            <Link className="block border-t border-slate-100 px-3 py-2 text-center text-sm font-semibold text-blue-900 hover:bg-slate-50" onClick={() => setNotificationsOpen(false)} to="/maintenance">
              View maintenance records
            </Link>
          </div>
        )}
      </div>

      <div className="hidden h-9 border-l border-slate-200 sm:block" />

      <div className="relative hidden sm:block">
        <button
          aria-expanded={accountMenuOpen}
          aria-haspopup="menu"
          className="flex items-center gap-2 rounded-lg px-2 py-1 text-left hover:bg-slate-50"
          onClick={() => setAccountMenuOpen((open) => !open)}
          type="button"
        >
          <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-950 text-xs font-bold text-white" title={userInitials}>
            {userInitials}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900">{userName}</p>
            <p className="text-xs text-slate-500">{userDepartment} · {userRole}</p>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${accountMenuOpen ? "rotate-180" : ""}`} />
        </button>

        {accountMenuOpen && (
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg" role="menu">
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              onClick={handleLogout}
              role="menuitem"
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        )}
        </div>
    </header>
  );
};
