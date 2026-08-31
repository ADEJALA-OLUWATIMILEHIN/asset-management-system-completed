import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  UserRoundPlus,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getUsers, type ApiUser } from "@/api/Getusers";

const roleClass: Record<string, string> = {
  "Super Admin": "bg-[#263f91] text-[#b7c6ff] border border-[#001970]",
  Admin: "bg-[#d7e7fb] text-[#536278]",
  Manager: "bg-[#e3e1e8] text-[#2c2d36]",
  Viewer: "bg-[#e6e3ea] text-[#2c2d36]",
};

const statusClass: Record<string, string> = {
  Active: "bg-[#c9f5df] text-[#007042]",
  Pending: "bg-[#fff0c4] text-[#9a3b00]",
  Deactivated: "bg-[#ffd8d8] text-[#b50000]",
};

const bars = ["h-5 bg-[#c8d1df]", "h-8 bg-[#c0cada]", "h-4 bg-[#c8d1df]", "h-10 bg-[#9aa9c1]", "h-12 bg-[#001970]"];
const USERS_PER_PAGE = 10;

const getPaginationItems = (currentPage: number, totalPages: number): Array<number | "ellipsis"> => {
  const pages = [1, 2, 3, currentPage - 1, currentPage, currentPage + 1, totalPages]
    .filter((page) => page >= 1 && page <= totalPages)
    .filter((page, index, allPages) => allPages.indexOf(page) === index)
    .sort((first, second) => first - second);

  return pages.flatMap((page, index) => {
    const previousPage = pages[index - 1];
    return index > 0 && page - previousPage > 1 ? ["ellipsis", page] : [page];
  });
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
};

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MANAGER: "Manager",
  VIEWER: "Viewer",
};

const statusLabel: Record<string, string> = {
  ACTIVE: "Active",
  PENDING: "Pending",
  DEACTIVATED: "Deactivated",
};

function normalizeUser(user: ApiUser): UserRow {
  const name = user.name ?? "Unnamed User";
  const role = user.role ? roleLabel[user.role] ?? user.role : "Viewer";
  const status = user.status ? statusLabel[user.status] ?? user.status : "Pending";
  const department = user.department?.name ?? "Unassigned";

  return {
    id: String(user.id ?? user.email ?? name),
    name,
    email: user.email ?? "No email provided",
    role,
    department,
    status,
  };
}

export default function Users() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await getUsers();
        const fetchedUsers = Array.isArray(result.data?.users) ? result.data.users : [];

        if (!isMounted) return;

        if (!result.data) {
          setError(result.message);
        }

        setUsers(fetchedUsers.map(normalizeUser));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(users.length / USERS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedUsers = useMemo(
    () => users.slice((activePage - 1) * USERS_PER_PAGE, activePage * USERS_PER_PAGE),
    [activePage, users]
  );
  const paginationItems = useMemo(() => getPaginationItems(activePage, totalPages), [activePage, totalPages]);
  const shownStart = users.length > 0 ? (activePage - 1) * USERS_PER_PAGE + 1 : 0;
  const shownEnd = Math.min(activePage * USERS_PER_PAGE, users.length);

  return (
    <section className="mx-auto max-w-[1240px]">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-3 text-sm">
            <strong className="text-[#001970]">Management</strong>
            <span className="text-[#001970]">&gt;</span>
            <span className="text-[#30313d]">User Directory</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-normal text-[#11111a]">User Management</h1>
          <p className="mt-2 text-base text-[#30313d]">
            Manage institutional access, departmental roles, and security permissions.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* <button className="inline-flex h-12 items-center gap-3 rounded border border-[#c7c4d8] bg-white px-6 font-bold text-[#001970]">
            <Download className="h-5 w-5" />
            Export
          </button> */}
        
          {/* <Link to="/users/new" className="inline-flex h-12 items-center gap-3 rounded bg-[#001970] px-6 font-bold text-white">
            <UserRoundPlus className="h-5 w-5" />
            Add User
          </Link> */}
          <Link to="/users/new">
            <button className="inline-flex h-12 items-center gap-2 rounded-lg bg-blue-900 px-5 text-sm font-medium text-white hover:bg-blue-800">
             <UserRoundPlus className="h-5 w-5" />
            Add User
            </button>
          </Link>
        </div>
      </div>

      <article className="overflow-hidden rounded-lg border border-[#c7c4d8] bg-white">
        <div className="flex gap-8 border-b border-[#c7c4d8] px-8 pt-5">
          {["User List", "Permissions Matrix"].map((tab, index) => (
            <button
              className={`px-2 pb-5 font-medium ${index === 0 ? "border-b-2 border-[#001970] text-[#001970]" : "text-[#1f2030]"}`}
              key={tab}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead className="bg-[#f1eff8] text-sm uppercase tracking-[0.12em] text-[#2c2d36]">
              <tr>
                <th className="px-8 py-5">Name</th>
                <th className="px-8 py-5">Email</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Department</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c7c4d8]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-6 text-center text-[#30313d]">
                    Loading users...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-8 py-6 text-center text-[#b50000]">
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-6 text-center text-[#30313d]">
                    No users found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr className="text-base" key={user.id}>
                    <td className="px-8 py-6">
                      <strong className="max-w-[180px] text-lg leading-6">{user.name}</strong>
                    </td>
                    <td className="px-8 py-6 text-[#30313d]">{user.email}</td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex min-w-[66px] justify-center rounded-sm px-3 py-1 text-sm font-bold uppercase ${roleClass[user.role] ?? roleClass.Viewer}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-[#30313d]">{user.department}</td>
                    <td className="px-8 py-6">
                      <span className={`rounded-full px-3 py-1 text-sm font-bold uppercase ${statusClass[user.status] ?? statusClass.Pending}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right text-[#606475]">
                      <button className="inline-grid h-8 w-8 place-items-center rounded hover:bg-[#f1eff8]" aria-label={`Actions for ${user.name}`}>
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 px-8 py-5 text-base sm:flex-row sm:items-center sm:justify-between">
          <span>Showing {shownStart} - {shownEnd} of {users.length} users</span>
          <div className="flex items-center gap-3">
            <button
              aria-label="Previous page"
              className="grid h-9 w-9 place-items-center rounded border border-[#c7c4d8] text-[#606475] disabled:border-[#e3e0ec] disabled:text-[#c7c4d8]"
              disabled={activePage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {paginationItems.map((item, index) =>
              item === "ellipsis" ? (
                <span className="px-1 text-[#11111a]" key={`ellipsis-${index}`}>...</span>
              ) : (
                <button
                  aria-current={item === activePage ? "page" : undefined}
                  className={`grid h-9 w-10 place-items-center rounded border border-[#c7c4d8] ${item === activePage ? "bg-[#001970] text-white" : "bg-white"}`}
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  type="button"
                >
                  {item}
                </button>
              )
            )}
            <button
              aria-label="Next page"
              className="grid h-9 w-9 place-items-center rounded border border-[#c7c4d8] text-[#606475] disabled:border-[#e3e0ec] disabled:text-[#c7c4d8]"
              disabled={activePage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </article>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.45fr_0.85fr_1.15fr]">
        <article className="relative overflow-hidden rounded-lg bg-[#082a82] p-8 text-white">
          <div className="relative z-10">
            <p className="font-bold text-[#bcc8ff]">Active Licenses</p>
            <strong className="mt-4 block text-5xl">124 / 150</strong>
            <p className="mt-6 max-w-[470px] text-lg leading-7 text-white/90">
              You are using 83% of your enterprise seat capacity. Contact your account manager to expand.
            </p>
            <button className="mt-9 rounded bg-white/18 px-6 py-3 font-bold">Manage Seats</button>
          </div>
          <Check className="absolute -bottom-7 right-4 h-36 w-36 rotate-12 text-white/10" />
        </article>

        <article className="rounded-lg border border-[#c7c4d8] bg-white p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-medium">System Activity</h2>
            <ArrowUpRight className="h-6 w-6 text-[#007042]" />
          </div>
          <strong className="text-3xl">+12.4%</strong>
          <div className="mt-10 flex h-14 items-end gap-2 bg-[#fbfcff] px-3">
            {bars.map((bar, index) => (
              <div className={`w-9 rounded-t-sm ${bar}`} key={index} />
            ))}
          </div>
          <p className="mt-9 text-sm text-[#30313d]">Last 7 days performance metrics</p>
        </article>

        <article className="rounded-lg border border-[#c7c4d8] bg-white p-8">
          <h2 className="mb-7 font-medium">Security Health</h2>
          <div className="flex items-center gap-6">
            <div className="grid h-20 w-20 place-items-center rounded-full border-[7px] border-[#001970] text-sm font-bold">
              92%
            </div>
            <div>
              <strong>Excellent</strong>
              <p className="text-sm text-[#30313d]">2FA enabled for 118/124 users.</p>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-4 gap-3">
            <div className="h-1 rounded bg-[#c9f5df]" />
            <div className="h-1 rounded bg-[#c9f5df]" />
            <div className="h-1 rounded bg-[#c9f5df]" />
            <div className="h-1 rounded bg-[#eef1f6]" />
          </div>
        </article>
      </div>
    </section>
  );
}
