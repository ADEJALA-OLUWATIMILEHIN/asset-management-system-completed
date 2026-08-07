import { CalendarClock, CheckCircle2, ClipboardList, Filter, Plus, TriangleAlert, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { getMaintenanceRecords, getMaintenanceStats, type MaintenanceRecord } from "@/api/MaintenanceApi/MaintenanceApi";
import { Link } from "react-router-dom";

const badge: Record<string, string> = {
  SCHEDULED: "bg-[#dce4ff] text-[#001970]",
  OVERDUE: "bg-[#ffd9d2] text-[#b00000]",
  PENDING: "bg-[#dbe5f0] text-[#516479]",
  COMPLETED: "bg-[#ffd9ca] text-[#8a2a12]",
};

const statConfig: Record<string, { icon: typeof CalendarClock; color: string }> = {
  Pending: { icon: ClipboardList, color: "#516479" },
  Scheduled: { icon: CalendarClock, color: "#001970" },
  Completed: { icon: CheckCircle2, color: "#8a2a12" },
  Overdue: { icon: TriangleAlert, color: "#c00000" },
};

export default function Maintenance() {
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [stats, setStats] = useState({ pending: 0, scheduled: 0, completed: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [recordsRes, statsRes] = await Promise.all([
          getMaintenanceRecords(),
          getMaintenanceStats(),
        ]);

        if (recordsRes.data?.maintenanceRecords) {
          setMaintenance(recordsRes.data.maintenanceRecords);
        }

        if (statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load maintenance data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const statsList = [
    { label: "Pending", value: stats.pending, note: "+12% vs LW" },
    { label: "Scheduled", value: stats.scheduled, note: "On Track" },
    { label: "Completed", value: stats.completed, note: "84% Rate" },
    { label: "Overdue", value: stats.overdue, note: "Critical" },
  ];

  const formatDate = (date: string | undefined | null): string => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return "₦0.00";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  return (
    <section className="mx-auto max-w-[1260px]">
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Management</h1>
          <p className="mt-2 text-lg text-[#30313d]">
            Lifecycle monitoring and vendor coordination for enterprise assets.
          </p>
        </div>
        <div className="flex gap-4">
          <Link to="/maintenance/schedule">
            <button className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-900 px-5 text-sm font-medium text-white hover:bg-blue-800">
             <Plus className="h-4 w-4" />
              Schedule Maintenance
            </button>
          </Link>
       
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        {statsList.map((stat) => {
          const config = statConfig[stat.label];
          const Icon = config.icon;
          return (
            <article className="rounded border border-[#c7c4d8] bg-white p-7" key={stat.label}>
              <div className="mb-6 flex items-start justify-between">
                <div className="grid h-14 w-14 place-items-center rounded bg-[#eceff5]">
                  <Icon className="h-7 w-7" style={{ color: config.color }} />
                </div>
                <span className="rounded-full bg-[#e7e7f0] px-3 py-1 text-sm" style={{ color: config.color }}>
                  {stat.note}
                </span>
              </div>
              <p className="text-lg">{stat.label}</p>
              <strong className="text-4xl" style={{ color: stat.label === "Overdue" ? "#c00000" : undefined }}>
                {String(stat.value).padStart(2, "0")}
              </strong>
              <div className="mt-6 h-1 rounded-full bg-[#e6e7ee]">
                <div className="h-1 w-[55%] rounded-full" style={{ background: config.color }} />
              </div>
            </article>
          );
        })}
      </div>

      <article className="mt-10 overflow-hidden rounded border border-[#c7c4d8] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#c7c4d8] p-5">
          <div className="flex flex-wrap items-center gap-4">
            <button className="inline-flex h-11 items-center gap-3 bg-[#e8e6ee] px-6 font-bold">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <span className="text-[#c7c4d8]">|</span>
            {["All Assets", "Critical Infrastructure", "Logistics"].map((filter, index) => (
              <span
                className={`rounded-full px-4 py-2 text-sm ${index === 0 ? "bg-[#001970] text-white" : "bg-[#e8e6ee]"}`}
                key={filter}
              >
                {filter}
              </span>
            ))}
          </div>
          <p className="text-sm">
            Sort by: <strong className="text-[#001970]">Next Service Date⌄</strong>
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-[#001970]" />
          </div>
        ) : error ? (
          <div className="border-t border-[#c7c4d8] p-6 text-center text-[#c00000]">
            <p>{error}</p>
          </div>
        ) : (
          <table className="w-full min-w-[900px] text-left text-lg">
            <thead className="bg-[#f0eef7] text-sm uppercase tracking-widest text-[#30313d]">
              <tr>
                {["Asset", "Maintenance Type", "Vendor", "Cost", "Last Service", "Next Service", "Status", "Actions"].map(
                  (head) => (
                    <th className="px-8 py-5" key={head}>
                      {head}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c7c4d8]">
              {maintenance.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-6 text-center text-[#606475]">
                    No maintenance records found
                  </td>
                </tr>
              ) : (
                maintenance.map((record) => (
                  <tr key={record.id}>
                    <td className="px-8 py-6 font-semibold">
                      {record.asset?.name || `Asset ID: ${record.assetId}`}
                      <p className="text-sm font-normal">
                        {record.asset?.assetCode || "N/A"}
                      </p>
                    </td>
                    <td className="px-8 py-6">{record.maintenanceType}</td>
                    <td className="px-8 py-6">{record.vendorId ? `Vendor ${record.vendorId}` : "Internal"}</td>
                    <td className="px-8 py-6">{formatCurrency(record.cost)}</td>
                    <td className="px-8 py-6">{formatDate(record.lastServiceDate)}</td>
                    <td className="px-8 py-6">{formatDate(record.nextServiceDate)}</td>
                    <td className="px-8 py-6">
                      <span className={`rounded-full px-4 py-2 text-sm font-bold ${badge[record.status]}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <Link className="font-bold text-[#001970] hover:underline" to={`/maintenance/schedule?assetId=${record.assetId}&recordId=${record.id}`}>
                        Update
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </article>
    </section>
  );
}
